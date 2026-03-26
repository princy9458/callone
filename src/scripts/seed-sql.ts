import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";
import {ensureSystemBootstrap} from "../lib/auth/bootstrap";
import dbConnect from "../lib/db/connection";
import {BlockedStock} from "../lib/db/models/BlockedStock";
import {Brand} from "../lib/db/models/Brand";
import {InventoryLevel} from "../lib/db/models/InventoryLevel";
import {Order} from "../lib/db/models/Order";
import {Product} from "../lib/db/models/Product";
import {Role} from "../lib/db/models/Role";
import {User} from "../lib/db/models/User";
import {Variant} from "../lib/db/models/Variant";
import {Warehouse} from "../lib/db/models/Warehouse";
import {slugify} from "../lib/utils/slugify";

type SqlRow = Record<string, string | number | null>;

type ProductImportConfig = {
  table: "callaway_apparel" | "callaway_hardgoods" | "ogio" | "travis";
  brandLegacyId: number;
  productType: "hardgoods" | "apparel" | "softgoods";
  baseKey: (row: SqlRow) => string;
  name: (row: SqlRow) => string;
  category: (row: SqlRow) => string;
  subcategory: (row: SqlRow) => string;
  options: Array<{label: string; key: string; value: (row: SqlRow) => string}>;
  stock88?: (row: SqlRow) => number;
  stock90?: (row: SqlRow) => number;
};

function splitSqlTuples(input: string) {
  const tuples: string[] = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let buffer = "";

  for (const character of input) {
    if (escaped) {
      buffer += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      buffer += character;
      escaped = true;
      continue;
    }

    if (character === "'") {
      inString = !inString;
      buffer += character;
      continue;
    }

    if (!inString && character === "(") {
      if (depth === 0) {
        buffer = "";
      } else {
        buffer += character;
      }
      depth += 1;
      continue;
    }

    if (!inString && character === ")") {
      depth -= 1;
      if (depth === 0) {
        tuples.push(buffer);
        buffer = "";
      } else {
        buffer += character;
      }
      continue;
    }

    if (depth > 0) {
      buffer += character;
    }
  }

  return tuples;
}

function splitSqlFields(tuple: string) {
  const fields: string[] = [];
  let inString = false;
  let escaped = false;
  let buffer = "";

  for (const character of tuple) {
    if (escaped) {
      buffer += character;
      escaped = false;
      continue;
    }

    if (character === "\\") {
      buffer += character;
      escaped = true;
      continue;
    }

    if (character === "'") {
      inString = !inString;
      buffer += character;
      continue;
    }

    if (!inString && character === ",") {
      fields.push(buffer.trim());
      buffer = "";
      continue;
    }

    buffer += character;
  }

  if (buffer.trim()) {
    fields.push(buffer.trim());
  }

  return fields;
}

function normalizeSqlValue(value: string) {
  if (value === "NULL") {
    return null;
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value
      .slice(1, -1)
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, "\\");
  }

  const parsedNumber = Number(value);
  return Number.isNaN(parsedNumber) ? value : parsedNumber;
}

function extractRows(sqlContent: string, tableName: string) {
  const rows: SqlRow[] = [];
  const regex = new RegExp(
    `INSERT INTO \`${tableName}\` \\(([^)]+)\\) VALUES\\n([\\s\\S]*?);`,
    "g"
  );

  for (const match of sqlContent.matchAll(regex)) {
    const columns = match[1]
      .split(",")
      .map((column) => column.replace(/`/g, "").trim());
    const tuples = splitSqlTuples(match[2]);

    for (const tuple of tuples) {
      const fields = splitSqlFields(tuple).map(normalizeSqlValue);
      const row = columns.reduce<SqlRow>((accumulator, column, index) => {
        accumulator[column] = fields[index] ?? null;
        return accumulator;
      }, {});
      rows.push(row);
    }
  }

  return rows;
}

function toNumber(value: unknown) {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    return Number(value);
  }
  return 0;
}

function safeJson<T>(input: unknown, fallback: T): T {
  if (!input || typeof input !== "string") {
    return fallback;
  }

  const attempt = (value: string) => {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  };

  return (
    attempt(input) ??
    attempt(input.replace(/^"|"$/g, "").replace(/\\"/g, '"')) ??
    fallback
  );
}

function statusFromLegacy(status: string) {
  switch (status.toLowerCase()) {
    case "pending":
      return "submitted";
    case "approved":
      return "approved";
    case "completed":
      return "completed";
    case "checkavailability":
      return "availability_check";
    default:
      return "draft";
  }
}

async function importBrands(rows: SqlRow[]) {
  const brandMap = new Map<number, string>();

  for (const row of rows) {
    const legacyId = toNumber(row.id);
    const brand = await Brand.findOneAndUpdate(
      {legacyId},
      {
        name: String(row.name ?? "Unknown Brand"),
        slug: slugify(String(row.name ?? `brand-${legacyId}`)),
        code: slugify(String(row.name ?? `brand-${legacyId}`)).toUpperCase(),
        description: String(row.description ?? ""),
        websiteUrl: String(row.website_link ?? ""),
        media: {
          logoPath: "",
          thumbnailPath: "",
          sliderPaths: [],
        },
        isActive: String(row.status ?? "active") === "active",
        legacyId,
      },
      {upsert: true, returnDocument: "after"}
    );
    brandMap.set(legacyId, brand._id.toString());
  }

  return brandMap;
}

async function importUsers(rows: SqlRow[]) {
  const roleMap = new Map(
    (await Role.find().lean()).map((role) => [role.key, role._id.toString()])
  );
  const userIdMap = new Map<number, string>();

  for (const row of rows) {
    const legacyId = toNumber(row.id);
    const legacyRole = String(row.role ?? "Retailer").toLowerCase();
    const roleKey =
      legacyRole === "manager"
        ? "manager"
        : legacyRole === "sales representative"
          ? "sales_rep"
          : legacyRole === "admin"
            ? "admin"
            : "retailer";

    const passwordSource =
      String(row.new_hash_password ?? "") ||
      String(row.password_hash ?? "") ||
      "Callaway@1!";

    const passwordHash = passwordSource.startsWith("$2")
      ? passwordSource
      : await bcrypt.hash(passwordSource, 10);

    const user = await User.findOneAndUpdate(
      {legacyId},
      {
        legacyId,
        email: String(row.email ?? `legacy-${legacyId}@callone.local`).toLowerCase(),
        name: String(row.name ?? `Legacy User ${legacyId}`),
        passwordHash,
        roleId: roleMap.get(roleKey),
        roleKey,
        phone: String(row.phone ?? ""),
        phone2: String(row.phone2 ?? ""),
        code: String(row.code ?? ""),
        designation: String(row.designation ?? ""),
        gstin: String(row.gstin ?? ""),
        address: String(row.address ?? ""),
        secondaryEmail: String(row.secondary_email ?? ""),
        status: String(row.status ?? "active") === "active" ? "active" : "inactive",
      },
      {upsert: true, returnDocument: "after"}
    );

    userIdMap.set(legacyId, user._id.toString());
  }

  for (const row of rows) {
    const legacyId = toNumber(row.id);
    const managerLegacyId = toNumber(row.manager_id);
    if (!managerLegacyId) {
      continue;
    }

    const userId = userIdMap.get(legacyId);
    const managerId = userIdMap.get(managerLegacyId);
    if (userId && managerId) {
      await User.findByIdAndUpdate(userId, {managerId});
    }
  }

  return userIdMap;
}

async function importProducts(sqlContent: string, brandMap: Map<number, string>) {
  const warehouse88 = await Warehouse.findOne({code: "WH88"});
  const warehouse90 = await Warehouse.findOne({code: "WH90"});

  if (!warehouse88 || !warehouse90) {
    throw new Error("Warehouses WH88 and WH90 are required before product import.");
  }

  const configs: ProductImportConfig[] = [
    {
      table: "callaway_apparel",
      brandLegacyId: 2,
      productType: "apparel",
      baseKey: (row) => String(row.style_id || row.variation_sku || row.sku),
      name: (row) => String(row.name || row.description || row.sku),
      category: (row) => String(row.category || "Apparel"),
      subcategory: (row) => String(row.gender || ""),
      options: [
        {label: "Color", key: "color", value: (row) => String(row.color || "")},
        {label: "Size", key: "size", value: (row) => String(row.size || "")},
      ],
      stock88: (row) => toNumber(row.stock_88),
      stock90: (row) => toNumber(row.stock_90),
    },
    {
      table: "callaway_hardgoods",
      brandLegacyId: 1,
      productType: "hardgoods",
      baseKey: (row) => String(row.product_model || row.sku),
      name: (row) => String(row.description || row.sku),
      category: (row) => String(row.category || "Hardgoods"),
      subcategory: (row) => String(row.product_type || ""),
      options: [
        {
          label: "Orientation",
          key: "orientation",
          value: (row) => String(row.orientation || ""),
        },
      ],
      stock88: (row) => toNumber(row.stock_88),
    },
    {
      table: "ogio",
      brandLegacyId: 4,
      productType: "softgoods",
      baseKey: (row) => String(row.variation_sku || row.product_model || row.sku),
      name: (row) => String(row.name || row.description || row.sku),
      category: (row) => String(row.category || "Softgoods"),
      subcategory: (row) => String(row.product_type || ""),
      options: [],
      stock90: (row) => toNumber(row.stock_90),
    },
    {
      table: "travis",
      brandLegacyId: 3,
      productType: "apparel",
      baseKey: (row) => String(row.style_code || row.variation_sku || row.sku),
      name: (row) => String(row.description || row.name || row.sku),
      category: (row) => String(row.category || "Apparel"),
      subcategory: (row) => String(row.gender || ""),
      options: [
        {label: "Color", key: "color", value: (row) => String(row.color || "")},
        {label: "Size", key: "size", value: (row) => String(row.size || "")},
      ],
      stock88: (row) => toNumber(row.stock_88),
      stock90: (row) => toNumber(row.stock_90),
    },
  ];

  const skuToVariantId = new Map<string, string>();

  for (const config of configs) {
    const rows = extractRows(sqlContent, config.table);
    const grouped = new Map<
      string,
      {
        product: SqlRow;
        optionDefinitions: Array<{key: string; label: string; values: Set<string>}>;
        rows: SqlRow[];
      }
    >();

    for (const row of rows) {
      const key = config.baseKey(row);
      if (!key) {
        continue;
      }

      if (!grouped.has(key)) {
        grouped.set(key, {
          product: row,
          optionDefinitions: config.options.map((option) => ({
            key: option.key,
            label: option.label,
            values: new Set<string>(),
          })),
          rows: [],
        });
      }

      const entry = grouped.get(key)!;
      entry.rows.push(row);
      config.options.forEach((option, index) => {
        const value = option.value(row);
        if (value) {
          entry.optionDefinitions[index].values.add(value);
        }
      });
    }

    for (const [baseKey, entry] of grouped.entries()) {
      const product = await Product.findOneAndUpdate(
        {baseSku: baseKey},
        {
          name: entry.product && config.name(entry.product),
          slug: slugify(`${config.table}-${baseKey}`),
          baseSku: baseKey,
          brandId: brandMap.get(config.brandLegacyId),
          category: config.category(entry.product),
          subcategory: config.subcategory(entry.product),
          productType: config.productType,
          description: String(entry.product.description || entry.product.name || ""),
          status: "active",
          taxRate: toNumber(entry.product.gst),
          listPrice: toNumber(entry.product.mrp),
          optionDefinitions: entry.optionDefinitions.map((definition) => ({
            key: definition.key,
            label: definition.label,
            values: Array.from(definition.values),
            useForVariants: true,
          })),
          media: {
            primaryImagePath: "",
            galleryPaths: [],
          },
          legacySource: {
            table: config.table,
            legacySku: String(entry.product.sku || ""),
          },
        },
        {upsert: true, returnDocument: "after"}
      );

      for (const row of entry.rows) {
        const optionValues = config.options.reduce<Record<string, string>>((accumulator, option) => {
          const value = option.value(row);
          if (value) {
            accumulator[option.key] = value;
          }
          return accumulator;
        }, {});

        const variant = await Variant.findOneAndUpdate(
          {sku: String(row.sku)},
          {
            productId: product._id,
            sku: String(row.sku),
            title:
              Object.values(optionValues).join(" / ") ||
              String(row.description || row.name || row.sku),
            optionValues,
            mrp: toNumber(row.mrp),
            gstRate: toNumber(row.gst),
            status: "active",
            legacyWarehouseHint:
              toNumber(row.stock_90) > 0 ? "WH90" : toNumber(row.stock_88) > 0 ? "WH88" : "",
          },
          {upsert: true, returnDocument: "after"}
        );

        skuToVariantId.set(String(row.sku), variant._id.toString());

        const inventoryPayload = [
          {
            warehouseId: warehouse88._id,
            onHand: config.stock88 ? config.stock88(row) : 0,
          },
          {
            warehouseId: warehouse90._id,
            onHand: config.stock90 ? config.stock90(row) : 0,
          },
        ];

        for (const inventory of inventoryPayload) {
          await InventoryLevel.findOneAndUpdate(
            {
              variantId: variant._id,
              warehouseId: inventory.warehouseId,
            },
            {
              variantId: variant._id,
              warehouseId: inventory.warehouseId,
              onHand: inventory.onHand,
              reserved: 0,
              blocked: 0,
              available: inventory.onHand,
            },
            {upsert: true, returnDocument: "after"}
          );
        }
      }
    }
  }

  return skuToVariantId;
}

async function importBlockedStock(rows: SqlRow[], skuToVariantId: Map<string, string>) {
  for (const row of rows) {
    await BlockedStock.findOneAndUpdate(
      {
        sku: String(row.sku),
        blockedUnder: String(row.blocked_under || ""),
      },
      {
        sku: String(row.sku),
        variantId: skuToVariantId.get(String(row.sku)) ?? null,
        brand: String(row.brand || ""),
        category: String(row.category || ""),
        blockedUnder: String(row.blocked_under || ""),
        description: String(row.description || ""),
        quantity: toNumber(row.qty),
        source: "legacy",
      },
      {upsert: true, returnDocument: "after"}
    );
  }
}

async function importOrders(
  rows: SqlRow[],
  skuToVariantId: Map<string, string>,
  userIdMap: Map<number, string>,
  brandMap: Map<number, string>
) {
  for (const row of rows) {
    const items = safeJson<Record<string, unknown>[]>(row.items, []);
    const notes = safeJson<Record<string, unknown>[]>(row.note, []);
    const retailerDetails = safeJson<Record<string, unknown>>(row.retailer_details, {});
    const managerDetails = safeJson<Record<string, unknown>>(row.manager_details, {});
    const salesRepDetails = safeJson<Record<string, unknown>>(row.salesRep_details, {});

    const mappedItems = items.map((item) => {
      const stock88 = toNumber(item.stock_88);
      const stock90 = toNumber(item.stock_90);
      return {
        variantId: skuToVariantId.get(String(item.sku)) ?? null,
        sku: String(item.sku ?? ""),
        name: String(item.description ?? item.sku ?? ""),
        warehouseId: null,
        warehouseCode: stock90 > 0 ? "WH90" : stock88 > 0 ? "WH88" : "",
        quantity: Math.max(stock88, stock90, 1),
        mrp: toNumber(item.mrp),
        gstRate: 18,
        lineDiscountValue: toNumber(item.Discount),
        lineDiscountAmount: toNumber(item.LessDiscountAmount),
        grossAmount: toNumber(item.mrp) * Math.max(stock88, stock90, 1),
        taxableAmount: toNumber(item.Amount),
        taxAmount: 0,
        finalAmount: toNumber(item.Amount),
      };
    });

    await Order.findOneAndUpdate(
      {legacyOrderId: toNumber(row.id)},
      {
        orderNumber: `LEG-${row.id}`,
        legacyOrderId: toNumber(row.id),
        createdById: userIdMap.get(toNumber(row.user_id)) ?? null,
        retailerId: userIdMap.get(toNumber(row.retailer_id)) ?? null,
        managerId: userIdMap.get(toNumber(row.manager_id)) ?? null,
        salesRepId: userIdMap.get(toNumber(row.salesrep_id)) ?? null,
        brandId: brandMap.get(toNumber(row.brand_id)) ?? null,
        workflowStatus: statusFromLegacy(String(row.status || "draft")),
        sourceStatus: String(row.status || ""),
        participantSnapshots: {
          retailer: retailerDetails,
          manager: managerDetails,
          salesRep: salesRepDetails,
        },
        items: mappedItems,
        pricing: {
          discountType:
            String(row.discount_type || "none").toLowerCase() === "inclusive"
              ? "inclusive"
              : String(row.discount_type || "none").toLowerCase() === "exclusive"
                ? "exclusive"
                : String(row.discount_type || "none").toLowerCase() === "flat"
                  ? "flat"
                  : "none",
          discountValue: toNumber(row.discount_percent),
          discountAmount: toNumber(row.discount_amount),
          subtotal: toNumber(row.total_val_pre_discount),
          taxableAmount: toNumber(row.total_value) - toNumber(row.discount_amount),
          taxAmount: 0,
          finalTotal: toNumber(row.total_value),
        },
        notesTimeline: notes.map((note) => ({
          message: String(note.message || ""),
          name: String(note.name || "System"),
          access: String(note.access || "all"),
          type: String(note.type || "system"),
          createdAt: note.date ? new Date(String(note.date)) : new Date(),
        })),
      },
      {upsert: true, returnDocument: "after"}
    );
  }
}

async function main() {
  await dbConnect();
  await ensureSystemBootstrap();

  const sqlPath = path.join(process.cwd(), "u683660902_calloms_full.sql");
  if (!fs.existsSync(sqlPath)) {
    throw new Error(`SQL file not found: ${sqlPath}`);
  }

  const sqlContent = fs.readFileSync(sqlPath, "utf8");

  const brandRows = extractRows(sqlContent, "brands");
  const userRows = extractRows(sqlContent, "users");
  const blockedRows = extractRows(sqlContent, "blocked");
  const orderRows = extractRows(sqlContent, "orders");

  const brandMap = await importBrands(brandRows);
  const userIdMap = await importUsers(userRows);
  const skuToVariantId = await importProducts(sqlContent, brandMap);
  await importBlockedStock(blockedRows, skuToVariantId);
  await importOrders(orderRows, skuToVariantId, userIdMap, brandMap);

  console.log("Legacy SQL migration completed.");
  console.log(`Imported brands: ${brandRows.length}`);
  console.log(`Imported users: ${userRows.length}`);
  console.log(`Imported blocked rows: ${blockedRows.length}`);
  console.log(`Imported order snapshots: ${orderRows.length}`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Legacy seed failed:", error);
  process.exit(1);
});
