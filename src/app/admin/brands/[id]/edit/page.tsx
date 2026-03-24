import {notFound} from "next/navigation";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {saveBrand} from "@/lib/actions/brands";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";

export default async function EditBrandPage({params}: {params: {id: string}}) {
  await dbConnect();
  const brand = await Brand.findById(params.id).lean();

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader title={`Edit ${brand.name}`} description="Update brand presentation, media paths, and catalog metadata." backHref="/admin/brands" />
      <SectionCard title="Brand details">
        <form action={saveBrand} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="id" value={brand._id.toString()} />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" defaultValue={brand.name} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Code</span>
            <input name="code" defaultValue={brand.code} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Slug</span>
            <input name="slug" defaultValue={brand.slug} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Website</span>
            <input name="websiteUrl" defaultValue={brand.websiteUrl} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Description</span>
            <textarea name="description" rows={4} defaultValue={brand.description} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Logo path</span>
            <input name="logoPath" defaultValue={brand.media?.logoPath} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Thumbnail path</span>
            <input name="thumbnailPath" defaultValue={brand.media?.thumbnailPath} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Slider paths</span>
            <textarea name="sliderPaths" rows={4} defaultValue={brand.media?.sliderPaths?.join("\n")} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isActive" defaultChecked={brand.isActive} className="h-4 w-4 rounded border-border/70" />
            Active
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Update brand</button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
