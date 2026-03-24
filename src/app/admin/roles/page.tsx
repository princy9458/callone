import Link from "next/link";
import dbConnect from "@/lib/db/connection";
import {deleteRole, saveRole} from "@/lib/actions/roles";
import {Role} from "@/lib/db/models/Role";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  await dbConnect();
  const roles = await Role.find().sort({isSystem: -1, name: 1}).lean();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Roles"
        description="Define reusable permission bundles for CallawayOne admin access."
        action={
          <Link
            href="/api/admin/export/roles"
            className="rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground/75"
          >
            Export CSV
          </Link>
        }
      />

      <SectionCard title="Create role" description="Custom roles are stored in Mongo and attached to users for auth + RBAC.">
        <form action={saveRole} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Key</span>
            <input name="key" placeholder="pricing_analyst" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" placeholder="Pricing Analyst" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Description</span>
            <input name="description" placeholder="Can review catalog pricing and exports." className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Permissions</span>
            <input name="permissions" placeholder="catalog.view, orders.view, exports.manage" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-border/70" />
            Active
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Save role</button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Role list">
        <DataTable headers={["Role", "Key", "Permissions", "Status", "Actions"]}>
          {roles.map((role) => (
            <tr key={role._id.toString()} className="align-top">
              <td className="px-4 py-4">
                <div className="font-semibold text-foreground">{role.name}</div>
                <p className="text-xs text-foreground/55">{role.description || "No description"}</p>
              </td>
              <td className="px-4 py-4 font-mono text-xs text-foreground/70">{role.key}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{role.permissions.join(", ") || "No permissions"}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{role.isSystem ? "System" : role.isActive ? "Active" : "Inactive"}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/roles/${role._id.toString()}/edit`} className="text-sm font-semibold text-primary">Edit</Link>
                  {!role.isSystem ? (
                    <form action={deleteRole}>
                      <input type="hidden" name="id" value={role._id.toString()} />
                      <button type="submit" className="text-sm font-semibold text-danger">Delete</button>
                    </form>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </div>
  );
}
