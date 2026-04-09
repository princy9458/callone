
"use client";

import React, { useState } from "react";
import { OrderModel } from "@/store/slices/order/OrderType";
import { UserInterface } from "@/store/slices/users/userSlice";
import { OrderItemsTable } from "./OrderItemsTable";
import { Plus, Minus, Download, Edit3, Loader2, FileSpreadsheet, FileText } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentOrder } from "@/store/slices/order/OrderSlice";
import { setCartFromOrder } from "@/store/slices/cart/cartSlice";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { downloadOrderExcel } from "@/lib/utils/excelDownloader";
import { downloadOrderPDF } from "@/lib/utils/pdfDownloader";
import { toast } from "sonner";

interface OrderRowProps {
  order: OrderModel;
  retailers: UserInterface[];
  managers: UserInterface[];
}

export const OrderRow = ({ order, retailers, managers }: OrderRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();
  const router = useRouter();
  const { allSaleRep } = useSelector((state: RootState) => state.user);
  const getRetailerName = (id?: string) => {
    if (!id) return "—";
    const retailer = retailers.find((r) => r._id === id || r.id?.toString() === id);
    return retailer?.name || "Unknown Retailer";
  };

  const formatDate = (dateStr?: string) => {
    const date = dateStr ? new Date(dateStr) : new Date();
    return {
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      time: date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  const created = formatDate(order.created_at);
  const updated = formatDate(order.updated_at);

  const handleOrderEdit = (order: OrderModel) => {
      if(order?.status=="complete-order"){
        toast.error("Order is completed , you can't edit it");
        return;
      }
    dispatch(setCurrentOrder(order));
    
    const retailer = retailers.find(r => r._id === order.retailer_id || r.id?.toString() === order.retailer_id);
    const manager = managers.find(m => m._id === order.manager_id || m.id?.toString() === order.manager_id);
    const salesRep = allSaleRep.find(s => s._id === order.salesrep_id || s.id?.toString() === order.salesrep_id);

    dispatch(setCartFromOrder({
      items: order.items || [],
      selectedRetailer: retailer || null,
      selectedManager: manager || null,
      selectedSalesRep: salesRep || null,
      discountType: order.discount_type,
      discountValue: order.discount_percent,
      cartId: order._id || order.id?.toString()
    }));

    router.push(`/admin/cart/${order.orderNumber}`);
  }

  return (    <>
      <tr className={clsx(
        "group border-b border-border/20 transition-all duration-300 hover:bg-foreground/[0.02]",
        isExpanded ? "bg-foreground/[0.03]" : ""
      )}>
        <td className="px-6 py-5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(
              "flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-500 active:scale-90",
              isExpanded 
                ? "border-primary bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                : "border-border/40 bg-foreground/[0.03] text-foreground/30 hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {isExpanded ? <Minus size={14} strokeWidth={3} /> : <Plus size={14} strokeWidth={3} />}
          </button>
        </td>
        <td className="px-6 py-5 font-mono text-sm font-black text-foreground/90 tracking-tight">
          {order.id || order.orderNumber || "—"}
        </td>
        <td className="px-6 py-5 text-[14px] font-semibold text-foreground text-foreground/80  tracking-tight">
          {getRetailerName(order.retailer_id)}
        </td>
        <td className="px-6 py-5">
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-foreground">{created.date}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 italic">{created.time}</span>
          </div>
        </td>
        <td className="px-6 py-5">
          <div className="flex flex-col">
            <span className="text-[14px] font-semibold text-foreground">{updated.date}</span>
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/20 italic">{updated.time}</span>
          </div>
        </td>
        <td className="px-6 py-5">
          <span className="inline-flex items-center rounded-lg bg-rose-500/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-rose-500 border border-rose-500/10">
             ₹{(order.discountAmount || (order as any).pricing?.discountAmount || 0).toLocaleString()}
          </span>
        </td>
        <td className="px-6 py-5 text-[14px] font-semibold text-foreground tracking-tighter">
          ₹{(order.totalAmount || (order as any).pricing?.finalTotal || 0).toLocaleString()}
        </td>
        <td className="px-6 py-5">
          <span className={clsx(
            "inline-flex rounded-lg px-3 py-1.5 text-[14px] font-semibold text-foreground tracking-[0] border",
            order.status === "completed" 
              ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20" 
              : "bg-amber-500/5 text-amber-500 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.05)]"
          )}>
            {order.status || "pending"}
          </span>
        </td>
        <td className="px-6 py-5 text-right">
          <div className="flex items-center justify-end gap-3">
            <div className="group/action relative">
              <button 
                onClick={() => downloadOrderExcel(order, retailers, managers)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/30 transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500"
              >
                <FileSpreadsheet size={16} />
              </button>
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 scale-50 opacity-0 transition-all group-hover/action:scale-100 group-hover/action:opacity-100">
                <span className="rounded bg-[#111111] px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">Excel</span>
              </div>
            </div>

            <div className="group/action relative">
              <button 
                onClick={() => downloadOrderPDF(order, retailers, managers, allSaleRep)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/30 transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500"
              >
                <FileText size={16} />
              </button>
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 scale-50 opacity-0 transition-all group-hover/action:scale-100 group-hover/action:opacity-100">
                <span className="rounded bg-[#111111] px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">PDF</span>
              </div>
            </div>

            <button 
              onClick={() => handleOrderEdit(order)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/30 transition-all hover:bg-[#111111] hover:text-white dark:hover:bg-primary"
            >
              <Edit3 size={16} />
            </button>
          </div>
        </td>
      </tr>
      
      {/* Expanded Content with Grid Layout */}
      <AnimatePresence>
        {isExpanded && (
          <tr>
            <td colSpan={9} className="bg-foreground/[0.01] p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mx-6 mb-6 mt-2 rounded-[24px] border border-border/20 bg-white/40 dark:bg-white/[0.02] p-8 shadow-inner backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between border-b border-border/10 pb-4">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 italic">Order Manifest Archive</h4>
                       <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                    </div>
                   <OrderItemsTable items={order.items || []} />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};
