import Link from "next/link";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import dbConnect from "@/lib/db/connection";
import {Order} from "@/lib/db/models/Order";

export const dynamic = "force-dynamic";

const money = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 2});

export default async function OrdersPage() {
  await dbConnect();
  const orders = await Order.find().sort({updatedAt: -1}).limit(50).lean();

  return (
    <div className="space-y-8">
      <PageHeader
        title="Orders"
        description="Admin order list with workflow status, participant snapshots, and discount-aware financial totals."
        action={
          <>
            <Link
              href="/api/admin/export/orders"
              className="rounded-2xl border border-border/70 bg-background px-5 py-3 text-sm font-semibold text-foreground/75"
            >
              Export CSV
            </Link>
            <Link href="/admin/orders/new" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">
              Create order
            </Link>
          </>
        }
      />
      <SectionCard title="Order pipeline">
        <DataTable headers={["Order", "Retailer", "Status", "Items", "Final total", "Actions"]}>
          {orders.map((order) => (
            <tr key={order._id.toString()}>
              <td className="px-4 py-4">
                <div className="font-semibold text-foreground">{order.orderNumber}</div>
                <p className="text-xs text-foreground/55">{new Date(order.createdAt).toLocaleString()}</p>
              </td>
              <td className="px-4 py-4 text-sm text-foreground/70">
                {String(order.participantSnapshots?.retailer?.name ?? "No retailer")}
              </td>
              <td className="px-4 py-4 text-sm text-foreground/70">{order.workflowStatus}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{order.items.length}</td>
              <td className="px-4 py-4 text-sm text-foreground/70">{money.format(order.pricing.finalTotal)}</td>
              <td className="px-4 py-4">
                <Link href={`/admin/orders/${order._id.toString()}`} className="text-sm font-semibold text-primary">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </DataTable>
      </SectionCard>
    </div>
  );
}
