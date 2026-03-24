import {notFound} from "next/navigation";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {saveProduct} from "@/lib/actions/products";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Product} from "@/lib/db/models/Product";

export default async function EditProductPage({params}: {params: {id: string}}) {
  await dbConnect();
  const [product, brands] = await Promise.all([
    Product.findById(params.id).lean(),
    Brand.find({isActive: true}).sort({name: 1}).lean(),
  ]);

  if (!product) {
    notFound();
  }

  const optionDefinitions = (product.optionDefinitions ?? [])
    .map((option: any) => `${option.label}=${option.values.join("|")}`)
    .join("\n");

  return (
    <div className="space-y-8">
      <PageHeader title={`Edit ${product.name}`} description="Updating option definitions will regenerate variants for this product." backHref="/admin/products" />
      <SectionCard title="Catalog definition">
        <form action={saveProduct} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="id" value={product._id.toString()} />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" defaultValue={product.name} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Base SKU</span>
            <input name="baseSku" defaultValue={product.baseSku} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Brand</span>
            <select name="brandId" defaultValue={String(product.brandId)} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required>
              {brands.map((brand) => (
                <option key={brand._id.toString()} value={brand._id.toString()}>{brand.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Category</span>
            <input name="category" defaultValue={product.category} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Subcategory</span>
            <input name="subcategory" defaultValue={product.subcategory} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Product type</span>
            <select name="productType" defaultValue={product.productType} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="hardgoods">Hardgoods</option>
              <option value="apparel">Apparel</option>
              <option value="softgoods">Softgoods</option>
              <option value="accessory">Accessory</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Status</span>
            <select name="status" defaultValue={product.status} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">List price</span>
            <input name="listPrice" type="number" defaultValue={product.listPrice} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Tax rate</span>
            <input name="taxRate" type="number" defaultValue={product.taxRate} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Description</span>
            <textarea name="description" rows={4} defaultValue={product.description} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Option definitions</span>
            <textarea name="optionDefinitions" rows={5} defaultValue={optionDefinitions} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 font-mono text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Primary image path</span>
            <input name="primaryImagePath" defaultValue={product.media?.primaryImagePath} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Legacy table</span>
            <input name="legacyTable" defaultValue={product.metadata?.legacyTable ?? ""} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Gallery paths</span>
            <textarea name="galleryPaths" rows={3} defaultValue={product.media?.galleryPaths?.join("\n")} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Update product</button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
