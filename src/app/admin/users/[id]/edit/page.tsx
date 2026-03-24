import {notFound} from "next/navigation";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {saveUser} from "@/lib/actions/users";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Role} from "@/lib/db/models/Role";
import {User} from "@/lib/db/models/User";
import {Warehouse} from "@/lib/db/models/Warehouse";

export default async function EditUserPage({params}: {params: {id: string}}) {
  await dbConnect();
  const [user, roles, brands, warehouses, managers] = await Promise.all([
    User.findById(params.id).lean(),
    Role.find({isActive: true}).sort({name: 1}).lean(),
    Brand.find({isActive: true}).sort({name: 1}).lean(),
    Warehouse.find({isActive: true}).sort({priority: 1}).lean(),
    User.find({roleKey: {$in: ["super_admin", "admin", "manager"]}}).sort({name: 1}).lean(),
  ]);

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader title={`Edit ${user.name}`} description="Update auth and assignment metadata for this user." backHref="/admin/users" />
      <SectionCard title="User details">
        <form action={saveUser} className="grid gap-4 lg:grid-cols-2">
          <input type="hidden" name="id" value={user._id.toString()} />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" defaultValue={user.name} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Email</span>
            <input name="email" type="email" defaultValue={user.email} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">New password</span>
            <input name="password" type="password" placeholder="Leave empty to keep current password" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Role</span>
            <select name="roleId" defaultValue={String(user.roleId)} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required>
              {roles.map((role) => (
                <option key={role._id.toString()} value={role._id.toString()}>{role.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Designation</span>
            <input name="designation" defaultValue={user.designation} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Manager</span>
            <select name="managerId" defaultValue={String(user.managerId ?? "")} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="">No manager</option>
              {managers.map((manager) => (
                <option key={manager._id.toString()} value={manager._id.toString()}>{manager.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Phone</span>
            <input name="phone" defaultValue={user.phone} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Code</span>
            <input name="code" defaultValue={user.code} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Address</span>
            <textarea name="address" rows={3} defaultValue={user.address} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Assigned brands</span>
            <select name="assignedBrandIds" multiple size={4} defaultValue={user.assignedBrandIds.map((item: any) => String(item))} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              {brands.map((brand) => (
                <option key={brand._id.toString()} value={brand._id.toString()}>{brand.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Assigned warehouses</span>
            <select name="assignedWarehouseIds" multiple size={4} defaultValue={user.assignedWarehouseIds.map((item: any) => String(item))} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              {warehouses.map((warehouse) => (
                <option key={warehouse._id.toString()} value={warehouse._id.toString()}>{warehouse.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Status</span>
            <select name="status" defaultValue={user.status} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Update user</button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
