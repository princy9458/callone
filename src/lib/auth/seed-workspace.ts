import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db/connection";
import {AttributeSet} from "@/lib/db/models/AttributeSet";
import {BlockedStock} from "@/lib/db/models/BlockedStock";
import {Brand} from "@/lib/db/models/Brand";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {InventoryMovement} from "@/lib/db/models/InventoryMovement";
import {Order} from "@/lib/db/models/Order";
import {Product} from "@/lib/db/models/Product";
import {Role} from "@/lib/db/models/Role";
import {SheetDataset} from "@/lib/db/models/SheetDataset";
import {SheetRow} from "@/lib/db/models/SheetRow";
import {User} from "@/lib/db/models/User";
import {Variant} from "@/lib/db/models/Variant";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {calibrateSheetRows, summarizeCalibratedRows} from "@/lib/sheets/calibration";
import {calculateDiscountBreakdown, sumDiscountBreakdowns} from "@/lib/utils/discounts";
import {slugify} from "@/lib/utils/slugify";

type DemoProductVariant = {
  sku: string;
  title: string;
  optionValues: Record<string, string>;
  mrp: number;
  cost: number;
  stocks: Record<string, number>;
};

type DemoProduct = {
  brandCode: string;
  baseSku: string;
  name: string;
  category: string;
  subcategory: string;
  productType: "hardgoods" | "apparel" | "softgoods" | "accessory" | "custom";
  attributeSetKey: string;
  description: string;
  optionDefinitions: Array<{
    key: string;
    label: string;
    values: string[];
    useForVariants: boolean;
  }>;
  variants: DemoProductVariant[];
};

type DemoUser = {
  email: string;
  name: string;
  roleKey: string;
  designation: string;
  phone: string;
  code: string;
  managerEmail?: string;
  assignedBrandCodes: string[];
  assignedWarehouseCodes: string[];
};

const globalSeedState = globalThis as typeof globalThis & {
  __calloneWorkspaceSeeded?: boolean;
};

const ATTRIBUTE_SET_DEFINITIONS = [
  {
    key: "callaway-softgoods-core",
    name: "Callaway Softgoods",
    appliesTo: "product",
    contexts: ["callaway-softgoods"],
    source: "system",
    attributes: [
      {key: "color", label: "Color", type: "select", options: ["Navy", "Black", "White", "Grey"], hint: "Primary merchandise color"},
      {key: "size", label: "Size", type: "select", options: ["S", "M", "L", "XL"], hint: "Size run"},
    ],
  },
  {
    key: "callaway-hardgoods-core",
    name: "Callaway Hardgoods",
    appliesTo: "product",
    contexts: ["callaway-hardgoods"],
    source: "system",
    attributes: [
      {key: "hand", label: "Hand", type: "select", options: ["RH", "LH"], hint: "Player hand"},
      {key: "spec", label: "Spec", type: "select", options: ["10.5", "9.0", "Stiff", "Regular"], hint: "Playing specification"},
    ],
  },
  {
    key: "ogio-core",
    name: "Ogio",
    appliesTo: "product",
    contexts: ["ogio"],
    source: "system",
    attributes: [
      {key: "color", label: "Color", type: "select", options: ["Black", "Grey", "Blue"], hint: "Bag color"},
    ],
  },
  {
    key: "travis-mathew-core",
    name: "Travis Mathew",
    appliesTo: "product",
    contexts: ["travis-mathew"],
    source: "system",
    attributes: [
      {key: "color", label: "Color", type: "select", options: ["Black", "Heather Grey", "Mood Indigo", "White"], hint: "Garment color"},
      {key: "size", label: "Size", type: "select", options: ["M", "L", "XL"], hint: "Size run"},
    ],
  },
];

const DEMO_PRODUCTS: DemoProduct[] = [
  {
    brandCode: "CG-APP",
    baseSku: "CGSG-POLO-001",
    name: "Callaway Tour Polo",
    category: "Polos",
    subcategory: "Mens",
    productType: "softgoods",
    attributeSetKey: "callaway-softgoods-core",
    description: "Performance polo for daily play and team uniforms.",
    optionDefinitions: [
      {key: "color", label: "Color", values: ["Navy", "White"], useForVariants: true},
      {key: "size", label: "Size", values: ["M", "L", "XL"], useForVariants: true},
    ],
    variants: [
      {sku: "CGSG-POLO-001-NAV-M", title: "Navy / M", optionValues: {color: "Navy", size: "M"}, mrp: 4590, cost: 2250, stocks: {WH88: 18, WH90: 7}},
      {sku: "CGSG-POLO-001-NAV-L", title: "Navy / L", optionValues: {color: "Navy", size: "L"}, mrp: 4590, cost: 2250, stocks: {WH88: 16, WH90: 8}},
      {sku: "CGSG-POLO-001-WHT-L", title: "White / L", optionValues: {color: "White", size: "L"}, mrp: 4590, cost: 2250, stocks: {WH88: 10, WH90: 6}},
    ],
  },
  {
    brandCode: "CG-APP",
    baseSku: "CGSG-HOOD-002",
    name: "Callaway Weather Hoodie",
    category: "Outerwear",
    subcategory: "Mens",
    productType: "softgoods",
    attributeSetKey: "callaway-softgoods-core",
    description: "Layering hoodie for cooler course starts.",
    optionDefinitions: [
      {key: "color", label: "Color", values: ["Black", "Grey"], useForVariants: true},
      {key: "size", label: "Size", values: ["M", "L", "XL"], useForVariants: true},
    ],
    variants: [
      {sku: "CGSG-HOOD-002-BLK-M", title: "Black / M", optionValues: {color: "Black", size: "M"}, mrp: 6990, cost: 3340, stocks: {WH88: 9, WH90: 5}},
      {sku: "CGSG-HOOD-002-BLK-L", title: "Black / L", optionValues: {color: "Black", size: "L"}, mrp: 6990, cost: 3340, stocks: {WH88: 8, WH90: 4}},
      {sku: "CGSG-HOOD-002-GRY-L", title: "Grey / L", optionValues: {color: "Grey", size: "L"}, mrp: 6990, cost: 3340, stocks: {WH88: 7, WH90: 3}},
    ],
  },
  {
    brandCode: "CG-HW",
    baseSku: "CGHW-DRVR-101",
    name: "Paradym Driver",
    category: "Drivers",
    subcategory: "Performance",
    productType: "hardgoods",
    attributeSetKey: "callaway-hardgoods-core",
    description: "Distance-focused driver lineup.",
    optionDefinitions: [
      {key: "hand", label: "Hand", values: ["RH"], useForVariants: true},
      {key: "spec", label: "Spec", values: ["9.0", "10.5"], useForVariants: true},
    ],
    variants: [
      {sku: "CGHW-DRVR-101-RH-9", title: "RH / 9.0", optionValues: {hand: "RH", spec: "9.0"}, mrp: 58990, cost: 42200, stocks: {WH88: 5}},
      {sku: "CGHW-DRVR-101-RH-10", title: "RH / 10.5", optionValues: {hand: "RH", spec: "10.5"}, mrp: 58990, cost: 42200, stocks: {WH88: 6}},
    ],
  },
  {
    brandCode: "CG-HW",
    baseSku: "CGHW-IRON-202",
    name: "Apex Iron Set",
    category: "Irons",
    subcategory: "Performance",
    productType: "hardgoods",
    attributeSetKey: "callaway-hardgoods-core",
    description: "Forged iron set for competitive play.",
    optionDefinitions: [
      {key: "hand", label: "Hand", values: ["RH"], useForVariants: true},
      {key: "spec", label: "Spec", values: ["Stiff", "Regular"], useForVariants: true},
    ],
    variants: [
      {sku: "CGHW-IRON-202-RH-STF", title: "RH / Stiff", optionValues: {hand: "RH", spec: "Stiff"}, mrp: 99990, cost: 74100, stocks: {WH88: 4}},
      {sku: "CGHW-IRON-202-RH-REG", title: "RH / Regular", optionValues: {hand: "RH", spec: "Regular"}, mrp: 99990, cost: 74100, stocks: {WH88: 3}},
    ],
  },
  {
    brandCode: "OG",
    baseSku: "OG-BACKPACK-11",
    name: "Ogio Pace Pro Backpack",
    category: "Backpacks",
    subcategory: "Travel",
    productType: "accessory",
    attributeSetKey: "ogio-core",
    description: "Travel-ready backpack with padded tech pocket.",
    optionDefinitions: [{key: "color", label: "Color", values: ["Black", "Grey"], useForVariants: true}],
    variants: [
      {sku: "OG-BACKPACK-11-BLK", title: "Black", optionValues: {color: "Black"}, mrp: 8490, cost: 4260, stocks: {WH90: 9}},
      {sku: "OG-BACKPACK-11-GRY", title: "Grey", optionValues: {color: "Grey"}, mrp: 8490, cost: 4260, stocks: {WH90: 6}},
    ],
  },
  {
    brandCode: "OG",
    baseSku: "OG-DUFFEL-21",
    name: "Ogio Terminal Duffel",
    category: "Duffels",
    subcategory: "Travel",
    productType: "accessory",
    attributeSetKey: "ogio-core",
    description: "Large duffel for team travel and event movement.",
    optionDefinitions: [{key: "color", label: "Color", values: ["Black", "Blue"], useForVariants: true}],
    variants: [
      {sku: "OG-DUFFEL-21-BLK", title: "Black", optionValues: {color: "Black"}, mrp: 10990, cost: 5480, stocks: {WH90: 6}},
      {sku: "OG-DUFFEL-21-BLU", title: "Blue", optionValues: {color: "Blue"}, mrp: 10990, cost: 5480, stocks: {WH90: 4}},
    ],
  },
  {
    brandCode: "TM",
    baseSku: "TM-POLO-31",
    name: "Travis Mathew Wander Polo",
    category: "Polos",
    subcategory: "Mens",
    productType: "apparel",
    attributeSetKey: "travis-mathew-core",
    description: "Lifestyle polo for retail partners and golf events.",
    optionDefinitions: [
      {key: "color", label: "Color", values: ["White", "Mood Indigo"], useForVariants: true},
      {key: "size", label: "Size", values: ["M", "L", "XL"], useForVariants: true},
    ],
    variants: [
      {sku: "TM-POLO-31-WHT-M", title: "White / M", optionValues: {color: "White", size: "M"}, mrp: 5290, cost: 2590, stocks: {WH88: 13, WH90: 7}},
      {sku: "TM-POLO-31-WHT-L", title: "White / L", optionValues: {color: "White", size: "L"}, mrp: 5290, cost: 2590, stocks: {WH88: 12, WH90: 6}},
      {sku: "TM-POLO-31-MDI-L", title: "Mood Indigo / L", optionValues: {color: "Mood Indigo", size: "L"}, mrp: 5290, cost: 2590, stocks: {WH88: 11, WH90: 5}},
    ],
  },
  {
    brandCode: "TM",
    baseSku: "TM-QZIP-41",
    name: "Travis Mathew Quarter Zip",
    category: "Outerwear",
    subcategory: "Mens",
    productType: "apparel",
    attributeSetKey: "travis-mathew-core",
    description: "Quarter zip layer for cooler mornings.",
    optionDefinitions: [
      {key: "color", label: "Color", values: ["Black", "Heather Grey"], useForVariants: true},
      {key: "size", label: "Size", values: ["M", "L"], useForVariants: true},
    ],
    variants: [
      {sku: "TM-QZIP-41-BLK-M", title: "Black / M", optionValues: {color: "Black", size: "M"}, mrp: 7990, cost: 3910, stocks: {WH88: 7, WH90: 4}},
      {sku: "TM-QZIP-41-HGR-L", title: "Heather Grey / L", optionValues: {color: "Heather Grey", size: "L"}, mrp: 7990, cost: 3910, stocks: {WH88: 6, WH90: 3}},
    ],
  },
];

const DEMO_USERS: DemoUser[] = [
  {
    email: "admin.operations@callone.local",
    name: "Operations Admin",
    roleKey: "admin",
    designation: "Operations Admin",
    phone: "9876500011",
    code: "ADM-OPS",
    assignedBrandCodes: ["CG-APP", "CG-HW", "OG", "TM"],
    assignedWarehouseCodes: ["WH88", "WH90"],
  },
  {
    email: "manager.west@callone.local",
    name: "West Zone Manager",
    roleKey: "manager",
    designation: "Regional Manager",
    phone: "9876500012",
    code: "MGR-WEST",
    assignedBrandCodes: ["CG-APP", "CG-HW"],
    assignedWarehouseCodes: ["WH88", "WH90"],
  },
  {
    email: "manager.north@callone.local",
    name: "North Zone Manager",
    roleKey: "manager",
    designation: "Regional Manager",
    phone: "9876500013",
    code: "MGR-NORTH",
    assignedBrandCodes: ["TM", "OG"],
    assignedWarehouseCodes: ["WH88"],
  },
  {
    email: "sales.aarav@callone.local",
    name: "Aarav Sharma",
    roleKey: "sales_rep",
    designation: "Sales Representative",
    phone: "9876500014",
    code: "SAL-AARAV",
    managerEmail: "manager.west@callone.local",
    assignedBrandCodes: ["CG-APP", "CG-HW"],
    assignedWarehouseCodes: ["WH88", "WH90"],
  },
  {
    email: "sales.meera@callone.local",
    name: "Meera Singh",
    roleKey: "sales_rep",
    designation: "Sales Representative",
    phone: "9876500015",
    code: "SAL-MEERA",
    managerEmail: "manager.north@callone.local",
    assignedBrandCodes: ["TM", "OG"],
    assignedWarehouseCodes: ["WH88"],
  },
  {
    email: "retailer.greenfield@callone.local",
    name: "Greenfield Golf",
    roleKey: "retailer",
    designation: "Retail Account",
    phone: "9876500016",
    code: "RTL-GREEN",
    managerEmail: "manager.west@callone.local",
    assignedBrandCodes: ["CG-APP", "CG-HW"],
    assignedWarehouseCodes: ["WH88"],
  },
  {
    email: "retailer.clubhouse@callone.local",
    name: "Clubhouse Retail",
    roleKey: "retailer",
    designation: "Retail Account",
    phone: "9876500017",
    code: "RTL-CLUB",
    managerEmail: "manager.north@callone.local",
    assignedBrandCodes: ["TM", "OG"],
    assignedWarehouseCodes: ["WH90"],
  },
];

const DEMO_ORDERS = [
  {
    orderNumber: "DEMO-1001",
    workflowStatus: "completed",
    salesRepEmail: "sales.aarav@callone.local",
    managerEmail: "manager.west@callone.local",
    retailerEmail: "retailer.greenfield@callone.local",
    brandCode: "CG-APP",
    discountType: "exclusive" as const,
    discountValue: 8,
    items: [
      {sku: "CGSG-POLO-001-NAV-M", quantity: 6},
      {sku: "CGSG-HOOD-002-BLK-L", quantity: 2},
    ],
    note: "Club fitting event replenishment.",
  },
  {
    orderNumber: "DEMO-1002",
    workflowStatus: "manager_approval",
    salesRepEmail: "sales.meera@callone.local",
    managerEmail: "manager.north@callone.local",
    retailerEmail: "retailer.clubhouse@callone.local",
    brandCode: "TM",
    discountType: "inclusive" as const,
    discountValue: 12,
    items: [
      {sku: "TM-POLO-31-WHT-L", quantity: 5},
      {sku: "TM-QZIP-41-HGR-L", quantity: 3},
    ],
    note: "Awaiting manager approval before dispatch.",
  },
  {
    orderNumber: "DEMO-1003",
    workflowStatus: "availability_check",
    salesRepEmail: "sales.aarav@callone.local",
    managerEmail: "manager.west@callone.local",
    retailerEmail: "retailer.greenfield@callone.local",
    brandCode: "CG-HW",
    discountType: "none" as const,
    discountValue: 0,
    items: [
      {sku: "CGHW-DRVR-101-RH-10", quantity: 1},
      {sku: "CGHW-IRON-202-RH-STF", quantity: 1},
    ],
    note: "Check allocation before confirming dealer request.",
  },
  {
    orderNumber: "DEMO-1004",
    workflowStatus: "submitted",
    salesRepEmail: "sales.meera@callone.local",
    managerEmail: "manager.north@callone.local",
    retailerEmail: "retailer.clubhouse@callone.local",
    brandCode: "OG",
    discountType: "flat" as const,
    discountValue: 5,
    items: [
      {sku: "OG-BACKPACK-11-BLK", quantity: 4},
      {sku: "OG-DUFFEL-21-BLU", quantity: 2},
    ],
    note: "Travel set requested for club merchandise counter.",
  },
];

function recalcAvailable(onHand: number, reserved: number, blocked: number) {
  return Math.max(0, onHand - reserved - blocked);
}

async function repairLegacyProductIndexes() {
  const indexes = await Product.collection.indexes().catch(() => []);
  const hasLegacySkuIndex = indexes.some((index) => index.name === "sku_1");

  if (hasLegacySkuIndex) {
    await Product.collection.dropIndex("sku_1").catch((error: {codeName?: string; message?: string}) => {
      if (error?.codeName === "IndexNotFound") {
        return;
      }

      throw error;
    });
  }
}

export async function ensureWorkspaceSeedData() {
  if (globalSeedState.__calloneWorkspaceSeeded) {
    return;
  }

  await dbConnect();
  await repairLegacyProductIndexes();

  const password = process.env.CALLONE_BOOTSTRAP_ADMIN_PASSWORD ?? "CalloneAdmin@123";

  await Brand.findOneAndUpdate(
    {code: "CG-APP"},
    {
      $set: {
        name: "Callaway Softgoods",
        slug: "callaway-softgoods",
      },
    }
  );

  for (const definition of ATTRIBUTE_SET_DEFINITIONS) {
    await AttributeSet.findOneAndUpdate(
      {key: definition.key},
      {$set: definition},
      {upsert: true, returnDocument: "after"}
    );
  }

  const brands = await Brand.find().lean();
  const warehouses = await Warehouse.find({isActive: true}).lean();
  const roles = await Role.find({isActive: true}).lean();

  const brandMap = new Map(brands.map((brand) => [brand.code, brand]));
  const warehouseMap = new Map(warehouses.map((warehouse) => [warehouse.code, warehouse]));
  const roleMap = new Map(roles.map((role) => [role.key, role]));

  for (const userDefinition of DEMO_USERS) {
    const role = roleMap.get(userDefinition.roleKey);
    if (!role) {
      continue;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      {email: userDefinition.email},
      {
        $set: {
          name: userDefinition.name,
          roleId: role._id,
          roleKey: role.key,
          designation: userDefinition.designation,
          phone: userDefinition.phone,
          code: userDefinition.code,
          status: "active",
          assignedBrandIds: userDefinition.assignedBrandCodes
            .map((code) => brandMap.get(code)?._id)
            .filter(Boolean),
          assignedWarehouseIds: userDefinition.assignedWarehouseCodes
            .map((code) => warehouseMap.get(code)?._id)
            .filter(Boolean),
          passwordHash,
        },
      },
      {upsert: true, returnDocument: "after"}
    );
  }

  const userMap = new Map(
    (await User.find().lean()).map((user) => [user.email, user])
  );

  for (const userDefinition of DEMO_USERS) {
    if (!userDefinition.managerEmail) {
      continue;
    }

    const manager = userMap.get(userDefinition.managerEmail);
    const user = userMap.get(userDefinition.email);
    if (!manager || !user) {
      continue;
    }

    await User.findByIdAndUpdate(user._id, {managerId: manager._id});
  }

  const attributeSetMap = new Map(
    (await AttributeSet.find().lean()).map((item) => [item.key, item])
  );

  for (const productDefinition of DEMO_PRODUCTS) {
    const brand = brandMap.get(productDefinition.brandCode);
    if (!brand) {
      continue;
    }

    const attributeSet = attributeSetMap.get(productDefinition.attributeSetKey);
    const product = await Product.findOneAndUpdate(
      {baseSku: productDefinition.baseSku},
      {
        $set: {
          name: productDefinition.name,
          slug: slugify(productDefinition.name),
          brandId: brand._id,
          category: productDefinition.category,
          subcategory: productDefinition.subcategory,
          productType: productDefinition.productType,
          description: productDefinition.description,
          status: "active",
          taxRate: 18,
          listPrice: productDefinition.variants[0]?.mrp ?? 0,
          optionDefinitions: productDefinition.optionDefinitions,
          attributeSetId: attributeSet?._id?.toString() ?? "",
          media: {
            primaryImagePath: "/images/products/default-product.jpg",
            galleryPaths: [],
            sharedCollectionKey: productDefinition.baseSku,
            variantImageStrategy: "product_shared",
          },
          metadata: {
            section:
              productDefinition.brandCode === "CG-APP"
                ? "callaway-softgoods"
                : productDefinition.brandCode === "CG-HW"
                  ? "callaway-hardgoods"
                  : productDefinition.brandCode === "TM"
                    ? "travis-mathew"
                    : "ogio",
          },
        },
      },
      {upsert: true, returnDocument: "after"}
    );

    for (const variantDefinition of productDefinition.variants) {
      const variant = await Variant.findOneAndUpdate(
        {sku: variantDefinition.sku},
        {
          $set: {
            productId: product._id,
            title: variantDefinition.title,
            optionValues: variantDefinition.optionValues,
            mrp: variantDefinition.mrp,
            gstRate: 18,
            cost: variantDefinition.cost,
            status: "active",
            legacyWarehouseHint:
              Object.keys(variantDefinition.stocks).length === 1
                ? (Object.keys(variantDefinition.stocks)[0] as "WH88" | "WH90")
                : "",
          },
        },
        {upsert: true, returnDocument: "after"}
      );

      for (const warehouse of warehouses) {
        const onHand = variantDefinition.stocks[warehouse.code] ?? 0;
        const blocked = warehouse.code === "WH88" && onHand > 0 ? 1 : 0;
        const reserved = 0;
        const available = recalcAvailable(onHand, reserved, blocked);

        const level = await InventoryLevel.findOneAndUpdate(
          {variantId: variant._id, warehouseId: warehouse._id},
          {
            $set: {
              onHand,
              reserved,
              blocked,
              available,
            },
          },
          {upsert: true, returnDocument: "after"}
        );

        await InventoryMovement.findOneAndUpdate(
          {
            variantId: variant._id,
            warehouseId: warehouse._id,
            type: "import",
            referenceId: `seed-import-${variantDefinition.sku}`,
          },
          {
            $setOnInsert: {
              delta: onHand,
              reason: "Initial seeded stock",
              referenceType: "seed",
              notes: "Workspace seed import",
            },
          },
          {upsert: true, returnDocument: "after"}
        );

        if (warehouse.code === "WH88" && onHand > 0) {
          await InventoryMovement.findOneAndUpdate(
            {
              variantId: variant._id,
              warehouseId: warehouse._id,
              type: "adjustment",
              referenceId: `seed-block-${variantDefinition.sku}`,
            },
            {
              $setOnInsert: {
                delta: -blocked,
                reason: "Display/sample stock",
                referenceType: "seed",
                notes: `Available after seed: ${level.available}`,
              },
            },
            {upsert: true, returnDocument: "after"}
          );
        }
      }
    }
  }

  const allVariants = await Variant.find().lean();
  const variantMap = new Map(allVariants.map((variant) => [variant.sku, variant]));

  const inventoryLevels = await InventoryLevel.find().lean();
  const inventoryByVariantWarehouse = new Map(
    inventoryLevels.map((level) => [`${String(level.variantId)}:${String(level.warehouseId)}`, level])
  );

  for (const record of [
    {sku: "CGSG-HOOD-002-BLK-L", brand: "Callaway Softgoods", category: "Outerwear", blockedUnder: "Showroom", quantity: 2, warehouseCode: "WH88"},
    {sku: "CGHW-DRVR-101-RH-10", brand: "Callaway Hardgoods", category: "Drivers", blockedUnder: "Display", quantity: 1, warehouseCode: "WH88"},
    {sku: "OG-BACKPACK-11-BLK", brand: "Ogio", category: "Backpacks", blockedUnder: "Photo sample", quantity: 1, warehouseCode: "WH90"},
  ]) {
    const variant = variantMap.get(record.sku);
    const warehouse = warehouseMap.get(record.warehouseCode);
    await BlockedStock.findOneAndUpdate(
      {sku: record.sku, blockedUnder: record.blockedUnder},
      {
        $set: {
          variantId: variant?._id ?? null,
          warehouseId: warehouse?._id ?? null,
          brand: record.brand,
          category: record.category,
          description: `${record.blockedUnder} sample allocation`,
          quantity: record.quantity,
          source: "manual",
        },
      },
      {upsert: true, returnDocument: "after"}
    );
  }

  const refreshedUsers = await User.find().lean();
  const refreshedBrands = await Brand.find().lean();
  const userLookup = new Map(refreshedUsers.map((user) => [user.email, user]));
  const brandLookup = new Map(refreshedBrands.map((brand) => [brand.code, brand]));

  for (const orderDefinition of DEMO_ORDERS) {
    const salesRep = userLookup.get(orderDefinition.salesRepEmail);
    const manager = userLookup.get(orderDefinition.managerEmail);
    const retailer = userLookup.get(orderDefinition.retailerEmail);
    const brand = brandLookup.get(orderDefinition.brandCode);

    if (!salesRep || !manager || !retailer || !brand) {
      continue;
    }

    const orderItems = orderDefinition.items
      .map((item) => {
        const variant = variantMap.get(item.sku);
        if (!variant) {
          return null;
        }

        const grossAmount = Number(variant.mrp) * item.quantity;
        const discount = calculateDiscountBreakdown({
          amount: grossAmount,
          gstRate: Number(variant.gstRate ?? 18),
          discountType: orderDefinition.discountType,
          discountValue: orderDefinition.discountValue,
        });

        const preferredWarehouse =
          warehouses.find((warehouse) =>
            inventoryByVariantWarehouse.has(`${variant._id.toString()}:${warehouse._id.toString()}`)
          ) ?? warehouses[0];

        return {
          variantId: variant._id,
          sku: variant.sku,
          name: variant.title,
          brandId: brand._id,
          brandName: brand.name,
          warehouseId: preferredWarehouse?._id ?? null,
          warehouseCode: preferredWarehouse?.code ?? "",
          quantity: item.quantity,
          mrp: Number(variant.mrp),
          gstRate: Number(variant.gstRate ?? 18),
          lineDiscountValue: orderDefinition.discountValue,
          lineDiscountAmount: discount.discountAmount,
          grossAmount,
          taxableAmount: discount.taxableAmount,
          taxAmount: discount.taxAmount,
          finalAmount: discount.finalAmount,
        };
      })
      .filter(Boolean);

    const totals = sumDiscountBreakdowns(
      orderItems.map((item) => ({
        discountType: orderDefinition.discountType,
        discountValue: orderDefinition.discountValue,
        discountAmount: Number(item?.lineDiscountAmount ?? 0),
        taxableAmount: Number(item?.taxableAmount ?? 0),
        taxAmount: Number(item?.taxAmount ?? 0),
        finalAmount: Number(item?.finalAmount ?? 0),
      }))
    );

    await Order.findOneAndUpdate(
      {orderNumber: orderDefinition.orderNumber},
      {
        $set: {
          createdById: salesRep._id,
          retailerId: retailer._id,
          managerId: manager._id,
          salesRepId: salesRep._id,
          brandId: brand._id,
          workflowStatus: orderDefinition.workflowStatus,
          participantSnapshots: {
            retailer: {
              name: retailer.name,
              email: retailer.email,
              role: retailer.roleKey,
              code: retailer.code,
              address: retailer.address,
              gstin: retailer.gstin,
            },
            manager: {
              name: manager.name,
              email: manager.email,
              role: manager.roleKey,
              code: manager.code,
            },
            salesRep: {
              name: salesRep.name,
              email: salesRep.email,
              role: salesRep.roleKey,
              code: salesRep.code,
            },
          },
          items: orderItems,
          pricing: {
            discountType: orderDefinition.discountType,
            discountValue: orderDefinition.discountValue,
            discountAmount: totals.discountAmount,
            subtotal: orderItems.reduce((sum, item) => sum + Number(item?.grossAmount ?? 0), 0),
            taxableAmount: totals.taxableAmount,
            taxAmount: totals.taxAmount,
            finalTotal: totals.finalAmount,
          },
          notesTimeline: [
            {
              message: orderDefinition.note,
              name: salesRep.name,
              userId: salesRep._id,
              access: "all",
              type: "user",
              createdAt: new Date(),
            },
          ],
        },
      },
      {upsert: true, returnDocument: "after"}
    );
  }

  const sampleRows = [
    {
      brandCode: "CG-APP",
      warehouseCode: "WH88",
      baseSku: "CGSG-POLO-001",
      sku: "CGSG-POLO-001-NAV-M",
      productName: "Callaway Tour Polo",
      plannedQty: 8,
    },
    {
      brandCode: "TM",
      warehouseCode: "WH88",
      baseSku: "TM-POLO-31",
      sku: "TM-POLO-31-WHT-L",
      productName: "Travis Mathew Wander Polo",
      plannedQty: 5,
    },
    {
      brandCode: "OG",
      warehouseCode: "WH90",
      baseSku: "OG-BACKPACK-11",
      sku: "OG-BACKPACK-11-BLK",
      productName: "Ogio Pace Pro Backpack",
      plannedQty: 3,
    },
  ];

  const calibrationLookup = {
    brands: refreshedBrands.map((brand) => ({
      id: brand._id.toString(),
      name: brand.name,
      code: brand.code,
    })),
    products: (await Product.find().lean()).map((product) => ({
      id: product._id.toString(),
      name: product.name,
      baseSku: product.baseSku,
      brandId: String(product.brandId ?? ""),
      category: product.category,
      subcategory: product.subcategory,
    })),
    variants: allVariants.map((variant) => ({
      id: variant._id.toString(),
      sku: variant.sku,
      productId: String(variant.productId ?? ""),
      title: variant.title,
    })),
    warehouses: warehouses.map((warehouse) => ({
      id: warehouse._id.toString(),
      code: warehouse.code,
      name: warehouse.name,
    })),
  };

  const calibratedRows = calibrateSheetRows(sampleRows, calibrationLookup);
  const summary = summarizeCalibratedRows(calibratedRows);
  const dataset = await SheetDataset.findOneAndUpdate(
    {slug: "seeded-calibration-demo"},
    {
      $set: {
        name: "Seeded Calibration Demo",
        type: "brand_calibration",
        sourceFileName: "seeded-calibration-demo.csv",
        description: "Demo calibration rows created during workspace seeding.",
        columns: Object.keys(sampleRows[0]),
        rowCount: calibratedRows.length,
        summary: {
          matched: summary.matched,
          partial: summary.partial,
          unmatched: summary.unmatched,
          issueCount: summary.issueCount,
        },
      },
    },
    {upsert: true, returnDocument: "after"}
  );

  await SheetRow.deleteMany({datasetId: dataset._id});
  await SheetRow.insertMany(
    calibratedRows.map((row) => ({
      datasetId: dataset._id,
      rowIndex: row.rowIndex,
      data: row.data,
      relation: row.relation,
    }))
  );

  globalSeedState.__calloneWorkspaceSeeded = true;
}
