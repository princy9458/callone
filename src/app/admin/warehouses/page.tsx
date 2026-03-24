import Link from "next/link";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {deleteWarehouse, saveWarehouse} from "@/lib/actions/warehouses";
import dbConnect from "@/lib/db/connection";
import {InventoryLevel} from "@/lib/db/models/InventoryLevel";
import {Warehouse} from "@/lib/db/models/Warehouse";

export const dynamic = "force-dynamic";

export default async function WarehousesPage() {
  await dbConnect();
  const [warehouses, inventoryLevels] = await Promise.all([
    Warehouse.find().sort({priority: 1, code: 1}).lean(),
    InventoryLevel.find().lean(),
  ]);

  const inventorySummary = new Map<
    string,
    {skuCount: number; onHand: number; reserved: number; available: number}
  >();

  for (const level of inventoryLevels) {
    const warehouseId = level.warehouseId.toString();
    const current = inventorySummary.get(warehouseId) ?? {
      skuCount: 0,
      onHand: 0,
      reserved: 0,
      available: 0,
    };

    inventorySummary.set(warehouseId, {
      skuCount: current.skuCount + 1,
      onHand: current.onHand + Number(level.onHand ?? 0),
      reserved: current.reserved + Number(level.reserved ?? 0),
      available: current.available + Number(level.available ?? 0),
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Warehouses"
        description="Replace fixed stock columns with reusable warehouse records and live stock reservations."
        action={
          <Link
            href="/api/admin/export/warehouses"
            className="rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground/75"
          >
            Export CSV
          </Link>
        }
      />
      <SectionCard title="Create warehouse">
        <form action={saveWarehouse} className="grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Code</span>
            <input name="code" placeholder="WH88" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Name</span>
            <input name="name" placeholder="Primary Warehouse 88" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Location</span>
            <input name="location" placeholder="Bengaluru" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Priority</span>
            <input name="priority" type="number" defaultValue="10" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isDefault" className="h-4 w-4 rounded border-border/70" />
            Default warehouse
          </label>
          <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground/70">
            <input type="checkbox" name="isActive" defaultChecked className="h-4 w-4 rounded border-border/70" />
            Active
          </label>
          <div className="lg:col-span-2 flex justify-end">
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Save warehouse</button>
          </div>
        </form>
      </SectionCard>
      <SectionCard title="Warehouse list">
        <DataTable headers={["Warehouse", "Code", "SKUs", "On hand", "Reserved", "Available", "Status", "Actions"]}>
          {warehouses.map((warehouse) => {
            const summary = inventorySummary.get(warehouse._id.toString()) ?? {
              skuCount: 0,
              onHand: 0,
              reserved: 0,
              available: 0,
            };

            return (
            <tr key={warehouse._id.toString()}>
              <td className="px-4 py-4">
                <div className="font-semibold text-foreground">{warehouse.name}</div>
                <p className="text-xs text-foreground/55">{warehouse.location || "No location set"}</p>
              </td>
              <td className="px-4 py-4 text-sm text-foreground/70">{warehouse.code}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{summary.skuCount}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{summary.onHand}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{summary.reserved}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{summary.available}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{warehouse.isDefault ? "Default" : warehouse.isActive ? "Active" : "Inactive"}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Link href={`/admin/warehouses/${warehouse._id.toString()}/edit`} className="text-sm font-semibold text-primary">Edit</Link>
                  <form action={deleteWarehouse}>
                    <input type="hidden" name="id" value={warehouse._id.toString()} />
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
