'use client';

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductTable } from "./productTable/groupView/ProductTable";
import { SkuTable } from "./productTable/skuTable/SkuTable";
import { EmptyState } from "./EmptyState";
import { CartItem } from "@/store/slices/cart/cartSlice";

interface CatalogTableProps {
  visibleRows: any[];
  viewMode: "product" | "sku";
  selectedIds: string[];
  setSelectedIds: (fn: (curr: string[]) => string[]) => void;
  allVisibleSelected: boolean;
  pageStart: number;
  pageSize: number;
  currentPage: number;
  pageCount: number;
  setPage: (fn: (curr: number) => number) => void;
  isSourceReadonly: boolean;
  handleDelete: (id: string) => void;
  deletingId: string;
  sortedProductsCount: number;
  statusClasses: (status: string) => string;
  skuQuantities: Record<string, CartItem>;
  setSkuQuantities: React.Dispatch<React.SetStateAction<Record<string, CartItem>>>;
  onOpenPreview: (images: string[], index: number) => void;
}

export function CatalogTable({
  visibleRows,
  viewMode,
  selectedIds,
  setSelectedIds,
  allVisibleSelected,
  pageStart,
  pageSize,
  currentPage,
  pageCount,
  setPage,
  isSourceReadonly,
  handleDelete,
  deletingId,
  sortedProductsCount,
  statusClasses,
  skuQuantities,
  setSkuQuantities,
  onOpenPreview,
}: CatalogTableProps) {
  return (
    <section className="flex flex-col gap-6">
      {/* Search/Filter Context is likely above this or handled elsewhere, 
          so we focus on the table container itself matching the OrderList style */}
      <div className="overflow-hidden rounded-[32px] border border-border/40 bg-white dark:bg-[#111111] shadow-[0_15px_60px_rgba(0,0,0,0.05)] dark:shadow-[0_45px_100px_rgba(0,0,0,0.4)] transition-all duration-500">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 bg-foreground/[0.01] px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h3 className="text-xl font-black uppercase tracking-widest text-foreground">
                {viewMode === "product" ? "Product Workspace" : "SKU Manifest"}
              </h3>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">
                {viewMode === "product"
                  ? "Operational Global Catalog"
                  : "Individual SKU Variant Tracking"}
              </p>
            </div>
            <div className="h-8 w-px bg-border/40" />
            <div className="rounded-full bg-foreground/[0.05] border border-border/20 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/40">
              {sortedProductsCount === 0 ? "NO RECORDS" : `${pageStart + 1} - ${Math.min(pageStart + pageSize, sortedProductsCount)} OF ${sortedProductsCount}`}
            </div>
          </div>
          
          {/* Internal Search/Navigation would go here if needed, but it's handled in catalogue.tsx usually. 
              We'll keep the space optimized. */}
        </div>

        <div className="w-full max-h-[800px] overflow-auto">
          {visibleRows.length === 0 ? (
            <EmptyState
              title="No records identified"
              description="Try adjusting your search terms or clearing active filters to re-scan the database."
            />
          ) : viewMode === "product" ? (
            <ProductTable
              visibleRows={visibleRows}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              allVisibleSelected={allVisibleSelected}
              isSourceReadonly={isSourceReadonly}
              handleDelete={handleDelete}
              deletingId={deletingId}
              statusClasses={statusClasses}
              onOpenPreview={onOpenPreview}
            />
          ) : (
            <SkuTable
              visibleRows={visibleRows}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              allVisibleSelected={allVisibleSelected}
              isSourceReadonly={isSourceReadonly}
              handleDelete={handleDelete}
              deletingId={deletingId}
              statusClasses={statusClasses}
              skuQuantities={skuQuantities}
              setSkuQuantities={setSkuQuantities}
              onOpenPreview={onOpenPreview}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/40 bg-foreground/[0.01] px-8 py-5">
          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 italic">
            Page {currentPage} <span className="mx-2">/</span> {pageCount} Indexed
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/40 transition-all hover:bg-primary hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 items-center rounded-xl border border-border/40 bg-foreground/[0.02] px-6 text-[11px] font-black tracking-widest text-foreground">
              {currentPage}
            </div>
            <button
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={currentPage === pageCount}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/40 bg-foreground/[0.02] text-foreground/40 transition-all hover:bg-primary hover:text-white disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
