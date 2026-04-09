'use client';

import React from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowDownUp, ChevronsUpDown, X, RefreshCcw, Check, LayoutGrid, Layers } from "lucide-react";
import Link from "next/link";

const SORT_OPTIONS = [
  { value: "latest", label: "Latest updated" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "stock-desc", label: "Stock high to low" },
  { value: "variants-desc", label: "Most variants" },
  { value: "brand-asc", label: "Brand A-Z" },
] as const;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

interface CatalogHeaderProps {
  badgeLabel: string;
  title: string;
  totalCount: number;
  description: string;
  isSourceReadonly: boolean;
  importHref: string;
  importLabel: string;
  handleImport: () => void;
  exportVisible: () => void;
  newProductHref: string | null;
  newProductLabel: string;
  sourceNotice: string;
  query: string;
  setQuery: (q: string) => void;
  filterPanelOpen: boolean;
  setFilterPanelOpen: (open: boolean | ((curr: boolean) => boolean)) => void;
  activeFilterCount: number;
  sortBy: string;
  setSortBy: (val: any) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  visibleCount: number;
  availableStock: number;
  selectedIdsCount: number;
  brandOptions: string[];
  brandFilters: string[];
  setBrandFilters: (fn: (curr: string[]) => string[]) => void;
  statusOptions: string[];
  statusFilters: string[];
  setStatusFilters: (fn: (curr: string[]) => string[]) => void;
  productTypeOptions: string[];
  typeFilters: string[];
  setTypeFilters: (fn: (curr: string[]) => string[]) => void;
  categoryOptions: string[];
  categoryFilters: string[];
  setCategoryFilters: (fn: (curr: string[]) => string[]) => void;
  attributeCatalog: any[];
  attributeFilters: Record<string, string[]>;
  setAttributeFilters: (fn: (curr: Record<string, string[]>) => Record<string, string[]>) => void;
  availableOnly: boolean;
  setAvailableOnly: (val: boolean) => void;
  viewMode: "product" | "sku";
  setViewMode: (mode: "product" | "sku") => void;
  appliedFilters: any[];
  clearAllFilters: () => void;
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function CatalogHeader({
  badgeLabel,
  title,
  totalCount,
  description,
  isSourceReadonly,
  importHref,
  importLabel,
  handleImport,
  exportVisible,
  newProductHref,
  newProductLabel,
  sourceNotice,
  query,
  setQuery,
  filterPanelOpen,
  setFilterPanelOpen,
  activeFilterCount,
  sortBy,
  setSortBy,
  pageSize,
  setPageSize,
  visibleCount,
  availableStock,
  selectedIdsCount,
  brandOptions,
  brandFilters,
  setBrandFilters,
  statusOptions,
  statusFilters,
  setStatusFilters,
  productTypeOptions,
  typeFilters,
  setTypeFilters,
  categoryOptions,
  categoryFilters,
  setCategoryFilters,
  attributeCatalog,
  attributeFilters,
  setAttributeFilters,
  availableOnly,
  setAvailableOnly,
  viewMode,
  setViewMode,
  appliedFilters,
  clearAllFilters,
}: CatalogHeaderProps) {
  return (
    <section className="premium-card overflow-hidden rounded-[28px]">
      <div className="grid gap-3 border-b border-border/60 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
            {badgeLabel}
          </p>
          <div className="flex flex-wrap items-center gap-3 ">
            <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
              {title}
            </h2>
            <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
              {totalCount} total
            </span>
          </div>
          <p className="max-w-4xl text-sm text-foreground/62">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isSourceReadonly ? (
            <Link
              href={importHref}
              className="rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76"
            >
              {importLabel}
            </Link>
          ) : (
            <button
              onClick={handleImport}
              className="rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76"
            >
              Import file
            </button>
          )}
          <button
            onClick={exportVisible}
            className="rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76"
          >
            Export visible
          </button>
          {newProductHref ? (
            <Link
              href={newProductHref}
              className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(47,127,244,0.22)]"
            >
              {newProductLabel}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        {/* {isSourceReadonly && sourceNotice ? (
          <div className="rounded-[22px] border border-primary/20 bg-primary/8 px-4 py-4 text-sm text-foreground/72">
            {sourceNotice}
          </div>
        ) : null} */}

      <div className="flex flex-wrap items-center gap-3">

  <label className="premium-search flex items-center gap-3 rounded-[22px] px-4 py-3 flex-1 min-w-[250px]">
    <Search className="h-4 w-4 text-foreground/45" />
    <input
      value={query}
      onChange={(event) => setQuery(event.target.value)}
      placeholder="Search by product, base SKU, variant SKU, brand, category, or attribute value"
      className="w-full border-none bg-transparent p-0 text-sm"
    />
  </label>

  <div className="flex items-center gap-1 rounded-[22px] border border-border/70 bg-background p-1.5 shadow-sm">
    <button
      onClick={() => setViewMode("product")}
      className={`flex items-center gap-2 rounded-[18px] px-4 py-2 text-sm font-semibold ${
        viewMode === "product"
          ? "bg-[#111] text-white"
          : "text-foreground/55 hover:bg-foreground/5"
      }`}
    >
      <LayoutGrid className="h-4 w-4" />
      Group view
    </button>

    <button
      onClick={() => setViewMode("sku")}
      className={`flex items-center gap-2 rounded-[18px] px-4 py-2 text-sm font-semibold ${
        viewMode === "sku"
          ? "bg-[#111] text-white"
          : "text-foreground/55 hover:bg-foreground/5"
      }`}
    >
      <Layers className="h-4 w-4" />
      SKU view
    </button>
  </div>

  <button
    onClick={() => setFilterPanelOpen((c: boolean) => !c)}
    className="inline-flex items-center gap-2 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold"
  >
    <SlidersHorizontal className="h-4 w-4" />
    Filters
  </button>

  <label className="inline-flex items-center gap-3 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold">
    <ArrowDownUp className="h-4 w-4" />
    <select
      value={sortBy}
      onChange={(event) => setSortBy(event.target.value)}
      className="bg-transparent border-none text-sm"
    >
      {SORT_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>

  <label className="inline-flex items-center gap-3 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold">
    <ChevronsUpDown className="h-4 w-4" />
    <select
      value={pageSize}
      onChange={(event) => setPageSize(Number(event.target.value))}
      className="bg-transparent border-none text-sm"
    >
      {PAGE_SIZE_OPTIONS.map((value) => (
        <option key={value} value={value}>
          {value} / page
        </option>
      ))}
    </select>
  </label>

</div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label="Visible products" value={String(visibleCount)} tone="neutral" />
          <SummaryTile label="Available stock" value={String(availableStock)} tone="primary" />
          <SummaryTile label="Selected rows" value={String(selectedIdsCount)} tone="neutral" />
          <SummaryTile label="Active filters" value={String(activeFilterCount)} tone="neutral" />
        </div>

        {filterPanelOpen ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid gap-4 rounded-[24px] border border-border/70 bg-background/75 p-4 xl:grid-cols-[repeat(4,minmax(0,1fr))]"
          >
            <FilterGroup
              title="Brand"
              values={brandOptions}
              selectedValues={brandFilters}
              onToggle={(value) => setBrandFilters((current) => toggleValue(current, value))}
            />
            <FilterGroup
              title="Status"
              values={statusOptions}
              selectedValues={statusFilters}
              onToggle={(value) => setStatusFilters((current) => toggleValue(current, value))}
            />
            <FilterGroup
              title="Product type"
              values={productTypeOptions}
              selectedValues={typeFilters}
              onToggle={(value) => setTypeFilters((current) => toggleValue(current, value))}
            />
            <FilterGroup
              title="Category"
              values={categoryOptions}
              selectedValues={categoryFilters}
              onToggle={(value) => setCategoryFilters((current) => toggleValue(current, value))}
            />

            <div className="xl:col-span-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Attribute filters</h3>
                  <p className="text-xs text-foreground/52">
                    Filter products by specific attributes like size, color, or material.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-[color:var(--surface)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/64">
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(event) => setAvailableOnly(event.target.checked)}
                    className="h-4 w-4 rounded border-border/80"
                  />
                  Available stock only
                </label>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {attributeCatalog.map((attribute) => (
                  <FilterGroup
                    key={attribute.key}
                    title={attribute.label}
                    values={attribute.values}
                    selectedValues={attributeFilters[attribute.key] ?? []}
                    onToggle={(value) =>
                      setAttributeFilters((current) => ({
                        ...current,
                        [attribute.key]: toggleValue(current[attribute.key] ?? [], value),
                      }))
                    }
                  />
                ))}
              </div>
            </div>
          </motion.div>
        ) : null}

        {appliedFilters.length ? (
          <div className="flex flex-wrap items-center gap-2">
            {appliedFilters.map((filterItem) => (
              <button
                key={filterItem.key}
                onClick={filterItem.onRemove}
                className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold text-foreground/72"
              >
                {filterItem.label}
                <X className="h-3.5 w-3.5" />
              </button>
            ))}
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Clear all
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SummaryTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "neutral" | "primary";
}) {
  return (
    <div
      className={`rounded-[22px] border px-4 py-4 ${
        tone === "primary"
          ? "border-primary/20 bg-primary/10"
          : "border-border/70 bg-background/75"
      }`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-foreground/45">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function FilterGroup({
  title,
  values,
  selectedValues,
  onToggle,
}: {
  title: string;
  values: string[];
  selectedValues: string[];
  onToggle: (value: string) => void;
}) {
  if (!values.length) {
    return null;
  }

  return (
    <div className="rounded-[22px] border border-border/70 bg-[color:var(--surface)] p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-foreground/46">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const selected = selectedValues.includes(value);

          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                selected
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border/70 bg-background text-foreground/66 hover:text-foreground"
              }`}
            >
              {selected ? <Check className="h-3.5 w-3.5" /> : null}
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}
