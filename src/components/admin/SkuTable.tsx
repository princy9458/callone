'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Package2, Trash2 } from "lucide-react";
import { setCurrentAttribute } from "@/store/slices/attributeSlice/attributeSlice";
import { ProductImage } from "./ProductImage";
import { SkuQuantityInput } from "./SkuQuantityInput";
import { CartItem } from "@/store/slices/cart/cartSlice";

interface SkuTableProps {
  visibleRows: any[];
  selectedIds: string[];
  setSelectedIds: (fn: (curr: string[]) => string[]) => void;
  allVisibleSelected: boolean;
  isSourceReadonly: boolean;
  handleDelete: (id: string) => void;
  deletingId: string;
  statusClasses: (status: string) => string;
  skuQuantities: Record<string, CartItem>;
  setSkuQuantities: React.Dispatch<React.SetStateAction<Record<string, CartItem>>>;
}

export function SkuTable({
  visibleRows,
  selectedIds,
  setSelectedIds,
  allVisibleSelected,
  isSourceReadonly,
  handleDelete,
  deletingId,
  statusClasses,
  skuQuantities,
  setSkuQuantities,
}: SkuTableProps) {
  // Pull data from Redux to show "data on redux" as requested

 
  const { travismathew } = useSelector((state: RootState) => state.travisMathew);
  const { ogio } = useSelector((state: RootState) => state.ogio);
  const { hardgoods } = useSelector((state: RootState) => state.hardgoods);
  const {currentAttribute,allAttribute} = useSelector((state: RootState) => state.attribute);
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>()

  const [selectedData, setSelectedData] = useState<CartItem[]>([])

  // update the current attaribute 
  useEffect(()=>{
    if(allAttribute && allAttribute.length > 0 && visibleRows && visibleRows.length > 0){
        const currentBrand = visibleRows[0].brand.name;
        const foundAttribute = allAttribute.find((attr) => attr.name?.toLowerCase() === currentBrand?.toLowerCase());
        if (foundAttribute) {
          dispatch(setCurrentAttribute(foundAttribute));
        }
    }
  },[visibleRows, allAttribute, dispatch])

  const activeAttributes = currentAttribute?.attributes?.filter(attr => attr.show) || [];
  // Function to get brand-specific data from Redux if available
  const currentdata = useMemo(() => {
    if (currentAttribute?.name === "Travis Mathew") {
      return travismathew;
    } else if (currentAttribute?.name === "Ogio") {
      return ogio;
    } else if (currentAttribute?.name === "Hardgoods" || currentAttribute?.name === "HardGood") {
      return hardgoods;
    }
    return [];
  }, [currentAttribute, travismathew, ogio, hardgoods]);

 

  return (
    <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
      <thead>
        <tr className="bg-[#111111] text-white">
          <StickyHeading className="w-12 px-4 py-3">
            <input
              type="checkbox"
              aria-label="Select visible products"
              checked={allVisibleSelected}
              onChange={() => {
                const data = currentdata || [];
                if (allVisibleSelected) {
                  setSelectedIds((current) =>
                    current.filter((id) => !data.some((row: any) => (row.id || row._id || row.rowKey) === id))
                  );
                } else {
                  setSelectedIds((current) =>
                    Array.from(new Set([...current, ...data.map((row: any) => (row.id || row._id || row.rowKey))]))
                  );
                }
              }}
              className="h-4 w-4 rounded border-white/20 bg-transparent"
            />
          </StickyHeading>
          {activeAttributes.length > 0 ? (
            activeAttributes.map((attr) => (
              <StickyHeading key={attr.key} className="min-w-[150px] px-4 py-3">
                {attr.label}
              </StickyHeading>
            ))
          ) : (
            <>
              <StickyHeading className="min-w-[320px] px-4 py-3">SKU / Product</StickyHeading>
              <StickyHeading className="min-w-[150px] px-4 py-3">Brand</StickyHeading>
              <StickyHeading className="min-w-[180px] px-4 py-3">Category / Family</StickyHeading>
              <StickyHeading className="min-w-[260px] px-4 py-3">Attributes</StickyHeading>
              <StickyHeading className="min-w-[140px] px-4 py-3">Stock (Redux)</StickyHeading>
              <StickyHeading className="min-w-[130px] px-4 py-3">Status</StickyHeading>
            </>
          )}
          <StickyHeading className="min-w-[120px] px-4 py-3">Actions</StickyHeading>
        </tr>
      </thead>
      <tbody className="bg-[color:var(--surface)]">
        {currentdata && currentdata.length ? (
          currentdata.map((row: any) => {
            const rowId = row.id || row._id || row.rowKey || row.sku;
            const isSelected = selectedIds.includes(rowId);
            
            const displayStock = Number(row.stock_90 || 0) || Number(row.stock_88 || 0) || Number(row.availableStock || 0) || Number(row.variantStock || 0) || 0;
            const displayFamily = row.family || row.line || null;

            return (
              <tr key={rowId} className="border-b border-border/60 transition-colors hover:bg-primary/5">
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Select item`}
                    checked={isSelected}
                    onChange={() =>
                      setSelectedIds((current) =>
                        current.includes(rowId)
                          ? current.filter((id) => id !== rowId)
                          : [...current, rowId]
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-border/80"
                  />
                </td>
                {activeAttributes.length > 0 ? (
                  activeAttributes.map((attr) => {
                    const key = attr.key || "";
                    
                    if (key === "sku") {
                      return (
                        <td key={key} className="border-b border-border/60 px-4 py-4 align-top">
                          <div className="flex gap-3">
                            <ProductImage 
                            brandName={currentAttribute?.name??""}
                              rowData={row}
                              alt={row.name} 
                              className="h-11 w-11 shrink-0" 
                            />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate font-semibold text-foreground">{row.sku}</p>
                                {row.baseSku && (
                                  <span className="rounded-full border border-border/70 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/48">
                                    {row.baseSku}
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs text-foreground/52">{row.name}</p>
                              {row.variantTitle && (
                                <p className="mt-2 line-clamp-1 text-xs text-foreground/45 italic">
                                  {row.variantTitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                      );
                    }

                    if (key === "status") {
                      return (
                        <td key={key} className="border-b border-border/60 px-4 py-4 align-top">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClasses(row.status)}`}>
                            {row.status}
                          </span>
                        </td>
                      );
                    }

                    if (key === "availableStock" || key === "stock" || key === "variantStock") {
                      return (
                        <td key={key} className="border-b border-border/60 px-4 py-4 align-top">
                          <div className="space-y-1">
                            <p className="font-semibold text-foreground">{displayStock}</p>
                            <p className="text-xs text-foreground/52">
                              {displayStock > 0 ? "Available" : "Awaiting stock"}
                            </p>
                          </div>
                        </td>
                      );
                    }

                    // For any other attribute, match with object key
                    const attributeGroup = row.attributeGroups?.find((g: any) => g.key === key);
                    let val = row[key] !== undefined && row[key] !== null ? row[key] : (attributeGroup ? attributeGroup.values?.join(", ") : null);

                    // If it's a stock field and value is null/undefined or empty string, set to 0
                    if ((key.toLowerCase().includes("stock") || key.toLowerCase().startsWith("stock_")) && (val === null || val === undefined || val === "")) {
                      val = 0;
                    }

                    if (key.toLowerCase() === "stock_88") {
                      return (
                        <td key={key} className="border-b border-border/60 px-4 py-4 align-top">
                          <SkuQuantityInput
                            row={row}
                            qty={"qty88"}
                            value={items.find(item => item.sku === row.sku)?.qty88 || 0}
                            maxStock={Number(row.stock_88) || 0}
                            // onChange={(val) => {
                            //   setSkuQuantities(prev => ({
                            //     ...prev,
                            //     [rowId]: { 
                            //       ...prev[rowId], 
                            //       qty88: val,
                            //       // Ensure other fields are initialized if this is the first update
                            //       primaryImage: row?.primary_image_url??"",
                            //       sku: row.sku || row.baseSku,
                            //       description: row.description,
                            //       amount: Number(row.amount) || 0,
                            //       gst: Number(row.gst) || 0,
                            //       mrp: Number(row.mrp) || 0,
                            //     }
                            //   }));
                            // }}
                          />
                        </td>
                      );
                    }

                    if (key.toLowerCase() === "stock_90") {
                      return (
                        <td key={key} className="border-b border-border/60 px-4 py-4 align-top">
                          <SkuQuantityInput
                            row={row}
                            qty={"qty90"}
                            value={items.find(item => item.sku === row.sku)?.qty90 || 0}
                            maxStock={Number(row.stock_90) || 0}
                          //   onChange={(val) => {
                          //     setSkuQuantities(prev => ({
                          //       ...prev,
                          //       [rowId]: { 
                          //         ...prev[rowId], 
                          //         qty90: val,
                          //         // Ensure other fields are initialized if this is the first update
                          //         id: rowId,
                          //         sku: row.sku || row.baseSku,
                          //         mrp: Number(row.mrp) || 0,
                          //       }
                          //     }));
                          //   }
                          // }
                          />
                        </td>
                      );
                    }

                    return (
                      <td key={key} className="border-b border-border/60 px-4 py-4 align-top">
                        {val !== undefined && val !== null ? (
                          <span className="text-sm text-foreground">{val.toString()}</span>
                        ) : (
                          <span className="text-xs text-foreground/45">-</span>
                        )}
                      </td>
                    );
                  })
                ) : (
                  <>
                    <td className="border-b border-border/60 px-4 py-4 align-top">
                      <div className="flex gap-3">
                        <ProductImage 
                          brandName={currentAttribute?.name ?? ""}
                          rowData={row}
                         
                          alt={row.name} 
                          className="h-11 w-11 shrink-0" 
                        />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-foreground">{row.sku}</p>
                            <span className="rounded-full border border-border/70 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/48">
                              {row.baseSku}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-foreground/52">{row.name}</p>
                          <p className="mt-2 line-clamp-1 text-xs text-foreground/45 italic">
                            {row.variantTitle}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-border/60 px-4 py-4 align-top">
                      <div className="space-y-1">
                        {/* <p className="font-semibold text-foreground">{row.brand.name}</p>
                        <p className="text-xs text-foreground/52">{row.brand.code}</p> */}
                      </div>
                    </td>
                    <td className="border-b border-border/60 px-4 py-4 align-top">
                      <p className="font-medium text-foreground">{row.category || "Uncategorized"}</p>
                      <p className="mt-1 text-xs text-foreground/52">{displayFamily || row.subcategory || "No subcategory"}</p>
                    </td>
                    <td className="border-b border-border/60 px-4 py-4 align-top">
                      <div className="space-y-1">
                        <p className="font-semibold text-foreground">{displayStock}</p>
                        <p className="text-xs text-foreground/52">
                          {displayStock > 0 ? "Available" : "Awaiting stock"}
                        </p>
                      </div>
                    </td>
                    <td className="border-b border-border/60 px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClasses(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </>
                )}
                <td className="border-b border-border/60 px-4 py-4 align-top">
               
                    <div className="flex flex-col items-start gap-2">
                      <Link
                        href={`/admin/products/${rowId}/edit`}
                        className="text-sm font-semibold text-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(rowId)}
                        disabled={deletingId === rowId}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-danger disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === rowId ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                 
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={8} className="px-6 py-14 text-center">
              <div className="mx-auto flex max-w-md flex-col items-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-[22px] bg-[#111111] text-white">
                  <Package2 className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">No products found</h3>
                <p className="mt-2 text-sm text-foreground/56">
                  Try adjusting your search terms or clearing active filters.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function StickyHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`bg-[#111] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)] ${className || ""}`}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/82">
        {children}
      </div>
    </th>
  );
}

