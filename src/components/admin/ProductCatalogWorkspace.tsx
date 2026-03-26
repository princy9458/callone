'use client';

import Link from "next/link";
import React, {useDeferredValue, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {
  ArrowDownUp,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Package2,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import GetAllBrands from "../brands/GetAllBrands";
import GetAllAtributeSet from "../attributeSet/GetAllAtributeSet";
import { ProductCatalogWorkspaceProps } from "../products/ProductType";
import { buildExportRows, downloadCsv } from "../products/utils/ProductExcel";
import UpdateBrandAttribute from "../products/UpdateBrandAttribute";
import ImportFile from "../products/importFile/ImportFile";


const SORT_OPTIONS = [
  {value: "latest", label: "Latest updated"},
  {value: "name-asc", label: "Name A-Z"},
  {value: "stock-desc", label: "Stock high to low"},
  {value: "variants-desc", label: "Most variants"},
  {value: "brand-asc", label: "Brand A-Z"},
] as const;

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function statusClasses(status: string) {
  if (status === "active") {
    return "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300";
  }

  if (status === "draft") {
    return "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }

  return "border-white/10 bg-white/6 text-foreground/70";
}



export function ProductCatalogWorkspace({
  products,
  title = "Products",
  description = "Instant search, layered attribute filters, selectable rows, compact pagination, and stock-aware sorting tuned for dense admin workflows.",
  badgeLabel = "Brand-aware catalog explorer",
}: ProductCatalogWorkspaceProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("latest");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState("");
  const [brandFilters, setBrandFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({});
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const brandOptions = Array.from(
    products.reduce((set, product) => set.add(product.brand.code), new Set<string>())
  ).sort((left, right) => left.localeCompare(right));

  const statusOptions = Array.from(
    products.reduce((set, product) => set.add(product.status), new Set<string>())
  ).sort((left, right) => left.localeCompare(right));

  const productTypeOptions = Array.from(
    products.reduce((set, product) => set.add(product.productType), new Set<string>())
  ).sort((left, right) => left.localeCompare(right));

  const categoryOptions = Array.from(
    products.reduce((set, product) => set.add(product.category), new Set<string>())
  ).sort((left, right) => left.localeCompare(right));

  const attributeCatalog = Array.from(
    products.reduce((map, product) => {
      product.attributeGroups.forEach((group) => {
        const existing = map.get(group.key) ?? {key: group.key, label: group.label, values: new Set<string>()};
        group.values.forEach((value) => existing.values.add(value));
        map.set(group.key, existing);
      });
      return map;
    }, new Map<string, {key: string; label: string; values: Set<string>}>())
      .values()
  )
    .map((group) => ({
      key: group.key,
      label: group.label,
      values: Array.from(group.values).sort((left, right) => left.localeCompare(right)),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));

  const filteredProducts = products.filter((product) => {
    if (availableOnly && product.availableStock <= 0) {
      return false;
    }

    if (brandFilters.length && !brandFilters.includes(product.brand.code)) {
      return false;
    }

    if (statusFilters.length && !statusFilters.includes(product.status)) {
      return false;
    }

    if (typeFilters.length && !typeFilters.includes(product.productType)) {
      return false;
    }

    if (categoryFilters.length && !categoryFilters.includes(product.category)) {
      return false;
    }

    for (const [attributeKey, selectedValues] of Object.entries(attributeFilters)) {
      if (!selectedValues.length) {
        continue;
      }

      const productGroup = product.attributeGroups.find((group) => group.key === attributeKey);
      if (!productGroup || !productGroup.values.some((value) => selectedValues.includes(value))) {
        return false;
      }
    }

    if (!deferredQuery) {
      return true;
    }

    const haystack = [
      product.name,
      product.baseSku,
      product.brand.code,
      product.brand.name,
      product.category,
      product.subcategory,
      product.productType,
      product.status,
      ...product.variantSkus,
      ...product.variantTitles,
      ...product.attributeGroups.flatMap((group) => [group.label, ...group.values]),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(deferredQuery);
  });

  const sortedProducts = [...filteredProducts].sort((left, right) => {
    switch (sortBy) {
      case "name-asc":
        return left.name.localeCompare(right.name);
      case "stock-desc":
        return right.availableStock - left.availableStock;
      case "variants-desc":
        return right.variantCount - left.variantCount;
      case "brand-asc":
        return left.brand.name.localeCompare(right.brand.name);
      case "latest":
      default:
        return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    }
  });

  const pageCount = Math.max(1, Math.ceil(sortedProducts.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleProducts = sortedProducts.slice(pageStart, pageStart + pageSize);
  const selectedVisibleCount = visibleProducts.filter((product) => selectedIds.includes(product.id)).length;
  const allVisibleSelected = visibleProducts.length > 0 && selectedVisibleCount === visibleProducts.length;
  const selectedProducts = sortedProducts.filter((product) => selectedIds.includes(product.id));
  const activeFilterCount =
    brandFilters.length +
    statusFilters.length +
    typeFilters.length +
    categoryFilters.length +
    Object.values(attributeFilters).reduce((sum, values) => sum + values.length, 0) +
    (availableOnly ? 1 : 0);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    setPage(1);
  }, [
    deferredQuery,
    availableOnly,
    sortBy,
    pageSize,
    brandFilters,
    statusFilters,
    typeFilters,
    categoryFilters,
    attributeFilters,
  ]);

  const appliedFilters = [
    ...brandFilters.map((value) => ({
      key: `brand-${value}`,
      label: `Brand: ${value}`,
      onRemove: () => setBrandFilters((current) => current.filter((item) => item !== value)),
    })),
    ...statusFilters.map((value) => ({
      key: `status-${value}`,
      label: `Status: ${value}`,
      onRemove: () => setStatusFilters((current) => current.filter((item) => item !== value)),
    })),
    ...typeFilters.map((value) => ({
      key: `type-${value}`,
      label: `Type: ${value}`,
      onRemove: () => setTypeFilters((current) => current.filter((item) => item !== value)),
    })),
    ...categoryFilters.map((value) => ({
      key: `category-${value}`,
      label: `Category: ${value}`,
      onRemove: () => setCategoryFilters((current) => current.filter((item) => item !== value)),
    })),
    ...Object.entries(attributeFilters).flatMap(([key, values]) =>
      values.map((value) => ({
        key: `attr-${key}-${value}`,
        label: `${attributeCatalog.find((group) => group.key === key)?.label ?? key}: ${value}`,
        onRemove: () =>
          setAttributeFilters((current) => ({
            ...current,
            [key]: (current[key] ?? []).filter((item) => item !== value),
          })),
      }))
    ),
    ...(availableOnly
      ? [
          {
            key: "available-only",
            label: "Available only",
            onRemove: () => setAvailableOnly(false),
          },
        ]
      : []),
  ];

  async function handleDelete(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    const confirmed = window.confirm(`Delete ${product.name}? Variants and inventory rows will also be removed.`);
    if (!confirmed) {
      return;
    }

    setDeletingId(productId);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {method: "DELETE"});
      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setSelectedIds((current) => current.filter((id) => id !== productId));
      router.refresh();
    } catch (error) {
      console.error(error);
      window.alert("Failed to delete product. Please try again.");
    } finally {
      setDeletingId("");
    }
  }

  function clearAllFilters() {
    setAvailableOnly(false);
    setBrandFilters([]);
    setStatusFilters([]);
    setTypeFilters([]);
    setCategoryFilters([]);
    setAttributeFilters({});
    setQuery("");
  }

  function exportVisible() {
    downloadCsv("products-visible.csv", buildExportRows(sortedProducts));
  }

  function exportSelected() {
    downloadCsv("products-selected.csv", buildExportRows(selectedProducts));
  }

  const [isOpen,setIsOpen] = useState(false);
   const handleImport = () => {
    setIsOpen(true);
   }
  return (
    <>
    {/* get all attributes  */}
    <GetAllAtributeSet/>
    {/* get all brands  */}
    <GetAllBrands/>

    {/* update current brand attribute  */}
    <UpdateBrandAttribute/>

    <div className="space-y-4">
      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="grid gap-3 border-b border-border/60 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/42">
              {badgeLabel}
            </p>
            <div className="flex flex-wrap items-end gap-3">
              <h2 className="text-[1.85rem] font-semibold tracking-tight text-foreground">
                {title}
              </h2>
              <span className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/55">
                {products.length} total
              </span>
            </div>
            <p className="max-w-4xl text-sm text-foreground/62">{description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* <ImportFile /> */}
                  <button
              onClick={handleImport}
              className="rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76"
            >
              Import file
            </button>
            <button
              onClick={exportVisible}
              className="rounded-2xl border border-border/70 bg-background px-4 py-2.5 text-sm font-semibold text-foreground/76"
            >
              Export visible
            </button>
            <Link
              href="/admin/products/new"
              className="rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(47,127,244,0.22)]"
            >
              New product
            </Link>
          </div>
        </div>

        <div className="space-y-4 px-4 py-4">
          <div className="grid gap-3 xl:grid-cols-[minmax(0,1.3fr)_auto_auto_auto]">
            <label className="premium-search flex items-center gap-3 rounded-[22px] px-4 py-3">
              <Search className="h-4 w-4 text-foreground/45" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by product, base SKU, variant SKU, brand, category, or attribute value"
                className="w-full border-none bg-transparent p-0 text-sm"
              />
            </label>

            <button
              onClick={() => setFilterPanelOpen((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>

            <label className="inline-flex items-center gap-3 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76">
              <ArrowDownUp className="h-4 w-4 text-foreground/45" />
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as (typeof SORT_OPTIONS)[number]["value"])}
                className="border-none bg-transparent p-0 pr-6 text-sm font-semibold"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="inline-flex items-center gap-3 rounded-[20px] border border-border/70 bg-background px-4 py-3 text-sm font-semibold text-foreground/76">
              <ChevronsUpDown className="h-4 w-4 text-foreground/45" />
              <select
                value={pageSize}
                onChange={(event) => setPageSize(Number(event.target.value))}
                className="border-none bg-transparent p-0 pr-6 text-sm font-semibold"
              >
                {PAGE_SIZE_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value} / page
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/52">
            <span className="rounded-full border border-border/70 bg-background px-3 py-1 font-semibold uppercase tracking-[0.14em] text-foreground/58">
              Quick guidance
            </span>
            <span>Try `CG-PRO-SEED`, `Travis`, `Polos`, `Color Blue`, or `WH90` in imports calibration.</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <SummaryTile label="Visible products" value={String(sortedProducts.length)} tone="neutral" />
            <SummaryTile label="Available stock" value={String(sortedProducts.reduce((sum, product) => sum + product.availableStock, 0))} tone="primary" />
            <SummaryTile label="Selected rows" value={String(selectedIds.length)} tone="neutral" />
            <SummaryTile label="Active filters" value={String(activeFilterCount)} tone="neutral" />
          </div>

          {filterPanelOpen ? (
            <motion.div
              initial={{opacity: 0, y: -8}}
              animate={{opacity: 1, y: 0}}
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
                      Multiple values inside one attribute work as OR. Different attributes stack logically.
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

      <section className="premium-card overflow-hidden rounded-[28px]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">Catalog grid</h3>
            <p className="text-sm text-foreground/56">
              Sticky table header aligns below the admin header. Selection is scoped to the visible page.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-foreground/48">
            <span>
              Showing {sortedProducts.length === 0 ? 0 : pageStart + 1}-{Math.min(pageStart + pageSize, sortedProducts.length)}
            </span>
            <span>of {sortedProducts.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
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
                          current.filter((id) => !visibleProducts.some((product) => product.id === id))
                        );
                      } else {
                        setSelectedIds((current) =>
                          Array.from(new Set([...current, ...visibleProducts.map((product) => product.id)]))
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
              {visibleProducts.length ? (
                visibleProducts.map((product) => {
                  const isSelected = selectedIds.includes(product.id);

                  return (
                    <tr key={product.id} className="border-b border-border/60 transition-colors hover:bg-primary/5">
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <input
                          type="checkbox"
                          aria-label={`Select ${product.name}`}
                          checked={isSelected}
                          onChange={() =>
                            setSelectedIds((current) =>
                              current.includes(product.id)
                                ? current.filter((id) => id !== product.id)
                                : [...current, product.id]
                            )
                          }
                          className="mt-1 h-4 w-4 rounded border-border/80"
                        />
                      </td>
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <div className="flex gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#111111] text-xs font-semibold uppercase tracking-[0.14em] text-white">
                            {product.brand.code.slice(0, 2)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="truncate font-semibold text-foreground">{product.name}</p>
                              <span className="rounded-full border border-border/70 bg-background px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground/48">
                                {product.baseSku}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-foreground/52">
                              {product.subcategory || "No subcategory"} · {product.productType}
                            </p>
                            <p className="mt-2 line-clamp-1 text-xs text-foreground/45">
                              {product.variantSkus.slice(0, 3).join(" · ")}
                              {product.variantSkus.length > 3 ? ` +${product.variantSkus.length - 3} more` : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{product.brand.name}</p>
                          <p className="text-xs text-foreground/52">{product.brand.code}</p>
                        </div>
                      </td>
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <p className="font-medium text-foreground">{product.category || "Uncategorized"}</p>
                        <p className="mt-1 text-xs text-foreground/52">{product.subcategory || "No subcategory"}</p>
                      </td>
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <div className="flex flex-wrap gap-2">
                          {product.attributeGroups.length ? (
                            product.attributeGroups.slice(0, 3).map((group) => (
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
                        <p className="font-semibold text-foreground">{product.variantCount}</p>
                        <p className="mt-1 text-xs text-foreground/52">
                          {product.variants.slice(0, 2).map((variant) => variant.title).join(" · ")}
                          {product.variants.length > 2 ? ` +${product.variants.length - 2} more` : ""}
                        </p>
                      </td>
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">{product.availableStock}</p>
                          <p className="text-xs text-foreground/52">
                            {product.availableStock > 0 ? "Available" : "Awaiting stock"}
                          </p>
                        </div>
                      </td>
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusClasses(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="border-b border-border/60 px-4 py-4 align-top">
                        <div className="flex flex-col items-start gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-sm font-semibold text-primary"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-danger disabled:opacity-60"
                          >
                            <Trash2 className="h-4 w-4" />
                            {deletingId === product.id ? "Deleting..." : "Delete"}
                          </button>
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
                      <h3 className="mt-4 text-base font-semibold text-foreground">No products match this filter state</h3>
                      <p className="mt-2 text-sm text-foreground/56">
                        Adjust the search term, remove some attribute chips, or switch off the available-only constraint.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

      {selectedIds.length ? (
        <motion.div
          initial={{opacity: 0, y: 16}}
          animate={{opacity: 1, y: 0}}
          className="sticky bottom-4 z-30 mx-auto flex w-full max-w-[900px] flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-[#111111] px-4 py-3 text-white shadow-[0_30px_60px_rgba(0,0,0,0.26)]"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
              {selectedIds.length} selected
            </span>
            <p className="text-sm text-white/72">
              Bulk-ready footer for exports and future brand/stock actions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportSelected}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Export selected
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-2xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-white/70"
            >
              Clear selection
            </button>
          </div>
        </motion.div>
      ) : null}
    </div>

    {/* import file  */}
    <ImportFile isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
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

function StickyHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={className}
      style={{
        position: "sticky",
        top: "calc(var(--admin-header-height) + 12px)",
        zIndex: 12,
      }}
    >
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/82">
        {children}
      </div>
    </th>
  );
}
