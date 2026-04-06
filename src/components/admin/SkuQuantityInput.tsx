'use client';

import { AppDispatch, RootState } from "@/store";
import { addToCart, CartItem } from "@/store/slices/cart/cartSlice";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

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
  
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (value > maxStock) {
      handleChange(maxStock);
    }
  }, [maxStock]);

  const dispatch= useDispatch<AppDispatch>()


  const {items}=useSelector((state:RootState)=>state.cart)
  const { currentBrand } = useSelector((state: RootState) => state.brand);
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value) || 0;
    handleChange(val);
  };


  const handleChange = (val: number) => {
    const clampedVal = Math.max(0, Math.min(val, maxStock));
    setInputValue(clampedVal);
    const data: CartItem = {
      sku: row.sku,
      brand: currentBrand?.name,
      description: row.description,
      image: row.primary_image_url,
      [qty]: clampedVal,
      mrp: row.mrp,
      gst: row.gst,
      amount: row.amount,
      discount: 0,
      lessDiscount: 0,
      netBilling: 0,
      finalAmount: 0,
    }
    dispatch(addToCart(data))
  }

  return (
    <div
      className={`inline-flex items-stretch overflow-hidden rounded-xl border transition-all duration-200 ${isError
          ? "border-red-500 bg-red-500/5 ring-1 ring-red-500/20"
          : "border-border/60 bg-background"
        }`}
      style={{ height: "36px" }}
    >
      {/* Stock Display */}
      <div
        className={`flex items-center justify-center px-2.5 text-xs font-bold ${isError ? "bg-red-500/10 text-red-500" : "bg-foreground/5 text-foreground/60"
          }`}
        style={{ minWidth: "32px", borderRight: "1px solid currentColor", opacity: isError ? 1 : 0.4 }}
      >
        {maxStock}
      </div>

      {/* Input Field */}
      <input
        type="number"
        value={inputvalue}
        onChange={handleManualChange}
        className={`w-12 bg-transparent px-2 text-center text-xs font-semibold focus:outline-none ${isError ? "text-red-500" : "text-foreground"
          }`}
      />

      {/* Stepper Controls */}
      <div className="flex flex-col border-l border-border/40">
        <button
          disabled={value >= maxStock}
          onClick={() => handleChange(value + 1)}
          className="flex flex-1 items-center justify-center px-1.5 text-[8px] hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Increase quantity"
        >
          ▲
        </button>
        <button
          disabled={value <= 0}
          onClick={() => handleChange(Math.max(0, value - 1))}
          className="flex flex-1 items-center justify-center border-t border-border/40 px-1.5 text-[8px] hover:bg-foreground/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Decrease quantity"
        >
          ▼
        </button>
      </div>
    </div>
  );
}
