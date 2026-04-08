'use client';

import { AppDispatch, RootState } from "@/store";
import { addToCart, CartItem } from "@/store/slices/cart/cartSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { calculateValues } from "../order/util/OrderUtil";

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
      className={`inline-flex items-stretch overflow-hidden rounded-xl border transition-all duration-200 ${
        isError
          ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/20"
          : "border-border/60 bg-white"
      }`}
      style={{ height: "38px" }}
    >
      {/* Stock Display (Left indicator) */}
      <div
        className={`flex items-center justify-center px-2.5 text-[10px] font-black leading-none ${
          isError ? "bg-red-500/10 text-red-500" : "bg-foreground/5 text-foreground/50 border-r border-border/40"
        }`}
        style={{ minWidth: "32px", opacity: isError ? 1 : 0.6 }}
        title="Stock Limit"
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
        className={`w-14 bg-transparent px-1 text-center text-sm font-bold focus:outline-none ${
          isError ? "text-red-500" : "text-foreground"
        }`}
      />

      {/* Stepper Controls */}
      <div className="flex flex-col border-l border-border/40">
        <button
          disabled={inputvalue >= maxStock}
          onClick={() => handleChange(inputvalue + 1)}
          className="flex flex-1 items-center justify-center px-1.5 text-[9px] hover:bg-foreground/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          ▲
        </button>
        <button
          disabled={inputvalue <= 0}
          onClick={() => handleChange(Math.max(0, inputvalue - 1))}
          className="flex flex-1 items-center justify-center border-t border-border/40 px-1.5 text-[9px] hover:bg-foreground/10 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
