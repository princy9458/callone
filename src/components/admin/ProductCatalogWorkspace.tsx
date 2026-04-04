'use client';

import Link from "next/link";
import React, {useDeferredValue, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {motion} from "framer-motion";
import {
  ArrowDownUp,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  FileSpreadsheet,
  FileText,
  Package2,
  Presentation,
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
import { CatalogHeader } from "./CatalogHeader";
import { CatalogTable } from "./CatalogTable";
import { ProductExportActions } from "./ProductExportActions";
import UpdateCurrentBrand from "../brands/UpdateCurrentBrand";



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
  description = "Manage your product catalog, update pricing, verify stock levels, and organize variants across all brands.",
  badgeLabel = "Catalog Management",
  workspaceMode = "managed",
  importHref = "/admin/imports",
  importLabel = "Open imports",
  newProductHref = "/admin/products/new",
  newProductLabel = "New product",
  sourceNotice = "",
}: ProductCatalogWorkspaceProps) {
  const router = useRouter();
  const isSourceReadonly = workspaceMode === "source_readonly";
  const [query, setQuery] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("latest");
  const [viewMode, setViewMode] = useState<"product" | "sku">("product");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState("");
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
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
    // 1. Primary sort: Presence of primary_url (images first)
    const leftHasImage = !!(left.primary_url && left.primary_url.length > 0);
    const rightHasImage = !!(right.primary_url && right.primary_url.length > 0);
    if (leftHasImage && !rightHasImage) return -1;
    if (!leftHasImage && rightHasImage) return 1;

    // 2. Secondary sort: Selected sortBy logic
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

  // SKU View flattening logic
  const normalizedRows = viewMode === "sku" 
    ? sortedProducts.flatMap(p => p.variants.map(v => ({
        ...p,
        sku: v.sku,
        variantTitle: v.title,
        variantStock: v.availableStock,
        variantId: v.id,
        // Create a unique key for selection/rendering that is specific to the SKU
        rowKey: `${p.id}-${v.sku}`
      })))
    : sortedProducts.map(p => ({ ...p, rowKey: p.id }));

  const finalPageCount = Math.max(1, Math.ceil(normalizedRows.length / pageSize));
  const finalCurrentPage = Math.min(page, finalPageCount);
  const finalPageStart = (finalCurrentPage - 1) * pageSize;
  const visibleRows = normalizedRows.slice(finalPageStart, finalPageStart + pageSize);

  const selectedVisibleCount = visibleRows.filter((row) => selectedIds.includes(row.rowKey)).length;
  const allVisibleSelected = visibleRows.length > 0 && selectedVisibleCount === visibleRows.length;
  const selectedProducts = normalizedRows.filter((row) => selectedIds.includes(row.rowKey));
  const activeFilterCount =
    brandFilters.length +
    statusFilters.length +
    typeFilters.length +
    categoryFilters.length +
    Object.values(attributeFilters).reduce((sum, values) => sum + values.length, 0) +
    (availableOnly ? 1 : 0);

  useEffect(() => {
    if (page > finalPageCount) {
      setPage(finalPageCount);
    }
  }, [page, finalPageCount]);

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
    viewMode,
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
    if (isSourceReadonly) {
      return;
    }

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

      setSelectedIds((current) => current.filter((id) => id !== productId && !id.startsWith(`${productId}-`)));
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
    downloadCsv("products-visible.csv", buildExportRows(viewMode === "sku" ? (visibleRows as any) : sortedProducts));
  }

  function exportSelected() {
    downloadCsv("products-selected.csv", buildExportRows(selectedProducts as any));
  }

  const [isOpen,setIsOpen] = useState(false);
   const handleImport = () => {
    if (isSourceReadonly) {
      router.push(importHref);
      return;
    }

    setIsOpen(true);
  }

  return (
    <>
      {!isSourceReadonly ? (
        <>
          <GetAllAtributeSet />
          <GetAllBrands />
          <UpdateBrandAttribute />
         
        </>
      ) : null}

      <div className="space-y-4">
       <UpdateCurrentBrand/>

        <CatalogHeader
          badgeLabel={badgeLabel}
          title={title}
          totalCount={products.length}
          description={description}
          isSourceReadonly={isSourceReadonly}
          importHref={importHref}
          importLabel={importLabel}
          handleImport={handleImport}
          exportVisible={exportVisible}
          newProductHref={newProductHref}
          newProductLabel={newProductLabel}
          sourceNotice={sourceNotice}
          query={query}
          setQuery={setQuery}
          filterPanelOpen={filterPanelOpen}
          setFilterPanelOpen={setFilterPanelOpen}
          activeFilterCount={activeFilterCount}
          sortBy={sortBy}
          setSortBy={setSortBy}
          pageSize={pageSize}
          setPageSize={setPageSize}
          visibleCount={normalizedRows.length}
          availableStock={sortedProducts.reduce((sum, product) => sum + product.availableStock, 0)}
          selectedIdsCount={selectedIds.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
          brandOptions={brandOptions}
          brandFilters={brandFilters}
          setBrandFilters={setBrandFilters}
          statusOptions={statusOptions}
          statusFilters={statusFilters}
          setStatusFilters={setStatusFilters}
          productTypeOptions={productTypeOptions}
          typeFilters={typeFilters}
          setTypeFilters={setTypeFilters}
          categoryOptions={categoryOptions}
          categoryFilters={categoryFilters}
          setCategoryFilters={setCategoryFilters}
          attributeCatalog={attributeCatalog}
          attributeFilters={attributeFilters}
          setAttributeFilters={setAttributeFilters}
          availableOnly={availableOnly}
          setAvailableOnly={setAvailableOnly}
          appliedFilters={appliedFilters}
          clearAllFilters={clearAllFilters}
        />
    
        <CatalogTable
          visibleRows={visibleRows}
          viewMode={viewMode}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          allVisibleSelected={allVisibleSelected}
          pageStart={finalPageStart}
          pageSize={pageSize}
          currentPage={finalCurrentPage}
          pageCount={finalPageCount}
          setPage={setPage}
          isSourceReadonly={isSourceReadonly}
          handleDelete={handleDelete}
          deletingId={deletingId}
          sortedProductsCount={normalizedRows.length}
          statusClasses={statusClasses}
        />

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
              Select an action to apply to the checked products.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ProductExportActions
              selectedProducts={selectedProducts}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              viewMode={viewMode}
              brandName={selectedProducts.length > 0 && selectedProducts.every(p => p.brand.name === "Travis Mathew") ? "Travis Mathew" : undefined}
            />
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

    {!isSourceReadonly ? (
      <ImportFile isOpen={isOpen} onClose={() => setIsOpen(false)} />
    ) : null}
    </>
  );
}
