"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import dbConnect from "@/lib/db/connection";
import {BlockedStock} from "@/lib/db/models/BlockedStock";
import {Brand} from "@/lib/db/models/Brand";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {InventoryMovement} from "@/lib/db/models/InventoryMovement";
import {Order, type OrderWorkflowStatus} from "@/lib/db/models/Order";
import {Product} from "@/lib/db/models/Product";
import {User} from "@/lib/db/models/User";
import {Variant} from "@/lib/db/models/Variant";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {calculateDiscountBreakdown, sumDiscountBreakdowns, type DiscountMode} from "@/lib/utils/discounts";
import {
  buildWarehouseAvailability,
  selectWarehouseForQuantity,
  sumEffectiveAvailability,
  type WarehouseAvailability,
} from "@/lib/utils/inventory";

type NewOrderLine = {
  variantId: string;
  quantity: number;
  warehouseId?: string;
  lineDiscountValue?: number;
};

type EnrichedOrderItem = {
  variantId: string;
  sku: string;
  name: string;
  brandId: string | null;
  brandName: string;
  warehouseId: string | null;
  warehouseCode: string;
  quantity: number;
  mrp: number;
  gstRate: number;
  lineDiscountValue: number;
  lineDiscountAmount: number;
  grossAmount: number;
  taxableAmount: number;
  taxAmount: number;
  finalAmount: number;
};

function workflowFromLegacyStatus(status: string): OrderWorkflowStatus {
  switch (status.toLowerCase()) {
    case "pending":
      return "submitted";
    case "checkavailability":
      return "availability_check";
    case "approved":
      return "approved";
    case "completed":
      return "completed";
    default:
      return "draft";
  }
}

function normalizeObjectId(value: unknown) {
  const parsed = String(value ?? "").trim();
  return parsed || null;
}

async function buildParticipantSnapshot(userId?: string) {
  if (!userId) {
    return undefined;
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    return undefined;
  }

  return {
    legacyId: undefined,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.roleKey,
    code: user.code,
    gstin: user.gstin,
    address: user.address,
  };
}

async function adjustInventoryLevel({
  variantId,
  warehouseId,
  onHandDelta = 0,
  reservedDelta = 0,
}: {
  variantId: string;
  warehouseId: string;
  onHandDelta?: number;
  reservedDelta?: number;
}) {
  const level = await InventoryLevel.findOne({variantId, warehouseId});

  if (!level) {
    throw new Error(`Missing inventory level for variant ${variantId} in warehouse ${warehouseId}.`);
  }

  level.onHand = Math.max(0, level.onHand + onHandDelta);
  level.reserved = Math.max(0, level.reserved + reservedDelta);
  level.available = Math.max(0, level.onHand - level.reserved - level.blocked);
  await level.save();

  return level;
}

async function reserveInventoryForOrder(orderId: string, items: EnrichedOrderItem[]) {
  for (const item of items) {
    const variantId = normalizeObjectId(item.variantId);
    const warehouseId = normalizeObjectId(item.warehouseId);
    const quantity = Number(item.quantity ?? 0);

    if (!variantId || !warehouseId || quantity <= 0) {
      continue;
    }

    await adjustInventoryLevel({
      variantId,
      warehouseId,
      reservedDelta: quantity,
    });

    await InventoryMovement.create({
      variantId,
      warehouseId,
      type: "reservation",
      delta: quantity,
      reason: "Order reservation",
      referenceType: "order",
      referenceId: orderId,
      notes: `Reserved ${quantity} units for ${orderId}.`,
    });
  }
}

async function releaseInventoryForOrder(orderId: string, items: EnrichedOrderItem[]) {
  for (const item of items) {
    const variantId = normalizeObjectId(item.variantId);
    const warehouseId = normalizeObjectId(item.warehouseId);
    const quantity = Number(item.quantity ?? 0);

    if (!variantId || !warehouseId || quantity <= 0) {
      continue;
    }

    await adjustInventoryLevel({
      variantId,
      warehouseId,
      reservedDelta: -quantity,
    });

    await InventoryMovement.create({
      variantId,
      warehouseId,
      type: "release",
      delta: -quantity,
      reason: "Order released",
      referenceType: "order",
      referenceId: orderId,
      notes: `Released ${quantity} units for ${orderId}.`,
    });
  }
}

async function shipInventoryForOrder(orderId: string, items: EnrichedOrderItem[]) {
  for (const item of items) {
    const variantId = normalizeObjectId(item.variantId);
    const warehouseId = normalizeObjectId(item.warehouseId);
    const quantity = Number(item.quantity ?? 0);

    if (!variantId || !warehouseId || quantity <= 0) {
      continue;
    }

    await adjustInventoryLevel({
      variantId,
      warehouseId,
      onHandDelta: -quantity,
      reservedDelta: -quantity,
    });

    await InventoryMovement.create({
      variantId,
      warehouseId,
      type: "shipment",
      delta: -quantity,
      reason: "Order completed",
      referenceType: "order",
      referenceId: orderId,
      notes: `Shipped ${quantity} units for ${orderId}.`,
    });
  }
}

async function applyOrderInventoryTransition({
  orderId,
  legacyOrderId,
  currentStatus,
  nextStatus,
  items,
}: {
  orderId: string;
  legacyOrderId?: number;
  currentStatus: OrderWorkflowStatus;
  nextStatus: OrderWorkflowStatus;
  items: EnrichedOrderItem[];
}) {
  if (legacyOrderId) {
    return [] as string[];
  }

  if (
    currentStatus !== "completed" &&
    (nextStatus === "rejected" || nextStatus === "cancelled")
  ) {
    await releaseInventoryForOrder(orderId, items);
    return [
      `Inventory reservations released because the order moved to ${nextStatus}.`,
    ];
  }

  if (
    nextStatus === "completed" &&
    currentStatus !== "completed" &&
    currentStatus !== "rejected" &&
    currentStatus !== "cancelled"
  ) {
    await shipInventoryForOrder(orderId, items);
    return ["Inventory shipped and reservations converted to stock deduction."];
  }

  return [] as string[];
}

export async function saveOrder(formData: FormData) {
  await dbConnect();

  const items = JSON.parse(String(formData.get("itemsJson") ?? "[]")) as NewOrderLine[];
  if (!items.length) {
    throw new Error("At least one order item is required.");
  }

  const discountType = String(formData.get("discountType") ?? "inclusive").toLowerCase() as DiscountMode;
  const globalDiscountValue = Number(formData.get("discountValue") ?? 0);
  const retailerId = String(formData.get("retailerId") ?? "").trim();
  const managerId = String(formData.get("managerId") ?? "").trim();
  const salesRepId = String(formData.get("salesRepId") ?? "").trim();
  const internalNote =
    String(formData.get("internalNote") ?? "").trim() ||
    "Order submitted from admin checkout.";

  const variants = await Variant.find({_id: {$in: items.map((item) => item.variantId)}}).lean();
  const variantMap = new Map(variants.map((variant) => [variant._id.toString(), variant]));

  const products = await Product.find({
    _id: {$in: variants.map((variant) => variant.productId)},
  }).lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const brandIds = Array.from(
    new Set(products.map((product) => String(product.brandId)).filter(Boolean))
  );

  const brands = await Brand.find({
    _id: {$in: brandIds},
  }).lean();
  const brandMap = new Map(brands.map((brand) => [brand._id.toString(), brand]));

  const warehouses = await Warehouse.find({isActive: true}).sort({priority: 1, code: 1}).lean();
  const warehouseMap = new Map(warehouses.map((warehouse) => [warehouse._id.toString(), warehouse]));
  const inventoryLevels = await InventoryLevel.find({
    variantId: {$in: variants.map((variant) => variant._id)},
  }).lean();
  const blockedStock = await BlockedStock.find({
    $or: [
      {variantId: {$in: variants.map((variant) => variant._id)}},
      {sku: {$in: variants.map((variant) => variant.sku)}},
    ],
  }).lean();

  const levelsByVariant = new Map<string, typeof inventoryLevels>();
  for (const level of inventoryLevels) {
    const variantId = String(level.variantId);
    const existing = levelsByVariant.get(variantId) ?? [];
    existing.push(level);
    levelsByVariant.set(variantId, existing);
  }

  const blockedByVariant = new Map<string, typeof blockedStock>();
  for (const blocked of blockedStock) {
    const variantId = blocked.variantId ? String(blocked.variantId) : "";
    const key =
      variantId ||
      variants.find((variant) => variant.sku === blocked.sku)?._id.toString() ||
      "";

    if (!key) {
      continue;
    }

    const existing = blockedByVariant.get(key) ?? [];
    existing.push(blocked);
    blockedByVariant.set(key, existing);
  }

  const availabilityByVariant = new Map<string, WarehouseAvailability[]>();
  for (const variant of variants) {
    const variantId = variant._id.toString();
    const levelMap = new Map(
      (levelsByVariant.get(variantId) ?? []).map((level) => [String(level.warehouseId), level])
    );
    const blockedRecords = blockedByVariant.get(variantId) ?? [];
    const warehouseBlockedMap = new Map<string, number>();
    let globalBlocked = 0;

    for (const blocked of blockedRecords) {
      if (blocked.warehouseId) {
        const warehouseId = String(blocked.warehouseId);
        warehouseBlockedMap.set(
          warehouseId,
          (warehouseBlockedMap.get(warehouseId) ?? 0) + Number(blocked.quantity ?? 0)
        );
      } else {
        globalBlocked += Number(blocked.quantity ?? 0);
      }
    }

    availabilityByVariant.set(
      variantId,
      buildWarehouseAvailability(
        warehouses.map((warehouse) => {
          const level = levelMap.get(warehouse._id.toString());
          return {
            warehouseId: warehouse._id.toString(),
            code: warehouse.code,
            priority: warehouse.priority ?? 999,
            onHand: Number(level?.onHand ?? 0),
            reserved: Number(level?.reserved ?? 0),
            blocked: Number(level?.blocked ?? 0),
            warehouseBlocked: Number(warehouseBlockedMap.get(warehouse._id.toString()) ?? 0),
          };
        }),
        globalBlocked
      )
    );
  }

  const enrichedItems: EnrichedOrderItem[] = [];
  const assignmentNotes: string[] = [];

  for (const item of items) {
    const variant = variantMap.get(item.variantId);
    if (!variant) {
      throw new Error(`Variant ${item.variantId} no longer exists.`);
    }

    const product = productMap.get(String(variant.productId));
    const brand = product ? brandMap.get(String(product.brandId)) : undefined;
    const availability = availabilityByVariant.get(item.variantId) ?? [];
    const selectedAvailability = item.warehouseId
      ? availability.find((entry) => entry.warehouseId === item.warehouseId) ?? null
      : selectWarehouseForQuantity(availability, item.quantity);

    if (!selectedAvailability || selectedAvailability.effectiveAvailable < item.quantity) {
      const availableQuantity = selectedAvailability
        ? selectedAvailability.effectiveAvailable
        : sumEffectiveAvailability(availability);
      throw new Error(
        `Insufficient stock for ${variant.sku}. Requested ${item.quantity}, available ${availableQuantity}.`
      );
    }

    const warehouse = warehouseMap.get(selectedAvailability.warehouseId);
    if (!warehouse) {
      throw new Error(`Warehouse ${selectedAvailability.warehouseId} is not available for ${variant.sku}.`);
    }

    if (!item.warehouseId) {
      assignmentNotes.push(
        `${variant.sku} auto-assigned to ${warehouse.code} with ${selectedAvailability.effectiveAvailable} units available.`
      );
    }

    selectedAvailability.effectiveAvailable = Math.max(
      0,
      selectedAvailability.effectiveAvailable - item.quantity
    );

    const grossAmount = Number((variant.mrp * item.quantity).toFixed(2));
    const breakdown = calculateDiscountBreakdown({
      amount: grossAmount,
      gstRate: variant.gstRate,
      discountType,
      discountValue: item.lineDiscountValue ?? globalDiscountValue,
    });

    enrichedItems.push({
      variantId: variant._id,
      sku: variant.sku,
      name:
        variant.title === "Default"
          ? product?.name ?? variant.title
          : `${product?.name ?? variant.sku} / ${variant.title}`,
      brandId: brand?._id ?? null,
      brandName: brand?.name ?? "",
      warehouseId: warehouse._id,
      warehouseCode: warehouse.code,
      quantity: item.quantity,
      mrp: variant.mrp,
      gstRate: variant.gstRate,
      lineDiscountValue: item.lineDiscountValue ?? globalDiscountValue,
      lineDiscountAmount: breakdown.discountAmount,
      grossAmount,
      taxableAmount: breakdown.taxableAmount,
      taxAmount: breakdown.taxAmount,
      finalAmount: breakdown.finalAmount,
    });
  }

  const totals = sumDiscountBreakdowns(
    enrichedItems.map((item) => ({
      discountType,
      discountValue: item.lineDiscountValue,
      discountAmount: item.lineDiscountAmount,
      taxableAmount: item.taxableAmount,
      taxAmount: item.taxAmount,
      finalAmount: item.finalAmount,
    }))
  );

  const brandId = String(formData.get("brandId") ?? "").trim();
  const brand = brandId ? await Brand.findById(brandId).lean() : null;

  const order = await Order.create({
    createdById: salesRepId || managerId || retailerId || null,
    retailerId: retailerId || null,
    managerId: managerId || null,
    salesRepId: salesRepId || null,
    brandId: brand?._id ?? null,
    workflowStatus: "submitted",
    participantSnapshots: {
      retailer: await buildParticipantSnapshot(retailerId),
      manager: await buildParticipantSnapshot(managerId),
      salesRep: await buildParticipantSnapshot(salesRepId),
    },
    items: enrichedItems,
    pricing: {
      discountType,
      discountValue: globalDiscountValue,
      discountAmount: totals.discountAmount,
      subtotal: Number(
        enrichedItems.reduce((sum, item) => sum + item.grossAmount, 0).toFixed(2)
      ),
      taxableAmount: totals.taxableAmount,
      taxAmount: totals.taxAmount,
      finalTotal: totals.finalAmount,
    },
    notesTimeline: [
      {
        message: "Order Initiated",
        name: "CallawayOne Admin",
        access: "all",
        type: "system",
        createdAt: new Date(),
      },
      {
        message: internalNote,
        name: "CallawayOne Admin",
        access: "all",
        type: "user",
        createdAt: new Date(),
      },
      ...assignmentNotes.map((note) => ({
        message: note,
        name: "CallawayOne Admin",
        access: "all",
        type: "system" as const,
        createdAt: new Date(),
      })),
    ],
  });

  await reserveInventoryForOrder(order._id.toString(), enrichedItems);

  revalidatePath("/admin/orders");
  revalidatePath("/admin/warehouses");
  revalidatePath("/admin/products");
  redirect("/admin/orders");
}

export async function updateOrderStatus(formData: FormData) {
  await dbConnect();
  const id = String(formData.get("id") ?? "").trim();
  const workflowStatus = String(formData.get("workflowStatus") ?? "").trim() as OrderWorkflowStatus;
  const note = String(formData.get("note") ?? "").trim();
  const order = await Order.findById(id);

  if (!order) {
    redirect("/admin/orders");
  }

  const inventoryMessages = await applyOrderInventoryTransition({
    orderId: order._id.toString(),
    legacyOrderId: order.legacyOrderId,
    currentStatus: order.workflowStatus,
    nextStatus: workflowStatus,
    items: order.items as EnrichedOrderItem[],
  });

  const notesTimeline = [
    ...inventoryMessages.map((message) => ({
      message,
      name: "CallawayOne Admin",
      access: "all",
      type: "system" as const,
      createdAt: new Date(),
    })),
    ...(note
      ? [
          {
            message: note,
            name: "CallawayOne Admin",
            access: "all",
            type: "user" as const,
            createdAt: new Date(),
          },
        ]
      : []),
  ];

  order.workflowStatus = workflowStatus;
  if (notesTimeline.length) {
    order.notesTimeline.push(...notesTimeline);
  }
  await order.save();

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/warehouses");
  revalidatePath("/admin/products");
  redirect(`/admin/orders/${id}`);
}

export async function importLegacyOrderSnapshot({
  legacyOrderId,
  sourceStatus,
  brandId,
  retailerId,
  managerId,
  salesRepId,
  participantSnapshots,
  items,
  pricing,
  notesTimeline,
}: {
  legacyOrderId: number;
  sourceStatus: string;
  brandId?: string;
  retailerId?: string;
  managerId?: string;
  salesRepId?: string;
  participantSnapshots: Record<string, unknown>;
  items: Record<string, unknown>[];
  pricing: Record<string, unknown>;
  notesTimeline: Record<string, unknown>[];
}) {
  await dbConnect();
  await Order.findOneAndUpdate(
    {legacyOrderId},
    {
      legacyOrderId,
      sourceStatus,
      workflowStatus: workflowFromLegacyStatus(sourceStatus),
      brandId: brandId || null,
      retailerId: retailerId || null,
      managerId: managerId || null,
      salesRepId: salesRepId || null,
      participantSnapshots,
      items,
      pricing,
      notesTimeline,
    },
    {upsert: true, returnDocument: "after"}
  );
}
