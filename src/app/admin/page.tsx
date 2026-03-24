import {FileClock, Package, ShoppingBag, Users, Warehouse} from "lucide-react";
import dbConnect from "@/lib/db/connection";
import {Brand} from "@/lib/db/models/Brand";
import {Order} from "@/lib/db/models/Order";
import {Product} from "@/lib/db/models/Product";
import {User} from "@/lib/db/models/User";
import {Warehouse as WarehouseModel} from "@/lib/db/models/Warehouse";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {StatCard} from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  await dbConnect();

  const [orderCount, productCount, userCount, warehouseCount, brandCount, pendingOrders] =
    await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments({roleKey: {$ne: "retailer"}}),
      WarehouseModel.countDocuments(),
      Brand.countDocuments(),
      Order.countDocuments({workflowStatus: {$in: ["submitted", "availability_check", "manager_approval"]}}),
    ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin overview"
        description="Live status for the CallawayOne admin rebuild. This dashboard now reflects Mongo-backed counts across catalog, users, orders, warehouses, and brand structure."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Orders" value={orderCount} hint={`${pendingOrders} pending workflow actions`} icon={ShoppingBag} />
        <StatCard label="Products" value={productCount} hint={`${brandCount} active brand collections`} icon={Package} />
        <StatCard label="Admin users" value={userCount} hint="Managers, admins, and sales reps" icon={Users} />
        <StatCard label="Warehouses" value={warehouseCount} hint="Dynamic inventory locations" icon={Warehouse} />
        <StatCard label="Pending approvals" value={pendingOrders} hint="Submitted, availability, manager approval" icon={FileClock} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard
          title="Current implementation status"
          description="The rebuild now uses Mongo-backed auth and normalized admin entities. The next layers are deeper order editing, attachment workflows, import pipelines, and PDF/catalog generation."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[24px] border border-border/60 bg-background/70 p-5">
              <h3 className="text-base font-semibold text-foreground">Operational now</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground/65">
                <li>Mongo-backed credentials with RBAC-aware middleware</li>
                <li>CRUD surfaces for roles, users, brands, warehouses, and products</li>
                <li>Variant generation and warehouse-level inventory documents</li>
                <li>Order listing, creation foundation, and workflow transitions</li>
              </ul>
            </div>
            <div className="rounded-[24px] border border-border/60 bg-background/70 p-5">
              <h3 className="text-base font-semibold text-foreground">Next milestone</h3>
              <ul className="mt-3 space-y-2 text-sm text-foreground/65">
                <li>SQL import parity across legacy product and order tables</li>
                <li>Bulk import/export jobs and attachment management</li>
                <li>PDF, catalog, and PPT output generation</li>
                <li>Deeper order edit flows and stock reservation automation</li>
              </ul>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Suggested next steps"
          description="Recommended sequence for the next admin delivery wave."
        >
          <ol className="space-y-4 text-sm text-foreground/65">
            <li className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">1. Stabilize migration data and complete CSV/XLSX import pipelines.</li>
            <li className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">2. Finish order editor with variant picking, availability checks, and note history.</li>
            <li className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">3. Add file exports, approvals, and attachment-aware PDF generation.</li>
            <li className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3">4. Extend admin media and catalog tooling before public commerce.</li>
          </ol>
        </SectionCard>
      </div>
    </div>
  );
}
