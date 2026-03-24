"use client";

import {useState} from "react";
import {Plus, Trash2} from "lucide-react";

type SelectOption = {
  id: string;
  label: string;
  sublabel?: string;
};

type NewOrderFormProps = {
  action: (formData: FormData) => void;
  retailers: SelectOption[];
  managers: SelectOption[];
  salesReps: SelectOption[];
  brands: SelectOption[];
  variants: SelectOption[];
  warehouses: SelectOption[];
};

type OrderLine = {
  variantId: string;
  quantity: number;
  warehouseId: string;
  lineDiscountValue: number;
};

export function NewOrderForm({
  action,
  retailers,
  managers,
  salesReps,
  brands,
  variants,
  warehouses,
}: NewOrderFormProps) {
  const [lines, setLines] = useState<OrderLine[]>([
    {variantId: variants[0]?.id ?? "", quantity: 1, warehouseId: warehouses[0]?.id ?? "", lineDiscountValue: 22},
  ]);

  const updateLine = (index: number, patch: Partial<OrderLine>) => {
    setLines((current) =>
      current.map((line, lineIndex) => (lineIndex === index ? {...line, ...patch} : line))
    );
  };

  return (
    <form action={action} className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Retailer</span>
          <select name="retailerId" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" required>
            <option value="">Select retailer</option>
            {retailers.map((retailer) => (
              <option key={retailer.id} value={retailer.id}>{retailer.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Manager</span>
          <select name="managerId" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
            <option value="">Select manager</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>{manager.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Sales rep</span>
          <select name="salesRepId" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
            <option value="">Select sales rep</option>
            {salesReps.map((salesRep) => (
              <option key={salesRep.id} value={salesRep.id}>{salesRep.label}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Brand</span>
          <select name="brandId" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
            <option value="">Any brand</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{brand.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Discount mode</span>
          <select name="discountType" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none">
            <option value="inclusive">Inclusive</option>
            <option value="exclusive">Exclusive</option>
            <option value="flat">Flat</option>
            <option value="none">None</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Global discount value</span>
          <input name="discountValue" type="number" min="0" defaultValue="22" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Internal note</span>
          <input name="internalNote" type="text" placeholder="Availability note or approval context" className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none" />
        </label>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Order items</h2>
            <p className="text-sm text-foreground/60">Variant-based admin checkout with warehouse assignment per line.</p>
          </div>
          <button
            type="button"
            onClick={() =>
              setLines((current) => [
                ...current,
                {variantId: variants[0]?.id ?? "", quantity: 1, warehouseId: warehouses[0]?.id ?? "", lineDiscountValue: 22},
              ])
            }
            className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/70"
          >
            <Plus size={16} />
            Add line
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, index) => (
            <div key={`${line.variantId}-${index}`} className="grid gap-3 rounded-[24px] border border-border/60 bg-background/70 p-4 xl:grid-cols-[2fr,0.75fr,1fr,0.8fr,auto]">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">Variant</span>
                <select
                  value={line.variantId}
                  onChange={(event) => updateLine(index, {variantId: event.target.value})}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none"
                >
                  {variants.map((variant) => (
                    <option key={variant.id} value={variant.id}>{variant.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">Qty</span>
                <input
                  type="number"
                  min="1"
                  value={line.quantity}
                  onChange={(event) => updateLine(index, {quantity: Number(event.target.value)})}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">Warehouse</span>
                <select
                  value={line.warehouseId}
                  onChange={(event) => updateLine(index, {warehouseId: event.target.value})}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none"
                >
                  <option value="">Auto assign later</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>{warehouse.label}</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">Line discount %</span>
                <input
                  type="number"
                  min="0"
                  value={line.lineDiscountValue}
                  onChange={(event) => updateLine(index, {lineDiscountValue: Number(event.target.value)})}
                  className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setLines((current) => current.filter((_, lineIndex) => lineIndex !== index))}
                  disabled={lines.length === 1}
                  className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground/60 disabled:opacity-40"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <input type="hidden" name="itemsJson" value={JSON.stringify(lines)} />

      <div className="flex justify-end">
        <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_35px_rgba(15,132,255,0.35)]">
          Create order
        </button>
      </div>
    </form>
  );
}
