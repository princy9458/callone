import {notFound} from "next/navigation";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {saveRole} from "@/lib/actions/roles";
import dbConnect from "@/lib/db/connection";
import {Role} from "@/lib/db/models/Role";

export default async function EditRolePage({params}: {params: {id: string}}) {
  await dbConnect();
  const role = await Role.findById(params.id).lean();

  if (!role) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader title={`Edit ${role.name}`} description="Update role metadata and permission bundles." backHref="/admin/roles" />
      <SectionCard title="Role details">
        <form action={saveRole} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="id" value={role._id.toString()} />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Key</span>
            <input name="key" defaultValue={role.key} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" defaultValue={role.name} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Description</span>
            <input name="description" defaultValue={role.description} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Permissions</span>
            <input name="permissions" defaultValue={role.permissions.join(", ")} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isActive" defaultChecked={role.isActive} className="h-4 w-4 rounded border-border/70" />
            Active
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Update role</button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
