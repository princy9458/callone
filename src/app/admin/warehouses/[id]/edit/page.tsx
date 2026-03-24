import {notFound} from "next/navigation";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {saveWarehouse} from "@/lib/actions/warehouses";
import dbConnect from "@/lib/db/connection";
import {Warehouse} from "@/lib/db/models/Warehouse";

export default async function EditWarehousePage({params}: {params: {id: string}}) {
  await dbConnect();
  const warehouse = await Warehouse.findById(params.id).lean();

  if (!warehouse) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader title={`Edit ${warehouse.name}`} description="Update warehouse routing metadata and active/default flags." backHref="/admin/warehouses" />
      <SectionCard title="Warehouse details">
        <form action={saveWarehouse} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="id" value={warehouse._id.toString()} />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Code</span>
            <input name="code" defaultValue={warehouse.code} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" defaultValue={warehouse.name} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Location</span>
            <input name="location" defaultValue={warehouse.location} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Priority</span>
            <input name="priority" type="number" defaultValue={warehouse.priority} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isDefault" defaultChecked={warehouse.isDefault} className="h-4 w-4 rounded border-border/70" />
            Default warehouse
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isActive" defaultChecked={warehouse.isActive} className="h-4 w-4 rounded border-border/70" />
            Active
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Update warehouse</button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
