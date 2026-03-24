import Link from "next/link";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {deleteUser, saveUser} from "@/lib/actions/users";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";
import {Warehouse} from "@/lib/db/models/Warehouse";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await dbConnect();
  const [users, roles, brands, warehouses, managers] = await Promise.all([
    User.find().sort({name: 1}).lean(),
    Role.find({isActive: true}).sort({name: 1}).lean(),
    Brand.find({isActive: true}).sort({name: 1}).lean(),
    Warehouse.find({isActive: true}).sort({priority: 1}).lean(),
    User.find({roleKey: {$in: ["super_admin", "admin", "manager"]}}).sort({name: 1}).lean(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Users"
        description="Manage admin accounts, reporting hierarchy, brand assignments, and warehouse access."
        action={
          <Link
            href="/api/admin/export/users"
            className="rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground/75"
          >
            Export CSV
          </Link>
        }
      />
      <SectionCard title="Create user">
        <form action={saveUser} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Email</span>
            <input name="email" type="email" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Password</span>
            <input name="password" type="password" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Role</span>
            <select name="roleId" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required>
              <option value="">Select role</option>
              {roles.map((role) => (
                <option key={role._id.toString()} value={role._id.toString()}>{role.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Designation</span>
            <input name="designation" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Manager</span>
            <select name="managerId" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="">No manager</option>
              {managers.map((manager) => (
                <option key={manager._id.toString()} value={manager._id.toString()}>{manager.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Phone</span>
            <input name="phone" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Code</span>
            <input name="code" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Address</span>
            <textarea name="address" rows={3} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Assigned brands</span>
            <select name="assignedBrandIds" multiple size={4} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              {brands.map((brand) => (
                <option key={brand._id.toString()} value={brand._id.toString()}>{brand.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Assigned warehouses</span>
            <select name="assignedWarehouseIds" multiple size={4} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              {warehouses.map((warehouse) => (
                <option key={warehouse._id.toString()} value={warehouse._id.toString()}>{warehouse.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Status</span>
            <select name="status" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Save user</button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="User list">
        <DataTable headers={["User", "Role", "Manager", "Status", "Actions"]}>
          {users.map((user) => {
            const manager = managers.find((candidate) => candidate._id.toString() === String(user.managerId ?? ""));
            const role = roles.find((candidate) => candidate._id.toString() === String(user.roleId));
            return (
              <tr key={user._id.toString()}>
                <td className="px-4 py-4">
                  <div className="font-semibold text-foreground">{user.name}</div>
                  <p className="text-xs text-foreground/55">{user.email}</p>
                </td>
                <td className="px-4 py-4 text-sm text-foreground/70">{role?.name ?? user.roleKey}</td>
                <td className="px-4 py-4 text-sm text-foreground/70">{manager?.name ?? "None"}</td>
                <td className="px-4 py-4 text-sm text-foreground/70">{user.status}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/users/${user._id.toString()}/edit`} className="text-sm font-semibold text-primary">Edit</Link>
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={user._id.toString()} />
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
