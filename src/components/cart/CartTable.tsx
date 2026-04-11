import React, { useMemo } from 'react';
import { Trash2, Percent, Calculator, ShoppingBag } from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ProductImage } from '@/components/admin/ProductImage';
import { CartItem, toggleItemDiscount, updateCartItemDiscount, updateDiscountValue } from '@/store/slices/cart/cartSlice';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { removeFromCart } from '@/store/slices/cart/cartSlice';
import { updateOrder } from '@/store/slices/order/orderThunks';
import { toast } from 'sonner';

import { PremiumSelect, SelectOption } from '@/components/ui/PremiumSelect';

interface CartTableProps {
  items: CartItem[];
  itemErrors: Record<string, boolean>;
  discountType: string;
  discountValue: number;
  summary: {
    subtotal: number;
    totalDiscount: number;
    finalTotal: number;
  };
  onUpdateQty: (itemId: string, field: 'qty88' | 'qty90', value: number, stock: number) => void;
  onSetDiscount: (type: 'inclusive' | 'exclusive' | 'flat' | 'none', value: number) => void;
 // onToggleDiscount?: (itemId: string) => void;
  // onUpdateItemDiscount?: (itemId: string, value: number) => void;
  isDisabled?: boolean;
}

export const CartTable: React.FC<CartTableProps> = ({
  items,
  itemErrors,
  discountType,
  discountValue,
  summary,
  onUpdateQty,
  // onRemoveItem,
    onSetDiscount,
  // onToggleDiscount,
  // onUpdateItemDiscount,
  isDisabled = false,
}) => {
  const discountOptions: SelectOption[] = [
    { value: 'inclusive', label: 'Inclusive', subLabel: 'Tax included in price' },
    { value: 'exclusive', label: 'Exclusive', subLabel: 'Tax added to total' },
    { value: 'flat', label: 'Flat', subLabel: 'Fixed rate adjustment' },
  ];
  const { subtotal, totalDiscount, finalTotal } = summary;
  const { travismathew } = useSelector((state: RootState) => state.travisMathew);
  const { ogio } = useSelector((state: RootState) => state.ogio);
  const { softgoods } = useSelector((state: RootState) => state.softgoods);
  const { hardgoods } = useSelector((state: RootState) => state.hardgoods);
  const { currentOrder } = useSelector((state: RootState) => state.order);
  const dispatch = useDispatch<AppDispatch>();
  const cartData: CartItem[] = useMemo(() => {
    return items.map((item) => {
      const brand = item.brand;
      const qty = (item?.qty88 ?? 0) + (item?.qty90 ?? 0);
      const amount = (item.mrp ?? 0) * qty;
      const gstRate = item.gst ?? 0;
      const lessGst = amount / (1 + gstRate / 100);
      const discountAmt = lessGst * (discountValue / 100);
      const netBilling = lessGst - discountAmt;
      const finalBillValue = netBilling * (1 + gstRate / 100);
      
      const brandData = brand === "Travis Mathew" ? (travismathew || []) : 
                        brand === "Ogio" ? (ogio || []) : 
                        brand === "Callaway Softgoods" ? (softgoods || []) : 
                        brand === "Callaway Hardgoods" ? (hardgoods || []) : [];
      
      const productData = brandData.find((product) => product.sku === item.sku);

      const stock88 = item.stock88 ?? (productData as any)?.stock_88 ?? 0;
      const stock90 = item.stock90 ?? (productData as any)?.stock_90 ?? 0;
      return {
        ...item,
        stock88,
        stock90,
        qty,
        amount,
        gstRate,
        lessGst,
        discountAmt,
        netBilling,
        finalBillValue,
      };
    });
  }, [items, travismathew, ogio, softgoods, hardgoods, discountValue]);

  const handleRemoveItem = async (itemId: string) => {
    dispatch(removeFromCart(itemId));
    if (currentOrder?._id) {
      try {
        const updatedItems = items.filter(item => (item.id !== itemId && item.sku !== itemId));
        const data = { ...currentOrder, items: updatedItems };
        await dispatch(updateOrder({ id: currentOrder._id, data })).unwrap();
        toast.success("Item removed from order");
      } catch (error) {
        toast.error("Failed to sync removal with server");
      }
    }
  };

  const handleToggleDiscount = async (itemId: string) => {
    // 1. Toggle discount in Redux immediately for UI responsiveness
    dispatch(toggleItemDiscount({sku:itemId}));
    
    // 2. If we are editing an existing order, persist to API
    if (currentOrder?._id) {
      try {
        const updatedItems = items.map(item => {
          if (item.id === itemId || item.sku === itemId) {
            return {
              ...item,
              isIndividualDiscount: !item.isIndividualDiscount,
            };
          }
          return item;
        });
        
        const data = {
          ...currentOrder,
          items: updatedItems,
        };
        
        await dispatch(updateOrder({ id: currentOrder._id, data })).unwrap();
        toast.success("Discount toggled successfully");
      } catch (error) {
        console.error("Failed to toggle discount on server:", error);
        toast.error("Failed to sync discount toggle with server");
      }
    }
  };

  const handleUpdateItemDiscount = async (itemId: string, discount: number) => {
    dispatch(updateCartItemDiscount({ sku:itemId, discount }))
  }
  const handleDiscountvalue = async (discountType: string, discountValue: number) => {
    dispatch(updateDiscountValue(discountValue ))
  }


  return (
    <div className="space-y-12">
      {/* Table Container */}
      <div className="overflow-hidden rounded-[24px] border border-border/40 bg-background shadow-[0_25px_60px_rgba(0,0,0,0.08)]">
        <div className="overflow-x-auto max-h-[calc(100vh-300px)] overflow-y-auto hide-scrollbar">
          <table className="w-full border-separate border-spacing-0 text-left">
            <thead>
              <tr className="bg-[#111111] text-white">
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 pl-8 text-[11px] font-semibold uppercase tracking-wider text-white/60">S.No</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">Product</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">Brand</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">SKU</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-[11px] font-semibold uppercase tracking-wider text-white/60">Description</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-white/60">Qty88</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-white/60">Qty90</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-white/60">Qty</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-white/60">MRP</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-white/60">Amount</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-white/60">GST %</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-white/60">Less GST</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-white/60">Disc (%)</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-10 py-4 text-right text-[11px] font-semibold uppercase tracking-wider text-white/60">Disc Amt</th>
                <th className="sticky top-0 z-10 bg-[#111111] px-6 py-4 text-center text-[11px] font-semibold uppercase tracking-wider text-white/60">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-transparent">
              {cartData && cartData.length > 0 && cartData.map((item, index) => {
                const stock88 = item?.stock88 ?? 0;
                const stock90 = item?.stock90 ?? 0;
                const itemId = item.id || item.sku || '';

                return (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={item.id || item.sku || index} 
                    className="border-b border-border/60 transition-colors bg-white hover:bg-white/5 group"
                  >
                    <td className="border-b border-white/5 px-6 py-4 pl-8 text-[11px] font-semibold italic text-foreground/20">{index + 1}</td>
                    <td className="border-b border-white/5 px-6 py-4">
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-foreground/[0.03] ring-1 ring-border/20">
                        <ProductImage 
                          brandName={item.brand || ""} 
                          rowData={item} 
                          className="h-full w-full object-cover p-1"
                        />
                      </div>
                    </td>
                    <td className="border-b border-white/5 px-6 py-4">
                      <span className="rounded-full border border-border/70 bg-background/50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/48">
                        {item.brand}
                      </span>
                    </td>
                    <td className="border-b border-white/5 px-6 py-4 text-[11px] font-semibold tracking-tight text-foreground">{item.sku}</td>
                    <td className="border-b border-white/5 px-6 py-4">
                      <p className="max-w-[140px] truncate text-[10px] font-medium leading-relaxed text-foreground/50 group-hover:text-foreground/70 transition-colors">
                        {item.description}
                      </p>
                    </td>
                    <td className="border-b border-white/5 px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className={clsx(
                          "flex items-center gap-1 rounded-xl border p-1 transition-all",
                          (item.qty88 || 0) > stock88 ? "border-red-500 bg-red-500/10" : "border-border/60 bg-foreground/[0.02]",
                        )}>
                          <span className="min-w-[20px] text-center text-[10px] font-semibold text-foreground/25">
                            {stock88}
                          </span>
                          <div className="h-3 w-[1px] bg-border/40" />
                          <input
                            type="number"
                            value={item.qty88}
                            disabled={isDisabled}
                            onChange={(e) => onUpdateQty(itemId, 'qty88', parseInt(e.target.value) || 0, stock88)}
                            className="w-10 bg-transparent text-center text-[11px] font-bold text-foreground outline-none"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-white/5 px-6 py-4">
                      <div className="flex flex-col items-center">
                        <div className={clsx(
                          "flex items-center gap-1 rounded-xl border p-1 transition-all",
                          (item.qty90 || 0) > stock90 ? "border-red-500 bg-red-500/10" : "border-border/60 bg-foreground/[0.02]",
                        )}>
                          <span className="min-w-[20px] text-center text-[10px] font-semibold text-foreground/25">
                            {stock90}
                          </span>
                          <div className="h-3 w-[1px] bg-border/40" />
                          <input
                            type="number"
                            value={item.qty90}
                            disabled={isDisabled}
                            onChange={(e) => onUpdateQty(itemId, 'qty90', parseInt(e.target.value) || 0, stock90)}
                            className="w-10 bg-transparent text-center text-[11px] font-bold text-foreground outline-none"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-white/5 px-6 py-4 text-center text-xs font-semibold text-primary">{item.qty}</td>
                    <td className="border-b border-white/5 px-6 py-4 text-right font-mono text-[12px] font-semibold text-foreground/70 group-hover:text-foreground transition-colors">₹{item.mrp?.toLocaleString()}</td>
                    <td className="border-b border-white/5 px-6 py-4 text-right font-mono text-[12px] font-semibold text-foreground/90 group-hover:text-foreground transition-colors">₹{item.amount?.toLocaleString()}</td>
                    <td className="border-b border-white/5 px-6 py-4 text-center text-[12px] font-semibold text-foreground/30">{item.gst}%</td>
                    <td className="border-b border-white/5 px-6 py-4 text-right font-mono text-[12px] font-semibold text-foreground/60 group-hover:text-foreground transition-colors">₹{item.lessGst?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    {/* <td className="border-b border-white/5 px-6 py-4 text-center text-[12px] font-semibold text-foreground/30">{discountValue}%</td> */}
                    <td className="border-b border-white/5 px-6 py-4 text-center text-[12px] font-semibold text-foreground/30">
                      <div className="flex items-center gap-2 justify-center">
                    <input
                      type="number"
                      value={item.discount}
                      disabled={isDisabled || !item.isIndividualDiscount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        handleUpdateItemDiscount?.(itemId, val);
                      }}
                     className={clsx(
                        "w-16 min-w-[60px] rounded-lg border px-2 py-1.5 text-center text-[10px] font-bold outline-none transition-all",
                        item.isIndividualDiscount
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border/60 bg-foreground/5 text-foreground/40"
                      )}
                    />
                    <button
                      onClick={() => handleToggleDiscount?.(itemId)}
                      // disabled={isDisabled}
                      className={clsx(
                        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none",
                        item.isIndividualDiscount ? "bg-primary" : "bg-[#ddd] border border-border/60"
                      )}
                    >
                      <span
                        className={clsx(
                          "inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform",
                          item.isIndividualDiscount ? "translate-x-5" : "translate-x-0.5"
                        )}
                      />
                      
                    </button>
                  </div>
 
                    </td>
                    <td className="border-b border-white/5 px-10 py-4 text-right font-mono text-[12px] font-semibold text-rose-500/80 group-hover:text-rose-500 transition-colors">₹{item.discountAmt?.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="border-b border-white/5 px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => handleRemoveItem(itemId)}
                          disabled={isDisabled}
                          className="rounded-lg p-2 text-foreground/10 transition-all hover:bg-red-500/20 hover:text-red-500 disabled:opacity-30"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-8">
        {/* Left Side: Settings/Options */}
        <div className="flex flex-wrap gap-4 items-start">
          <div className="rounded-3xl border border-border/40 bg-white p-4 shadow-sm flex items-center gap-6 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-white">
              <Percent size={20} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Discount Mode</span>
              </div>
              <div className="flex items-center gap-3">
                <PremiumSelect
                  options={discountOptions}
                  value={discountType}
                  disabled={isDisabled}
                  onChange={(val) => onSetDiscount(val as any, discountValue)}
                  triggerClassName="!py-2 !rounded-xl !border-border/60 !bg-white/5 !text-xs !font-bold"
                  className="min-w-[140px]"
                />
                <div className="relative">
                  <input
                    type="number"
                    value={discountValue}
                    disabled={isDisabled}
                    onChange={(e) => onSetDiscount(discountType as any, parseInt(e.target.value) || 0)}
                    className="w-16 rounded-xl border border-border/60 bg-white/5 px-4 py-2 text-center text-xs font-bold outline-none transition-all hover:bg-white/10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-foreground/20">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="rounded-3xl border border-border/40 bg-white p-6 shadow-sm flex items-center gap-2 backdrop-blur-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 text-foreground/40">
              <Calculator size={20} />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Auto Calculations</span>
              <p className="text-[10px] font-bold text-foreground/50">Real-time status sync</p>
            </div>
          <div className="h-10 w-[1px] bg-border/40" />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={discountValue}
              disabled={isDisabled}
              onChange={(e)=>handleDiscountvalue(discountType as any, parseInt(e.target.value) || 0)}
              className="w-12 rounded-lg bg-foreground/5 px-2 py-1.5 text-center text-sm font-bold outline-none disabled:cursor-not-allowed"
            />
            <span className="text-xs font-bold text-foreground/40">%</span>
          </div>
        </div> */}
        </div>
        {/* Right Side: Final Totals */}
        <div className="rounded-[32px] overflow-hidden border border-border/40 bg-background shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
          <div className="bg-[#111111] p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <ShoppingBag size={18} />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest">Order Summary</span>
            </div>
            <span className="text-[10px] font-medium text-white/70">Active Cart Session</span>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                <span>Gross Value</span>
                <span className="font-mono text-foreground tracking-tight">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-foreground/40">
                <span>Discount Applied</span>
                <span className="font-mono text-rose-500 tracking-tight">- ₹{totalDiscount.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="h-px w-full bg-border/40" />
            
            <div className="space-y-2 pt-2 border-t-2 border-t-primary">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">Total Payable Amount</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black tracking-tighter text-[#111111] dark:text-white">
                  ₹{finalTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-black uppercase text-foreground/40 tracking-widest">INR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


