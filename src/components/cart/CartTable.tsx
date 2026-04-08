import React, { useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { ProductImage } from '@/components/admin/ProductImage';
import { CartItem } from '@/store/slices/cart/cartSlice';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';

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
  onRemoveItem: (id: string) => void;
  onSetDiscount: (type: 'inclusive' | 'exclusive' | 'flat' | 'none', value: number) => void;
}

export const CartTable: React.FC<CartTableProps> = ({
  items,
  itemErrors,
  discountType,
  discountValue,
  summary,
  onUpdateQty,
  onRemoveItem,
  onSetDiscount,
}) => {
  const { subtotal, totalDiscount, finalTotal } = summary;
  const {travismathew} = useSelector((state:RootState) => state.travisMathew);
  const {ogio} = useSelector((state:RootState) => state.ogio);
  const {softgoods} = useSelector((state:RootState) => state.softgoods);
  const {hardgoods} = useSelector((state:RootState) => state.hardgoods);  
  const cartData:CartItem[]=useMemo(()=>{
    return items.map((item)=>{
      const brand= item.brand
          const qty = (item?.qty88 ?? 0) + (item?.qty90 ?? 0);
            const amount = (item.mrp ?? 0) * qty;
            const gstRate = item.gst ?? 0;
            const lessGst = amount / (1 + gstRate / 100);
            const discountAmt = lessGst * (discountValue / 100);
            const netBilling = lessGst - discountAmt;
            const finalBillValue = netBilling * (1 + gstRate / 100);  
      const brandData = brand === "Travis Mathew" ? travismathew : brand === "Ogio" ? ogio : brand === "Callaway Softgoods" ? softgoods : brand === "Callaway Hardgoods" ? hardgoods : [];
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
  },[items,travismathew, ogio, softgoods, hardgoods, discountValue])
  
  return (
    <div className="overflow-hidden rounded-[32px] border border-border/50 bg-background shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-foreground/[0.02] text-[10px] font-bold uppercase tracking-wider text-foreground/45">
            <th className="px-6 py-4">S.No</th>
            <th className="px-6 py-4">Product</th>
            <th className="px-6 py-4">Brand</th>
            <th className="px-6 py-4">SKU</th>
            <th className="px-6 py-4">Description</th>
            <th className="px-6 py-4 text-center">Qty88</th>
            <th className="px-6 py-4 text-center">Qty90</th>
            <th className="px-6 py-4 text-center">Qty</th>
            <th className="px-6 py-4">MRP</th>
            <th className="px-6 py-4">Amount</th>
            <th className="px-6 py-4 text-center">GST %</th>
            <th className="px-6 py-4">Less GST</th>
            <th className="px-6 py-4 text-center">Disc (%)</th>
            <th className="px-6 py-4">Disc Amt</th>
            <th className="px-6 py-4">Net Billings</th>
            <th className="px-6 py-4">Final Bill Value</th>
            <th className="px-6 py-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/40">
          { cartData && cartData.length > 0 && cartData.map((item, index) => {
            const stock88 = item?.stock88 ?? 0;
            const stock90 = item?.stock90 ?? 0;
            const itemId = item.id || item.sku || '';
           return (
              <tr key={item.id || item.sku || index} className="group hover:bg-foreground/[0.01] transition-colors">
                <td className="px-6 py-4 text-xs font-bold text-foreground/40">{index + 1}</td>
                <td className="px-6 py-4">
                  <div className="relative h-10 w-10 overflow-hidden rounded-lg border border-border/40 bg-foreground/[0.02]">
                    <ProductImage 
                      brandName={item.brand || ""} 
                      rowData={item} 
                      className="h-full w-full"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-[10px] font-bold text-foreground/70">{item.brand}</td>
                <td className="px-6 py-4 text-[10px] font-black tracking-tight">{item.sku}</td>
                <td className="px-6 py-4 text-[10px] font-medium text-foreground/50 max-w-[150px] truncate">
                  {item.description ?? ""}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className={clsx(
                      "flex items-center gap-1 rounded-lg border p-0.5 transition-all",
                      (item.qty88 || 0) > stock88 ? "border-red-500 bg-red-50" : "border-border/60 bg-foreground/5",
                      stock88 === 0 && (item.qty88 || 0) === 0 && "opacity-50 grayscale"
                    )}>
                      <span className="px-2 text-[10px] font-bold text-foreground/40 min-w-[24px] text-center">
                        {stock88}
                      </span>
                      <div className="w-[1px] h-3 bg-border/40" />
                      <input
                        type="number"
                        value={item.qty88}
                        disabled={stock88 === 0 && !itemErrors[item.id || ""]}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                          onUpdateQty(itemId, 'qty88', val, stock88);
                        }}
                        className="w-10 bg-transparent py-1 text-center text-[10px] font-bold outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                    {(item.qty88 || 0) > stock88 && (
                      <p className="mt-1 text-[8px] font-bold text-red-500 uppercase">Out of stock</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className={clsx(
                      "flex items-center gap-1 rounded-lg border p-0.5 transition-all",
                      (item.qty90 || 0) > stock90 ? "border-red-500 bg-red-50" : "border-border/60 bg-foreground/5",
                      stock90 === 0 && (item.qty90 || 0) === 0 && "opacity-50 grayscale"
                    )}>
                      <span className="px-2 text-[10px] font-bold text-foreground/40 min-w-[24px] text-center">
                        {stock90}
                      </span>
                      <div className="w-[1px] h-3 bg-border/40" />
                      <input
                        type="number"
                        value={item.qty90}
                        disabled={stock90 === 0 && !itemErrors[item.id || ""]}
                        onChange={(e) => {
                          const val = e.target.value === '' ? 0 : parseInt(e.target.value) || 0;
                          onUpdateQty(itemId, 'qty90', val, stock90);
                        }}
                        className="w-10 bg-transparent py-1 text-center text-[10px] font-bold outline-none disabled:cursor-not-allowed"
                      />
                    </div>
                    {(item.qty90 || 0) > stock90 && (
                      <p className="mt-1 text-[8px] font-bold text-red-500 uppercase">Out of stock</p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-[10px] font-bold text-primary">{item.qty}</td>
                <td className="px-6 py-4 text-[10px] font-bold text-foreground/70 text-right">₹{item.mrp?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 text-[10px] font-bold text-foreground/70 text-right">₹{item.amount?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 text-[10px] font-bold text-foreground/40 text-center">{item.gstRate}%</td>
                <td className="px-6 py-4 text-[10px] font-bold text-foreground/60 text-right">₹{item.lessGst?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-[10px] font-bold text-foreground/40 text-center">{discountValue}%</td>
                <td className="px-6 py-4 text-[10px] font-bold text-red-500/80 text-right">₹{item.discountAmt?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-[10px] font-bold text-foreground/80 text-right">₹{item.netBilling?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-[10px] font-black text-primary text-right">₹{item.finalBillValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => onRemoveItem(itemId)}
                      className="rounded-lg p-1.5 text-foreground/20 hover:bg-red-500/10 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer / Summary Section */}
      <div className="flex flex-wrap items-start justify-between gap-8 bg-foreground/[0.02] p-8">
        <div className="flex items-center gap-4 bg-background p-3 rounded-[24px] border border-border/60 shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/40 block">Discount Mode</span>
            <select
              value={discountType}
              onChange={(e) => onSetDiscount(e.target.value as any, discountValue)}
              className="rounded-lg border-none bg-foreground/5 px-3 py-1.5 text-xs font-bold outline-none"
            >
              <option value="inclusive">Inclusive</option>
              <option value="exclusive">Exclusive</option>
                 <option value="flat">Flat</option>
            </select>
          </div>
          <div className="h-10 w-[1px] bg-border/40" />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={discountValue}
              onChange={(e) => onSetDiscount(discountType as any, parseInt(e.target.value) || 0)}
              className="w-12 rounded-lg bg-foreground/5 px-2 py-1.5 text-center text-sm font-bold outline-none"
            />
            <span className="text-xs font-bold text-foreground/40">%</span>
          </div>
        </div>

        <div className="w-full max-w-[320px] space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-foreground/60">
            <span>Sub Total:</span>
            <span className="text-foreground font-black">₹{subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-bold text-foreground/60">
            <span>Discount:</span>
            <span className="text-red-500">₹{totalDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="h-[1px] bg-border/60" />
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground/80">Total Net Bill:</span>
            <span className="text-xl font-black text-primary">₹{finalTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};


