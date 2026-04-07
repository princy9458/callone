'use client';

import React from "react";
import Link from "next/link";
import { Package2, Pencil, Trash2 } from "lucide-react";
import { ProductImage } from "./ProductImage";

interface ProductTableProps {
  visibleRows: any[];
  selectedIds: string[];
  setSelectedIds: (fn: (curr: string[]) => string[]) => void;
  allVisibleSelected: boolean;
  isSourceReadonly: boolean;
  handleDelete: (id: string) => void;
  deletingId: string;
  statusClasses: (status: string) => string;
  onOpenPreview: (images: string[], index: number) => void;
}

export function ProductTable({
  visibleRows,
  selectedIds,
  setSelectedIds,
  allVisibleSelected,
  isSourceReadonly,
  handleDelete,
  deletingId,
  statusClasses,
  onOpenPreview,
}: ProductTableProps) {


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
                if (allVisibleSelected) {
                  setSelectedIds((current) =>
                    current.filter((id) => !visibleRows.some((row) => row.rowKey === id))
                  );
                } else {
                  setSelectedIds((current) =>
                    Array.from(new Set([...current, ...visibleRows.map((row) => row.rowKey)]))
                  );
                }
              }}
              className="h-4 w-4 rounded border-white/20 bg-transparent"
            />
          </StickyHeading>
          <StickyHeading className="min-w-[320px] px-4 py-3">Product</StickyHeading>
          <StickyHeading className="min-w-[150px] px-4 py-3">Brand</StickyHeading>
          <StickyHeading className="min-w-[180px] px-4 py-3">Category</StickyHeading>
          <StickyHeading className="min-w-[260px] px-4 py-3">Attributes</StickyHeading>
          <StickyHeading className="min-w-[180px] px-4 py-3">Variants</StickyHeading>
          <StickyHeading className="min-w-[140px] px-4 py-3">Stock</StickyHeading>
          <StickyHeading className="min-w-[130px] px-4 py-3">Status</StickyHeading>
          <StickyHeading className="min-w-[120px] px-4 py-3">Actions</StickyHeading>
        </tr>
      </thead>
      <tbody className="bg-[color:var(--surface)]">
        {visibleRows.length ? (
          visibleRows.map((row) => {
            const isSelected = selectedIds.includes(row.rowKey);
            return (
              <tr key={row.rowKey} className="border-b border-border/60 transition-colors hover:bg-primary/5">
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    aria-label={`Select ${row.name}`}
                    checked={isSelected}
                    onChange={() =>
                      setSelectedIds((current) =>
                        current.includes(row.rowKey)
                          ? current.filter((id) => id !== row.rowKey)
                          : [...current, row.rowKey]
                      )
                    }
                    className="mt-1 h-4 w-4 rounded border-border/80"
                  />
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="flex gap-3">
                    <ProductImage 
                      brandName={row.brand.name}
                      rowData={row}
                      alt={row.name} 
                      className="h-11 w-11 shrink-0" 
                      onClick={() => {
                        const s3_url = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/TRAVIS-Images`;
                        const s3_url_ogio = `https://callaways3bucketcc001-prod.s3.ap-south-1.amazonaws.com/public/productimg/OGIO-Images`;
                        const skuValue = row.sku || row.baseSku;
                        
                        const resolveUrl = (url: string) => {
                          if (!url) return '';
                          if (url.startsWith('http') || url.startsWith('/')) return url;
                          
                          if (row.brand.name === "Travis Mathew") {
                            const fam = skuValue?.replace(/_[^_]*$/, '') || '';
                            return `${s3_url}/${fam}/${url}`;
                          } else if (row.brand.name === "Ogio") {
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
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-foreground">{row.name}</p>
                        <span className="rounded-full border border-border/70 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/48">
                          {row.baseSku}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-foreground/52">
                        {row.subcategory || "No subcategory"} · {row.productType}
                      </p>
                      <p className="mt-2 line-clamp-1 text-xs text-foreground/45">
                        {row.variantSkus.slice(0, 3).join(" · ")}
                        {row.variantSkus.length > 3 ? ` +${row.variantSkus.length - 3} more` : ""}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{row.brand.name}</p>
                    <p className="text-xs text-foreground/52">{row.brand.code}</p>
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <p className="font-medium text-foreground">{row.category || "Uncategorized"}</p>
                  <p className="mt-1 text-xs text-foreground/52">{row.subcategory || "No subcategory"}</p>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="flex flex-wrap gap-2">
                    {row.attributeGroups.length ? (
                      row.attributeGroups.slice(0, 3).map((group: any) => (
                        <span
                          key={group.key}
                          className="rounded-2xl border border-border/70 bg-background px-2.5 py-1.5 text-xs text-foreground/66"
                        >
                          <span className="font-semibold text-foreground/74">{group.label}:</span>{" "}
                          {group.values.slice(0, 2).join(", ")}
                          {group.values.length > 2 ? ` +${group.values.length - 2}` : ""}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-foreground/45">No variant attributes</span>
                    )}
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <p className="font-semibold text-foreground">{row.variantCount}</p>
                  <p className="mt-1 text-xs text-foreground/52">
                    {row.variants.slice(0, 2).map((variant: any) => variant.title).join(" · ")}
                    {row.variants.length > 2 ? ` +${row.variants.length - 2} more` : ""}
                  </p>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <div className="space-y-1">
                    <p className="font-semibold text-foreground">{row.availableStock}</p>
                    <p className="text-xs text-foreground/52">
                      {row.availableStock > 0 ? "Available" : "Awaiting stock"}
                    </p>
                  </div>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClasses(row.status)}`}>
                    {row.status}
                  </span>
                </td>
                <td className="border-b border-border/60 px-4 py-4 align-top">
                    <div className="flex items-center gap-1.5">
                      <div className="group relative">
                        <Link
                          href={`/admin/products/${row.id}/edit`}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/10 bg-primary/4 text-primary transition-all hover:bg-primary hover:text-white"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-black/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-all group-hover:opacity-100">
                          Edit Product
                          <div className="absolute top-full left-1/2 h-1 w-1 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-black/80" />
                        </div>
                      </div>

                      <div className="group relative">
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={deletingId === row.id}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-danger/10 bg-danger/4 text-danger transition-all hover:bg-danger hover:text-white disabled:opacity-50 disabled:hover:bg-danger/4 disabled:hover:text-danger"
                        >
                          {deletingId === row.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                        {/* Tooltip */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white opacity-0 transition-all group-hover:opacity-100">
                          {deletingId === row.id ? "Deleting..." : "Delete Product"}
                          <div className="absolute top-full left-1/2 h-1 w-1 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-red-600" />
                        </div>
                      </div>
                    </div>
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={9} className="px-6 py-14 text-center">
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
