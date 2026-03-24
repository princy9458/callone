import Link from "next/link";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {deleteBrand, saveBrand} from "@/lib/actions/brands";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";

export const dynamic = "force-dynamic";

export default async function BrandsPage() {
  await dbConnect();
  const brands = await Brand.find().sort({name: 1}).lean();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Brands"
        description="Admin CRUD for Callaway Hardgoods, Callaway Apparel, Travis Mathew, Ogio, and future brand verticals."
        action={
          <Link
            href="/api/admin/export/brands"
            className="rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground/75"
          >
            Export CSV
          </Link>
        }
      />
      <SectionCard title="Create brand">
        <form action={saveBrand} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" placeholder="Callaway Apparel" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Code</span>
            <input name="code" placeholder="CG-APP" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Slug</span>
            <input name="slug" placeholder="callaway-apparel" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Website</span>
            <input name="websiteUrl" placeholder="https://www.callawaygolf.com" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Description</span>
            <textarea name="description" rows={3} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Logo path</span>
            <input name="logoPath" placeholder="/images/brands/callaway/logo.png" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Thumbnail path</span>
            <input name="thumbnailPath" placeholder="/images/brands/callaway/thumb.png" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Slider paths</span>
            <textarea name="sliderPaths" rows={3} placeholder="/images/brands/callaway/slide-1.jpg&#10;/images/brands/callaway/slide-2.jpg" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-border/70" />
            Active
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Save brand</button>
          </div>
        </form>
      </SectionCard>
      <SectionCard title="Brand list">
        <DataTable headers={["Brand", "Code", "Website", "Status", "Actions"]}>
          {brands.map((brand) => (
            <tr key={brand._id.toString()}>
              <td className="px-4 py-4">
                <div className="font-semibold text-foreground">{brand.name}</div>
                <p className="text-xs text-foreground/55">{brand.slug}</p>
              </td>
              <td className="px-4 py-4 text-sm text-foreground/70">{brand.code}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{brand.websiteUrl || "Not set"}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{brand.isActive ? "Active" : "Inactive"}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/brands/${brand._id.toString()}/edit`} className="text-sm font-semibold text-primary">Edit</Link>
                  <form action={deleteBrand}>
                    <input type="hidden" name="id" value={brand._id.toString()} />
                    <button type="submit" className="text-sm font-semibold text-danger">Delete</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </div>
  );
}
