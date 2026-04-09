'use client';

import { calculateValues } from "@/components/order/util/OrderUtil";
import { AppDispatch, RootState } from "@/store";
import { addToCart, CartItem } from "@/store/slices/cart/cartSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import clsx from "clsx";

interface SkuQuantityInputProps {
  row: any;
  value: number;
  maxStock: number;
  qty: string;
  // onChange: (val: number) => void;
}

export function SkuQuantityInput({
  row,
  value,
  maxStock,
  qty,
  // onChange,
}: SkuQuantityInputProps) {
  const isError = value > maxStock || value < 0;
  const [inputvalue, setInputValue] = useState(value);

  const { currentBrand } = useSelector((state: RootState) => state.brand);
  
  // Sync from prop if Redux updates
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const dispatch = useDispatch<AppDispatch>();

  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    handleChange(val);
  };

  const handleChange = React.useCallback(
    (val: number) => {
      const clampedVal = Math.max(0, Math.min(val, maxStock));
      setInputValue(clampedVal); // Immediate local update

      const data: CartItem = {
        sku: row.sku,
        brand: currentBrand?.name,
        description: row.description,
        image: row.primary_image_url,
        [qty]: clampedVal,
        mrp: Number(row.mrp) || 0,
        gst: Number(row.gst) || 0,
        amount: Number(row.mrp) || 0,
        discount: 0,
        lessDiscount: 0,
        netBilling: 0,
        finalAmount: 0,
        isIndividualDiscount:false
      };
      const updateData = calculateValues(data, 22, "inclusive");
      // console.log("updateData---->",updateData)
      dispatch(addToCart(updateData));
    },
    [maxStock, row, currentBrand, qty, dispatch]
  );

  // Sync from maxStock if needed
  useEffect(() => {
    if (inputvalue > maxStock) {
      handleChange(maxStock);
    }
  }, [maxStock, inputvalue, handleChange]);


  //add the project into the DB

  return (
    <div
      className={clsx(
        "inline-flex items-stretch overflow-hidden rounded-xl border transition-all duration-300",
        isError
          ? "border-rose-500 bg-rose-500/5 ring-1 ring-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
          : "border-border/40 bg-white dark:bg-foreground/[0.02] shadow-sm hover:border-foreground/20 hover:shadow-md"
      )}
      style={{ height: "40px" }}
    >
      {/* Stock Display (Left indicator) */}
      <div
        className={clsx(
          "flex items-center justify-center px-3 text-[9px] font-black uppercase tracking-widest transition-colors",
          isError ? "bg-rose-500/10 text-rose-500" : "bg-foreground/5 text-foreground/30 border-r border-border/40"
        )}
        style={{ minWidth: "38px" }}
        title="Physical Inventory Limit"
      >
        {maxStock}
      </div>

      {/* Input Field */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={inputvalue}
        onChange={handleManualChange}
        className={clsx(
          "w-12 bg-transparent px-1 text-center text-sm font-black tracking-tighter focus:outline-none transition-colors",
          isError ? "text-rose-500" : "text-foreground/90"
        )}
      />

      {/* Stepper Controls */}
      <div className="flex flex-col border-l border-border/40">
        <button
          disabled={inputvalue >= maxStock}
          onClick={() => handleChange(inputvalue + 1)}
          className="flex flex-1 items-center justify-center px-2 text-[8px] hover:bg-foreground/10 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed border-b border-border/20"
          aria-label="Increase level"
        >
          <span className="mb-0.5">▲</span>
        </button>
        <button
          disabled={inputvalue <= 0}
          onClick={() => handleChange(Math.max(0, inputvalue - 1))}
          className="flex flex-1 items-center justify-center px-2 text-[8px] hover:bg-foreground/10 transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Decrease level"
        >
          <span className="mt-0.5">▼</span>
        </button>
      </div>
    </div>
  );
}
