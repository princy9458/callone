import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {saveProduct} from "@/lib/actions/products";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";

export default async function NewProductPage() {
  await dbConnect();
  const brands = await Brand.find({isActive: true}).sort({name: 1}).lean();

  return (
    <div className="space-y-8">
      <PageHeader title="Create product" description="Brand-aware product creation with option definitions that generate purchasable variants." backHref="/admin/products" />
      <SectionCard title="Catalog definition" description="Use one line per option in the format `Color=Blue|White|Black`. Variants will be regenerated on save.">
        <form action={saveProduct} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Base SKU</span>
            <input name="baseSku" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Brand</span>
            <select name="brandId" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required>
              <option value="">Select brand</option>
              {brands.map((brand) => (
                <option key={brand._id.toString()} value={brand._id.toString()}>{brand.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Category</span>
            <input name="category" placeholder="Polos" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Subcategory</span>
            <input name="subcategory" placeholder="Mens" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Product type</span>
            <select name="productType" defaultValue="apparel" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="hardgoods">Hardgoods</option>
              <option value="apparel">Apparel</option>
              <option value="softgoods">Softgoods</option>
              <option value="accessory">Accessory</option>
              <option value="custom">Custom</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Status</span>
            <select name="status" defaultValue="draft" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">List price</span>
            <input name="listPrice" type="number" defaultValue="0" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Tax rate</span>
            <input name="taxRate" type="number" defaultValue="18" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Description</span>
            <textarea name="description" rows={4} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Option definitions</span>
            <textarea name="optionDefinitions" rows={5} placeholder={`Color=Blue|White|Black\nSize=S|M|L|XL`} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 font-mono text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Primary image path</span>
            <input name="primaryImagePath" placeholder="/images/products/callaway/polo.jpg" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Legacy table</span>
            <input name="legacyTable" placeholder="callaway_apparel" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Gallery paths</span>
            <textarea name="galleryPaths" rows={3} placeholder="/images/products/callaway/polo-1.jpg&#10;/images/products/callaway/polo-2.jpg" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Create product</button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
