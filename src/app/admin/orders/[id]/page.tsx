import {notFound} from "next/navigation";
import {DataTable} from "@/components/admin/DataTable";
import {PageHeader} from "@/components/admin/PageHeader";
import {SectionCard} from "@/components/admin/SectionCard";
import {updateOrderStatus} from "@/lib/actions/orders";
import dbConnect from "@/lib/db/connection";
import {Order} from "@/lib/db/models/Order";

const money = new Intl.NumberFormat("en-IN", {style: "currency", currency: "INR", maximumFractionDigits: 2});

export default async function OrderDetailPage({params}: {params: {id: string}}) {
  await dbConnect();
  const order = await Order.findById(params.id).lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={order.orderNumber}
        description={`Workflow status: ${order.workflowStatus}. Legacy status snapshot: ${order.sourceStatus || "N/A"}.`}
        backHref="/admin/orders"
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Items">
          <DataTable headers={["SKU", "Item", "Warehouse", "Qty", "Final amount"]}>
            {order.items.map((item: any, index: number) => (
              <tr key={`${String(item.sku)}-${index}`}>
                <td className="px-4 py-4 text-sm text-foreground/70">{String(item.sku)}</td>
                <td className="px-4 py-4">
                  <div className="font-semibold text-foreground">{String(item.name)}</div>
                  <p className="text-xs text-foreground/55">MRP {money.format(Number(item.mrp ?? 0))}</p>
                </td>
                <td className="px-4 py-4 text-sm text-foreground/70">{String(item.warehouseCode || "Unassigned")}</td>
                <td className="px-4 py-4 text-sm text-foreground/70">{Number(item.quantity ?? 0)}</td>
                <td className="px-4 py-4 text-sm text-foreground/70">{money.format(Number(item.finalAmount ?? 0))}</td>
              </tr>
            ))}
          </DataTable>
        </SectionCard>

        <SectionCard title="Summary">
          <dl className="space-y-3 text-sm text-foreground/70">
            <div className="flex items-center justify-between">
              <dt>Retailer</dt>
              <dd>{String(order.participantSnapshots?.retailer?.name ?? "None")}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Manager</dt>
              <dd>{String(order.participantSnapshots?.manager?.name ?? "None")}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Sales rep</dt>
              <dd>{String(order.participantSnapshots?.salesRep?.name ?? "None")}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Discount mode</dt>
              <dd>{order.pricing.discountType}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Discount value</dt>
              <dd>{order.pricing.discountValue}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Subtotal</dt>
              <dd>{money.format(order.pricing.subtotal)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Discount amount</dt>
              <dd>{money.format(order.pricing.discountAmount)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Tax</dt>
              <dd>{money.format(order.pricing.taxAmount)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border/60 pt-3 font-semibold text-foreground">
              <dt>Final total</dt>
              <dd>{money.format(order.pricing.finalTotal)}</dd>
            </div>
          </dl>

          <form action={updateOrderStatus} className="mt-6 space-y-3">
            <input type="hidden" name="id" value={order._id.toString()} />
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Workflow status</span>
              <select name="workflowStatus" defaultValue={order.workflowStatus} className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="availability_check">Availability Check</option>
                <option value="manager_approval">Manager Approval</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Timeline note</span>
              <textarea name="note" rows={3} placeholder="Add approval or availability note" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
            </label>
            <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white">Update order</button>
          </form>
        </SectionCard>
      </div>

      <SectionCard title="Timeline">
        <div className="space-y-4">
          {order.notesTimeline.map((entry: any, index: number) => (
            <div key={index} className="rounded-2xl border border-border/60 bg-background/70 px-4 py-4">
              <div className="flex items-center justify-between gap-4">
                <p className="font-semibold text-foreground">{String(entry.message)}</p>
                <span className="text-xs uppercase tracking-[0.16em] text-foreground/45">{String(entry.type)}</span>
              </div>
              <p className="mt-1 text-sm text-foreground/60">{String(entry.name || "System")}</p>
              <p className="mt-2 text-xs text-foreground/45">{entry.createdAt ? new Date(String(entry.createdAt)).toLocaleString() : "No timestamp"}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
