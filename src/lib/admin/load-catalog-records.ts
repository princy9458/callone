import { ProductCatalogRecord } from "@/components/products/ProductType";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {Product} from "@/lib/db/models/Product";
import {Variant} from "@/lib/db/models/Variant";
import {toPlainObject} from "@/lib/utils/serialization";

export async function loadCatalogRecords() {
  await dbConnect();

  const [productsRaw, brandsRaw, variantsRaw, inventoryLevelsRaw] = await Promise.all([
    Product.find().sort({updatedAt: -1}).lean(),
    Brand.find().lean(),
    Variant.find().lean(),
    InventoryLevel.find().lean(),
  ]);

  const products = toPlainObject(productsRaw);
  const brands = toPlainObject(brandsRaw);
  const variants = toPlainObject(variantsRaw);
  const inventoryLevels = toPlainObject(inventoryLevelsRaw);

  const brandMap = new Map(
    brands.map((brand) => [
      String(brand._id ?? ""),
      {
        id: String(brand._id ?? ""),
        name: brand.name,
        code: brand.code,
      },
    ])
  );

  const inventoryByVariantId = new Map<string, number>();
  for (const inventory of inventoryLevels) {
    const variantId = String(inventory.variantId ?? "");
    if (!variantId) {
      continue;
    }
    inventoryByVariantId.set(
      variantId,
      (inventoryByVariantId.get(variantId) ?? 0) + Number(inventory.available ?? 0)
    );
  }

  const variantsByProductId = new Map<string, typeof variants>();
  for (const variant of variants) {
    const productId = String(variant.productId ?? "");
    if (!productId) {
      continue;
    }
    const existing = variantsByProductId.get(productId) ?? [];
    existing.push(variant);
    variantsByProductId.set(productId, existing);
  }

  const catalog: ProductCatalogRecord[] = products.map((product) => {
    const productId = String(product._id ?? "");
    const brand = brandMap.get(String(product.brandId ?? "")) ?? {
      id: "unknown",
      name: "Unknown brand",
      code: "NA",
    };
    const productVariants = variantsByProductId.get(productId) ?? [];
    const optionDefinitions = (product.optionDefinitions ?? []) as Array<{
      key: string;
      label: string;
      values?: string[];
    }>;

    return {
      id: productId,
      name: product.name ?? "Untitled product",
      slug: product.slug ?? "",
      baseSku: product.baseSku ?? "",
      brand,
      category: product.category ?? "",
      subcategory: product.subcategory ?? "",
      productType: product.productType ?? "",
      status: product.status ?? "draft",
      availableStock: productVariants.reduce(
        (sum, variant) => sum + (inventoryByVariantId.get(String(variant._id ?? "")) ?? 0),
        0
      ),
      variantCount: productVariants.length,
      variantSkus: productVariants.map((variant) => variant.sku ?? ""),
      variantTitles: productVariants.map((variant) => variant.title ?? ""),
      variants: productVariants.map((variant) => ({
        id: String(variant._id ?? ""),
        sku: variant.sku ?? "",
        title: variant.title ?? "",
        optionValues: Object.fromEntries(
          Object.entries((variant.optionValues ?? {}) as Record<string, unknown>).map(([key, value]) => [
            key,
            String(value),
          ])
        ),
        availableStock: inventoryByVariantId.get(String(variant._id ?? "")) ?? 0,
      })),
      attributeGroups: optionDefinitions.map((group) => ({
        key: group.key,
        label: group.label,
        values: Array.from(new Set(group.values ?? [])).sort((left, right) => left.localeCompare(right)),
      })),
      updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date(0).toISOString(),
    };
  });

  return {
    catalog,
    brands: brands.map((brand) => ({
      id: String(brand._id ?? ""),
      name: brand.name,
      code: brand.code,
      slug: brand.slug,
    })),
  };
}
