'use client';

import React from "react";
import Link from "next/link";
import { Package2, Trash2 } from "lucide-react";
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
}: ProductTableProps) {

  console.log("visibleRows--->",visibleRows)
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
                  {isSourceReadonly ? (
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-foreground/72">Source-managed</p>
                      <p className="text-xs text-foreground/48">Use the import workflow for catalog and stock updates.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start gap-2">
                      <Link
                        href={`/admin/products/${row.id}/edit`}
                        className="text-sm font-semibold text-primary"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-danger disabled:opacity-60"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === row.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
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
