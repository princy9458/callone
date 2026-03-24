import Link from "next/link";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {deleteProduct} from "@/lib/actions/products";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {Product} from "@/lib/db/models/Product";
import {Variant} from "@/lib/db/models/Variant";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  await dbConnect();

  const [products, brands, variants, inventoryLevels] = await Promise.all([
    Product.find().sort({updatedAt: -1}).lean(),
    Brand.find().lean(),
    Variant.find().lean(),
    InventoryLevel.find().lean(),
  ]);

  const brandMap = new Map(brands.map((brand) => [brand._id.toString(), brand.name]));
  const variantMap = new Map<string, typeof variants>();
  const inventoryMap = new Map<string, number>();

  for (const variant of variants) {
    const productId = String(variant.productId);
    const existing = variantMap.get(productId) ?? [];
    existing.push(variant);
    variantMap.set(productId, existing);
  }

  for (const inventory of inventoryLevels) {
    const variantId = String(inventory.variantId);
    inventoryMap.set(variantId, (inventoryMap.get(variantId) ?? 0) + inventory.available);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Products"
        description="Unified product catalog across brands with reusable option definitions, generated variants, and warehouse inventory."
        action={
          <>
            <Link
              href="/api/admin/export/products"
              className="rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground/75"
            >
              Export CSV
            </Link>
            <Link href="/admin/products/new" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              New product
            </Link>
          </>
        }
      />
      <SectionCard title="Catalog">
        <DataTable headers={["Product", "Brand", "Variants", "Available stock", "Status", "Actions"]}>
          {products.map((product) => {
            const productVariants = variantMap.get(product._id.toString()) ?? [];
            const stock = productVariants.reduce(
              (sum, variant) => sum + (inventoryMap.get(variant._id.toString()) ?? 0),
              0
            );

            return (
              <tr key={product._id.toString()}>
                <td className="px-4 py-4">
                  <div className="font-semibold text-foreground">{product.name}</div>
                  <p className="text-xs text-foreground/55">{product.baseSku} · {product.category}</p>
                </td>
                <td className="px-4 py-4 text-sm text-foreground/70">{brandMap.get(String(product.brandId)) ?? "Unknown brand"}</td>
                <td className="px-4 py-4 text-sm text-foreground/70">{productVariants.length}</td>
                <td className="px-4 py-4 text-sm text-foreground/70">{stock}</td>
                <td className="px-4 py-4 text-sm text-foreground/70">{product.status}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${product._id.toString()}/edit`} className="text-sm font-semibold text-primary">Edit</Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={product._id.toString()} />
                      <button type="submit" className="text-sm font-semibold text-danger">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </SectionCard>
    </div>
  );
}
