"use server";

import {revalidatePath} from "next/cache";
import {redirect} from "next/navigation";
import dbConnect from "@/lib/db/connection";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {Product} from "@/lib/db/models/Product";
import {Variant} from "@/lib/db/models/Variant";
import {Warehouse} from "@/lib/db/models/Warehouse";
import {slugify} from "@/lib/utils/slugify";
import {generateVariantCombinations} from "@/lib/utils/variant-combinations";

type ParsedOption = {
  key: string;
  label: string;
  values: string[];
  useForVariants: boolean;
};

function parseOptions(input: string): ParsedOption[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [labelPart, valuesPart] = line.split("=");
      const label = labelPart.trim();
      const key = slugify(label).replace(/-/g, "_");
      const values = (valuesPart ?? "")
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean);
      return {key, label, values, useForVariants: true};
    });
}

function optionSuffix(optionValues: Record<string, string>) {
  return Object.values(optionValues)
    .map((value) =>
      value
        .split(" ")
        .map((part) => part.slice(0, 3).toUpperCase())
        .join("")
    )
    .join("-");
}

async function regenerateVariants({
  productId,
  baseSku,
  listPrice,
  taxRate,
  optionDefinitions,
  status,
}: {
  productId: string;
  baseSku: string;
  listPrice: number;
  taxRate: number;
  optionDefinitions: ParsedOption[];
  status: string;
}) {
  const warehouses = await Warehouse.find({isActive: true}).sort({priority: 1}).lean();

  await InventoryLevel.deleteMany({variantId: {$in: await Variant.find({productId}).distinct("_id")}});
  await Variant.deleteMany({productId});

  const combinations = generateVariantCombinations(optionDefinitions);
  const records = combinations.length
    ? combinations.map((combo) => ({
        productId,
        sku: `${baseSku}-${optionSuffix(combo.optionValues)}`,
        title: combo.title,
        optionValues: combo.optionValues,
        mrp: listPrice,
        gstRate: taxRate,
        status,
      }))
    : [
        {
          productId,
          sku: baseSku,
          title: "Default",
          optionValues: {},
          mrp: listPrice,
          gstRate: taxRate,
          status,
        },
      ];

  const createdVariants = await Variant.insertMany(records);
  if (!warehouses.length) {
    return;
  }

  await InventoryLevel.insertMany(
    createdVariants.flatMap((variant) =>
      warehouses.map((warehouse) => ({
        variantId: variant._id,
        warehouseId: warehouse._id,
        onHand: 0,
        reserved: 0,
        blocked: 0,
        available: 0,
      }))
    )
  );
}

export async function saveProduct(formData: FormData) {
  await dbConnect();

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const baseSku = String(formData.get("baseSku") ?? "").trim().toUpperCase();
  const brandId = String(formData.get("brandId") ?? "").trim();

  if (!name || !baseSku || !brandId) {
    throw new Error("Product name, base SKU, and brand are required.");
  }

  const optionDefinitions = parseOptions(String(formData.get("optionDefinitions") ?? ""));
  const payload = {
    name,
    slug: slugify(String(formData.get("slug") ?? "") || name),
    baseSku,
    brandId,
    category: String(formData.get("category") ?? "").trim(),
    subcategory: String(formData.get("subcategory") ?? "").trim(),
    productType: String(formData.get("productType") ?? "apparel"),
    description: String(formData.get("description") ?? "").trim(),
    status: String(formData.get("status") ?? "draft"),
    taxRate: Number(formData.get("taxRate") ?? 18),
    listPrice: Number(formData.get("listPrice") ?? 0),
    optionDefinitions,
    media: {
      primaryImagePath: String(formData.get("primaryImagePath") ?? "").trim(),
      galleryPaths: String(formData.get("galleryPaths") ?? "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
    },
    metadata: {
      legacyTable: String(formData.get("legacyTable") ?? "").trim(),
      legacyStyleId: String(formData.get("legacyStyleId") ?? "").trim(),
    },
  };

  let productId = id;
  if (id) {
    await Product.findByIdAndUpdate(id, payload, {runValidators: true});
  } else {
    const product = await Product.create(payload);
    productId = product._id.toString();
  }

  await regenerateVariants({
    productId,
    baseSku: payload.baseSku,
    listPrice: payload.listPrice,
    taxRate: payload.taxRate,
    optionDefinitions,
    status: payload.status,
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}

export async function deleteProduct(formData: FormData) {
  await dbConnect();
  const id = String(formData.get("id") ?? "").trim();
  const variantIds = await Variant.find({productId: id}).distinct("_id");
  await InventoryLevel.deleteMany({variantId: {$in: variantIds}});
  await Variant.deleteMany({productId: id});
  await Product.findByIdAndDelete(id);
  revalidatePath("/admin/products");
  redirect("/admin/products");
}
