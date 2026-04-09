'use client';

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Minus, Package2, Pencil, Plus, Trash2, Box, ShieldCheck } from "lucide-react";
import { setCurrentAttribute } from "@/store/slices/attributeSlice/attributeSlice";
import { ProductImage } from "../../ProductImage";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

import { CartItem } from "@/store/slices/cart/cartSlice";
import { ExtensionTable } from "./ExtensionTable";
import { SkuQuantityInput } from "./SkuQuantityInput";

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
  onOpenPreview: (images: string[], index: number) => void;
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
  onOpenPreview
}: SkuTableProps) {
  // Pull data from Redux to show "data on redux" as requested


  const { travismathew } = useSelector((state: RootState) => state.travisMathew);
  const { ogio } = useSelector((state: RootState) => state.ogio);
  const { hardgoods } = useSelector((state: RootState) => state.hardgoods);
  const { softgoods } = useSelector((state: RootState) => state.softgoods);
  const { currentAttribute, allAttribute } = useSelector((state: RootState) => state.attribute);
  const { items } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>()

  const [selectedData, setSelectedData] = useState<CartItem[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  // update the current attaribute 
  useEffect(() => {
    if (allAttribute && allAttribute.length > 0 && visibleRows && visibleRows.length > 0) {
      const currentBrand = visibleRows[0].brand.name;
      const foundAttribute = allAttribute.find((attr) => attr.name?.toLowerCase() === currentBrand?.toLowerCase());
      if (foundAttribute) {
        dispatch(setCurrentAttribute(foundAttribute));
      }
    }
  }, [visibleRows, allAttribute, dispatch])

  const activeAttributes = currentAttribute?.attributes?.filter(attr => attr.show) || [];
  // Function to get brand-specific data from Redux if available
  const currentdata = useMemo(() => {
    if (currentAttribute?.name === "Travis Mathew") {
      return travismathew;
    } else if (currentAttribute?.name === "Ogio") {
      return ogio;
    } else if (currentAttribute?.name === "Callaway Hardgoods") {
      return hardgoods;
    } else if (currentAttribute?.name === "Callaway Softgoods") {
      return softgoods;
    }
    return [];
  }, [currentAttribute, travismathew, ogio, hardgoods, softgoods]);



  return (
    <table className="min-w-full border-separate border-spacing-0 text-left">
      <thead>
        <tr className="bg-[#111111] text-white">
          <StickyHeading className="w-14 px-6 py-5">
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
              className="h-4 w-4 rounded border-white/20 bg-transparent accent-primary"
            />
          </StickyHeading>
          <StickyHeading className="w-14 px-6 py-5">{" "}</StickyHeading>
          {activeAttributes.length > 0 ? (
            activeAttributes.map((attr) => (
              <StickyHeading key={attr.key} className="min-w-[150px] px-6 py-5">
                {attr.label}
              </StickyHeading>
            ))
          ) : (
            <>
              <StickyHeading className="min-w-[320px] px-6 py-5">SKU Manifest</StickyHeading>
              <StickyHeading className="min-w-[150px] px-6 py-5">Brand</StickyHeading>
              <StickyHeading className="min-w-[180px] px-6 py-5">Category Archive</StickyHeading>
              <StickyHeading className="min-w-[260px] px-6 py-5">Variant Matrix</StickyHeading>
              <StickyHeading className="min-w-[140px] px-6 py-5">Reserve Stock</StickyHeading>
              <StickyHeading className="min-w-[130px] px-6 py-5">Status</StickyHeading>
            </>
          )}
          <StickyHeading className="min-w-[120px] px-6 py-5 text-right">Actions</StickyHeading>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/20">
        {currentdata && currentdata.length ? (
          currentdata.map((row: any) => {
            const rowId = row.id || row._id || row.rowKey || row.sku;
            const isSelected = selectedIds.includes(rowId);

            const displayStock = Number(row.stock_90 || 0) || Number(row.stock_88 || 0) || Number(row.availableStock || 0) || Number(row.variantStock || 0) || 0;
            const displayFamily = row.family || row.line || null;

            return (
              <React.Fragment key={rowId}>
                <tr className={clsx(
                  "group transition-all duration-300 hover:bg-foreground/[0.02]",
                  isSelected ? "bg-foreground/[0.03]" : "",
                  expandedRows.has(rowId) ? "bg-foreground/[0.04]" : ""
                )}>
                  <td className="px-6 py-5 align-top">
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
                      className="mt-1 h-4 w-4 rounded border-border/40 accent-primary"
                    />
                  </td>
                  <td className="px-6 py-5 align-top">
                    {row.variation_sku && row.variation_sku.length > 0 && (
                      <button
                        onClick={() => toggleRow(rowId)}
                        className={clsx(
                          "flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-500 active:scale-90",
                          expandedRows.has(rowId) 
                            ? "border-primary bg-primary text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
                            : "border-border/40 bg-foreground/[0.03] text-foreground/30 hover:border-foreground/20 hover:text-foreground"
                        )}
                      >
                        {expandedRows.has(rowId) ? (
                          <Minus size={14} strokeWidth={3} />
                        ) : (
                          <Plus size={14} strokeWidth={3} />
                        )}
                      </button>
                    )}
                  </td>
                  {activeAttributes.length > 0 ? (
                    activeAttributes.map((attr) => {
                      const key = attr.key || "";

                      if (key === "sku") {
                        return (
                          <td key={key} className="px-6 py-5 align-top">
                            <div className="flex gap-4">
                              <div className="relative shrink-0">
                                <ProductImage
                                  brandName={currentAttribute?.name ?? ""}
                                  rowData={row}
                                  alt={row.name}
                                  className="h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-border/20 transition-transform hover:scale-105 cursor-pointer"
                                  onClick={() => {
                                  const s3_url = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/TRAVIS-Images`;
                                  const s3_url_ogio = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/OGIO-Images`;
                                  const skuValue = row.sku || row.baseSku;

                                  const resolveUrl = (url: string) => {
                                    if (!url) return '';
                                    if (url.startsWith('http') || url.startsWith('/')) return url;

                                    if (currentAttribute?.name === "Travis Mathew") {
                                      const fam = skuValue?.replace(/_[^_]*$/, '') || '';
                                      return `${s3_url}/${fam}/${url}`;
                                    } else if (currentAttribute?.name === "Ogio") {
                                      return `${s3_url_ogio}/${skuValue}/${url}`;
                                    }
                                    return url.startsWith('/') ? url : `/${url}`;
                                  };

                                  const primary = resolveUrl(row.primary_url || row.primary_image_url);
                                  const gallery = row.gallery_images_url
                                    ? row.gallery_images_url.split(',').map((url: string) => resolveUrl(url.trim()))
                                    : [];

                                  onOpenPreview([primary, ...gallery].filter(Boolean), 0);
                                }}
                                />
                              </div>
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-black uppercase tracking-tight text-foreground">{row.sku}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {row.baseSku && (
                                    <span className="rounded-lg border border-border/40 bg-foreground/[0.03] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-foreground/40 italic">
                                      {row.baseSku}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-black uppercase tracking-wider text-foreground/40">
                                    {row.name}
                                  </span>
                                </div>
                                {row.variantTitle && (
                                  <p className="mt-2 line-clamp-1 text-[9px] font-black uppercase tracking-widest text-foreground/20 italic">
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
                          <td key={key} className="px-6 py-5 align-top">
                            <span className={clsx(
                              "inline-flex rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border",
                              row.status === "active" 
                                ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                                : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                            )}>
                              {row.status}
                            </span>
                          </td>
                        );
                      }

                      if (key === "availableStock" || key === "stock" || key === "variantStock") {
                        return (
                          <td key={key} className="px-6 py-5 align-top">
                            <div className="flex flex-col">
                              <span className="text-base font-black text-foreground tracking-tighter">{displayStock}</span>
                              <p className={clsx(
                                "text-[9px] font-black uppercase tracking-widest",
                                displayStock > 0 ? "text-emerald-500/60" : "text-rose-500/60"
                              )}>
                                {displayStock > 0 ? "In Reserve" : "Awaiting Scan"}
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
                        <td key={key} className="px-6 py-5 align-top">
                          {val !== undefined && val !== null ? (
                            <span className="text-sm font-black text-foreground/70 uppercase tracking-tight">{val.toString()}</span>
                          ) : (
                            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest italic">N/A</span>
                          )}
                        </td>
                      );
                    })
                  ) : (
                    <>
                      <td className="px-6 py-5 align-top">
                        <div className="flex gap-4">
                          <ProductImage
                            brandName={currentAttribute?.name ?? ""}
                            rowData={row}
                            alt={row.name}
                            className="h-12 w-12 rounded-xl object-cover shadow-sm ring-1 ring-border/20 transition-transform hover:scale-105 cursor-pointer"
                            onClick={() => {
                              const s3_url = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/TRAVIS-Images`;
                              const s3_url_ogio = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/OGIO-Images`;
                              const skuValue = row.sku || row.baseSku;

                              const resolveUrl = (url: string) => {
                                if (!url) return '';
                                if (url.startsWith('http') || url.startsWith('/')) return url;

                                if (currentAttribute?.name === "Travis Mathew") {
                                  const fam = skuValue?.replace(/_[^_]*$/, '') || '';
                                  return `${s3_url}/${fam}/${url}`;
                                } else if (currentAttribute?.name === "Ogio") {
                                  return `${s3_url_ogio}/${skuValue}/${url}`;
                                }
                                return url.startsWith('/') ? url : `/${url}`;
                              };

                              const primary = resolveUrl(row.primary_url || row.primary_image_url);
                              const gallery = row.gallery_images_url
                                ? row.gallery_images_url.split(',').map((url: string) => resolveUrl(url.trim()))
                                : [];

                              onOpenPreview([primary, ...gallery].filter(Boolean), 0);
                            }}
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-black uppercase tracking-tight text-foreground">{row.sku}</p>
                              {row.baseSku && (
                                <span className="rounded-lg border border-border/40 bg-foreground/[0.03] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-foreground/40 italic">
                                  {row.baseSku}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-wider text-foreground/40">{row.name}</p>
                            <p className="line-clamp-1 text-[9px] font-black uppercase tracking-widest text-foreground/20 italic">
                              {row.variantTitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-black text-foreground/80">{row.brand?.name || "Private"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-foreground/70 uppercase tracking-tight">{row.category || "General"}</span>
                          <span className="text-[10px] font-black text-foreground/30">{displayFamily || row.subcategory || "N/A"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <div className="flex flex-col">
                          <span className="text-base font-black text-foreground tracking-tighter">{displayStock}</span>
                          <p className={clsx(
                            "text-[9px] font-black uppercase tracking-widest",
                            displayStock > 0 ? "text-emerald-500/60" : "text-rose-500/60"
                          )}>
                            {displayStock > 0 ? "In Reserve" : "Awaiting Scan"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                        <span className={clsx(
                           "inline-flex rounded-lg px-2.5 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] border",
                           row.status === "active" 
                             ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                             : "bg-amber-500/5 text-amber-500 border-amber-500/20"
                         )}>
                          {row.status}
                        </span>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-5 align-top text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="group/action relative">
                        <Link
                          href={`/admin/products/${rowId}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/30 transition-all hover:bg-[#111111] hover:text-white dark:hover:bg-primary"
                        >
                          <Pencil size={16} />
                        </Link>
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 scale-50 opacity-0 transition-all group-hover/action:scale-100 group-hover/action:opacity-100">
                          <span className="rounded bg-[#111111] px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">Edit</span>
                        </div>
                      </div>

                      <div className="group/action relative">
                        <button
                          onClick={() => handleDelete(rowId)}
                          disabled={deletingId === rowId}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/30 transition-all hover:bg-rose-500 hover:text-white hover:border-rose-500 disabled:opacity-50"
                        >
                          {deletingId === rowId ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                        <div className="absolute -top-9 left-1/2 -translate-x-1/2 scale-50 opacity-0 transition-all group-hover/action:scale-100 group-hover/action:opacity-100">
                          <span className="rounded bg-rose-600 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-white">Delete</span>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <AnimatePresence>
                  {expandedRows.has(rowId) && row.variation_sku && (
                    <tr>
                      <td colSpan={100} className="bg-foreground/[0.01] p-0">
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="mx-6 mb-6 mt-2 rounded-[24px] border border-border/20 bg-white/40 dark:bg-white/[0.02] p-8 shadow-inner backdrop-blur-xl">
                              <div className="mb-4 flex items-center justify-between border-b border-border/10 pb-4">
                                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20 italic">Variant Extension Suite</h4>
                                 <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                              </div>
                              <ExtensionTable
                                parentRow={row}
                                variationSkus={row.variation_sku}
                                allData={currentdata}
                                items={items}
                              />
                          </div>
                        </motion.div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            )
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
      className={clsx(
        "bg-[#111] text-white shadow-[0_1px_0_rgba(255,255,255,0.08)]",
        className
      )}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 italic py-2">
        {children}
      </div>
    </th>
  );
}

