'use client';

import React, { useMemo } from "react";
import { SkuQuantityInput } from "./SkuQuantityInput";

interface ExtensionTableProps {
  parentRow: any;
  variationSkus: string[] | string;
  allData: any[];
  items: any[];
}

export function ExtensionTable({
  parentRow,
  variationSkus,
  allData,
  items
}: ExtensionTableProps) {
  const variationRows = useMemo(() => {
    const skus = Array.isArray(variationSkus)
      ? variationSkus
      : (typeof variationSkus === 'string' ? variationSkus.split(',').map(s => s.trim()) : []);

    // Filter allData to find rows whose SKU is in the variation list
    return allData.filter(row => skus.includes(row.sku));
  }, [variationSkus, allData]);

  if (variationRows.length === 0) return null;

  return (
    <table className="min-w-full text-left">
      <thead>
        <tr className="bg-[#111111] text-white">
          <th className="px-6 py-4 w-14">
            <input type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent accent-primary" />
          </th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">SKU Manifest</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Style ID</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Size Map</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Qty-90</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Qty-88</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic">Aggregate</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic text-right">Market Pricing</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/10">
        {variationRows.map((vRow: any) => {
          const cartItem = items.find(item => item.sku === vRow.sku);
          const totalQty = (cartItem?.qty88 || 0) + (cartItem?.qty90 || 0);

          return (
            <tr key={vRow.sku} className="group transition-all duration-300 hover:bg-foreground/[0.04]">
              <td className="px-6 py-4">
                <input type="checkbox" className="h-4 w-4 rounded border-border/40 accent-primary" />
              </td>
              <td className="px-6 py-4">
                <span className="text-sm font-black text-foreground uppercase tracking-tight">{vRow.sku}</span>
              </td>
              <td className="px-6 py-4 text-[11px] font-black text-foreground/40 uppercase italic tracking-widest">{vRow.style_id || vRow.baseSku || "Standard"}</td>
              <td className="px-6 py-4">
                 <span className="inline-flex h-7 items-center justify-center rounded-lg border border-border/40 bg-foreground/[0.03] px-3 text-[10px] font-black text-foreground/60 uppercase">{vRow.size || "OS"}</span>
              </td>
              <td className="px-6 py-4">
                <div className="w-28">
                  <SkuQuantityInput
                    row={vRow}
                    qty={"qty90"} 
                    value={cartItem?.qty90 || 0}
                    maxStock={Number(vRow.stock_90) || 0}
                  />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="w-28">
                  <SkuQuantityInput
                    row={vRow}
                    qty={"qty88"}
                    value={cartItem?.qty88 || 0}
                    maxStock={Number(vRow.stock_88) || 0}
                  />
                </div>
              </td>
           
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground">{totalQty}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-foreground/20 italic">Units Packed</span>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-foreground tracking-tighter">₹{(vRow.amount || vRow.mrp || 0).toLocaleString()}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60 italic">Market Rate</span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
