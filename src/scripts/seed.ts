import {ensureSystemBootstrap} from "../lib/auth/bootstrap";
import dbConnect from "../lib/db/connection";
import {Brand} from "../lib/db/models/Brand";
import {InventoryLevel} from "../lib/db/models/InventoryLevel";
import {Product} from "../lib/db/models/Product";
import {Variant} from "../lib/db/models/Variant";
import {Warehouse} from "../lib/db/models/Warehouse";
import {generateVariantCombinations} from "../lib/utils/variant-combinations";
import {slugify} from "../lib/utils/slugify";

async function main() {
  await dbConnect();
  await ensureSystemBootstrap();

  const brand = await Brand.findOne({code: "CG-APP"});
  if (!brand) {
    throw new Error("Bootstrap brands are missing.");
  }

  const existingProduct = await Product.findOne({baseSku: "CG-PRO-SEED-001"});
  if (existingProduct) {
    console.log("Seed product already exists. Skipping.");
    process.exit(0);
  }

  const optionDefinitions = [
    {key: "color", label: "Color", values: ["Blue", "White"], useForVariants: true},
    {key: "size", label: "Size", values: ["S", "M", "L"], useForVariants: true},
  ];

  const product = await Product.create({
    name: "Callaway Seed Polo",
    slug: slugify("Callaway Seed Polo"),
    baseSku: "CG-PRO-SEED-001",
    brandId: brand._id,
    category: "Polos",
    subcategory: "Mens",
    productType: "apparel",
    description: "Seed product for admin rebuild validation.",
    status: "active",
    taxRate: 18,
    listPrice: 5990,
    optionDefinitions,
    media: {
      primaryImagePath: "/images/products/callaway/seed-polo.jpg",
      galleryPaths: [],
    },
    metadata: {
      season: "Bootstrap",
    },
  });

  const warehouses = await Warehouse.find({isActive: true}).sort({priority: 1});
  const combinations = generateVariantCombinations(optionDefinitions);
  const variants = await Variant.insertMany(
    combinations.map((combination, index) => ({
      productId: product._id,
      sku: `CG-PRO-SEED-001-${index + 1}`,
      title: combination.title,
      optionValues: combination.optionValues,
      mrp: 5990,
      gstRate: 18,
      cost: 0,
      status: "active",
    }))
  );

  await InventoryLevel.insertMany(
    variants.flatMap((variant, index) =>
      warehouses.map((warehouse, warehouseIndex) => ({
        variantId: variant._id,
        warehouseId: warehouse._id,
        onHand: warehouseIndex === 0 ? 10 - index : 2 + index,
        reserved: 0,
        blocked: 0,
        available: 0,
      }))
    )
  );

  console.log("Seed completed successfully.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
