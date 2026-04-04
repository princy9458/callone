'use client';

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductTable } from "./ProductTable";
import { SkuTable } from "./SkuTable";
import { EmptyState } from "./EmptyState";

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
}: CatalogTableProps) {
  return (
    <section className="premium-card overflow-clip rounded-[28px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            {viewMode === "product" ? "Product List" : "SKU List"}
          </h3>
          <p className="text-sm text-foreground/56">
            {viewMode === "product" 
              ? "Select products to perform bulk actions or export data."
              : "Individual SKUs and variants from Redux state."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/48">
          <span>
            Showing {sortedProductsCount === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, sortedProductsCount)}
          </span>
          <span>of {sortedProductsCount}</span>
        </div>
      </div>

      <div className="w-full max-h-[calc(100vh-250px)] overflow-auto rounded-b-[24px]">
        {visibleRows.length === 0 ? (
          <EmptyState 
            title="No records found"
            description="Try adjusting your search terms or clearing active filters."
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
          />
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        <div className="text-sm text-foreground/56">
          Page {currentPage} of {pageCount}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground/70 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="rounded-2xl border border-border/70 bg-background px-4 py-2 text-sm font-semibold text-foreground/76">
            {currentPage}
          </div>
          <button
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            disabled={currentPage === pageCount}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-background text-foreground/70 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
