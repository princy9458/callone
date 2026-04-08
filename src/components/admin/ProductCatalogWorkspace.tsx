'use client';

import Link from "next/link";
import { OrderModel } from "@/store/slices/order/OrderType";
import { createOrder, updateOrder } from "@/store/slices/order/orderThunks";
import { AppDispatch, RootState } from "@/store";
import React, { useDeferredValue, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileSpreadsheet,
  Package2,
  RefreshCcw,
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
import { SelectRetailerModal } from "./SelectRetailerModal";
import { useSelector, useDispatch } from "react-redux";
import { addToCart, CartItem } from "@/store/slices/cart/cartSlice";
import { ImageSliderModal } from "./ImageSliderModal";



const SORT_OPTIONS = [
  { value: "latest", label: "Latest updated" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "stock-desc", label: "Stock high to low" },
  { value: "variants-desc", label: "Most variants" },
  { value: "brand-asc", label: "Brand A-Z" },
] as const;

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
  isLoading = false,
  initialViewMode = "sku",
}: ProductCatalogWorkspaceProps) {
  const router = useRouter();
  const isSourceReadonly = workspaceMode === "source_readonly";
  const [query, setQuery] = useState("");
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState<(typeof SORT_OPTIONS)[number]["value"]>("latest");
  const [viewMode, setViewMode] = useState<"product" | "sku">(initialViewMode);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState("");
  const [brandFilters, setBrandFilters] = useState<string[]>([]);
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string[]>>({});
  const [skuQuantities, setSkuQuantities] = useState<Record<string, CartItem>>({});
  const [retailerModalOpen, setRetailerModalOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewIndex, setPreviewIndex] = useState(0);


  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const isApiCall = useRef(false)
  const lastSyncedItemsRef = useRef<string>("")
  const { currentOrder } = useSelector((state: RootState) => state.order)
  
  useEffect(() => {
    // Only proceed if we have items and necessary order details
    if (!cart.items || cart.items.length === 0 || cart.discountType == null || cart.discountValue == null) {
      return;
    }

    const itemsJson = JSON.stringify(cart.items);
    console.log("item json---->",itemsJson)
    
    // Skip if items haven't changed since last sync
    if (itemsJson === lastSyncedItemsRef.current) {
      return;
    }

    // Skip if an API call is already in progress
    if (isApiCall.current) {
      return;
    }

    const syncOrder = async () => {
      isApiCall.current = true;
      
      const orderData: OrderModel = {
        items: cart.items,
        retailer_id: cart.selectedRetailer?._id ?? "",
        manager_id: cart.selectedManager?._id ?? "",
        salesrep_id: cart.selectedSalesRep?._id ?? "",
        discount_type: cart.discountType,
        discount_percent: cart.discountValue,
        user_id: "",
        totalAmount: cart.items.reduce((acc, item) => acc + (item.finalAmount ?? 0), 0),
        discountAmount: cart.items.reduce((acc, item) => acc + (item.lessDiscount ?? 0), 0),
        status: "pending",
        note: [],
        created_at: currentOrder?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      try {
        if (!currentOrder) {
          // Create new order (POST)
          console.log("Creating new order:", orderData);
          await dispatch(createOrder(orderData)).unwrap();
        } else {
          // Update existing order (PUT)
          const orderId = currentOrder._id || (currentOrder as any).id;
          console.log("Updating existing order:", orderId, orderData);
          await dispatch(updateOrder({ id: orderId.toString(), data: orderData })).unwrap();
        }
        lastSyncedItemsRef.current = itemsJson;
      } catch (error) {
        console.error("Failed to sync order:", error);
      } finally {
        isApiCall.current = false;
      }
    };

    syncOrder();
  }, [cart.items, cart.selectedRetailer, cart.selectedManager, cart.selectedSalesRep, cart.discountType, cart.discountValue, currentOrder, dispatch]);

 
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
        const existing = map.get(group.key) ?? { key: group.key, label: group.label, values: new Set<string>() };
        group.values.forEach((value) => existing.values.add(value));
        map.set(group.key, existing);
      });
      return map;
    }, new Map<string, { key: string; label: string; values: Set<string> }>())
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
      description: p.name, // Fallback if no specific description
      mrp: (p as any).mrp || (v as any).mrp || 0,
      // Create a unique key for selection/rendering that is specific to the SKU
      rowKey: `${p.id}-${v.sku}`
    })))
    : sortedProducts.map(p => ({ ...p, rowKey: p.id, description: p.name, mrp: (p as any).mrp || 0 }));

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
      const response = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
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

  const [isOpen, setIsOpen] = useState(false);
  const handleImport = () => {
    if (isSourceReadonly) {
      router.push(importHref);
      return;
    }

    setIsOpen(true);
  }

  const hasQuantities = Object.values(skuQuantities).some(q => (q.qty88 ?? 0) > 0 || (q.qty90 ?? 0) > 0);



  // Commenting out the automatic sync to cart as it conflicts with the incremental addToCart logic.
  // If live-sync is desired, a different "syncCart" action should be used to avoid double-counting.
 
  useEffect(( ) => {
      if(Object.values(skuQuantities).length > 0){

          const dataItem:CartItem[]=[]
        Object.entries(skuQuantities).forEach(([rowKey, qtys]) => {
             console.log(rowKey,qtys)
             const data={
              id:rowKey,
              sku:qtys.sku    ,
              brand:qtys.brand,
              description:qtys.description,
              image:qtys.image,
              qty88:qtys.qty88,
              qty90:qtys.qty90,
              mrp:qtys.mrp,
              gst:qtys.gst??0,
              amount:qtys.amount??0,
              discount:qtys.discount??0,
              lessDiscount:qtys.lessDiscount??0,
              netBilling:qtys.netBilling??0,
              finalAmount:qtys.finalAmount??0,
             }
             dataItem.push(data)
        })
        console.log("dataItem---->",dataItem)
        // dispatch(addToCart(dataItem))
      }
  }, [skuQuantities])
  

  const handleAddToCart = () => {
    if (!cart.selectedRetailer) {
      setRetailerModalOpen(true);
      return;
    }

    const itemsToAdd: CartItem[] = [];

    // Process SKU quantities and add to cart
    Object.entries(skuQuantities).forEach(([rowKey, qtys]) => {
      if ((qtys.qty88 ?? 0) > 0 || (qtys.qty90 ?? 0) > 0) {
        // Find the variant/product info for this rowKey
        // rowKey is productId-sku in SKU mode, or productId in product mode
        const row = normalizedRows.find(r => r.rowKey === rowKey);
        if (row) {
          const qtyTotal = (qtys.qty88 || 0) + (qtys.qty90 || 0);
          const itemMrp = (row as any).mrp || 0;
          const amount = qtyTotal * itemMrp;
          
          itemsToAdd.push({
            id: (row as any).variantId || row.id,
            sku: row.sku || row.baseSku,
            brand: row.brand.name,
            description: (row as any).description,
            image: row.primary_url?.[0],
            qty88: qtys.qty88,
            qty90: qtys.qty90,
            qty: qtyTotal,
            mrp: itemMrp,
            gst: 18,
            amount: amount,
            finalAmount: amount * 1.18, // 18% GST estimate
            netBilling: amount,
          });
        }
      }
    });

    if (itemsToAdd.length > 0) {
      dispatch(addToCart(itemsToAdd));
    }

    // Clear quantities after adding to cart
    setSkuQuantities({});
    router.push('/admin/cart/new');
  };

  const handleOpenPreview = (images: string[], index: number = 0) => {
    setPreviewImages(images);
    setPreviewIndex(index);
    setPreviewOpen(true);
  };

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
        <UpdateCurrentBrand />

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

        <div className="relative">
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center rounded-3xl border border-white/10 bg-black/20 backdrop-blur-[2px] transition-all"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
                  <div className="h-2 w-2 animate-ping rounded-full bg-primary"></div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-sm font-bold uppercase tracking-widest text-white">Updating Catalog</span>
                  <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Synchronizing data...</span>
                </div>
              </div>
            </motion.div>
          )}

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
            skuQuantities={skuQuantities}
            setSkuQuantities={setSkuQuantities}
            onOpenPreview={handleOpenPreview}
          />
        </div>

        {selectedIds.length ? (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[100] border-t border-white/10 bg-black px-6 py-4 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">Actions for</span>
                  <span className="text-sm font-black uppercase tracking-widest text-primary">
                    {selectedIds.length} items selected
                  </span>
                </div>
                <div className="h-8 w-px bg-white/10" />
                <p className="hidden text-xs font-semibold text-white/40 lg:block">
                  Bulk export, quantity updates, and inventory management for the current selection.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds([])}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:bg-white/10 hover:text-white"
                >
                  Clear Selection
                </button>
                <div className="h-8 w-px bg-white/10" />
                <ProductExportActions
                  selectedProducts={selectedProducts}
                  selectedIds={selectedIds}
                  setSelectedIds={setSelectedIds}
                  viewMode={viewMode}
                  brandName={selectedProducts.length > 0 && selectedProducts.every(p => p.brand.name === "Travis Mathew") ? "Travis Mathew" : undefined}
                />
              </div>
            </div>
          </motion.div>
        ) : null}

        {hasQuantities && !selectedIds.length ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky bottom-4 z-30 mx-auto flex w-full max-w-[400px] items-center justify-between gap-3 rounded-[24px] border border-primary/20 bg-primary px-6 py-4 text-white shadow-[0_20px_50px_rgba(15,132,255,0.3)]"
          >
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase tracking-wider opacity-80">Ready to add</span>
              <span className="text-sm font-semibold">
                {Object.values(skuQuantities).filter(q => (q.qty88 ?? 0) > 0 || (q.qty90 ?? 0) > 0).length} items selected
              </span>
            </div>
            <button
              onClick={handleAddToCart}
              className="rounded-xl bg-white px-5 py-2 text-sm font-bold text-primary shadow-sm hover:bg-white/90 transition-colors"
            >
              Add to Cart
            </button>
          </motion.div>
        ) : null}
      </div>

      {!isSourceReadonly ? (
        <>
          <ImportFile isOpen={isOpen} onClose={() => setIsOpen(false)} />
          <SelectRetailerModal
            isOpen={retailerModalOpen}
            onClose={() => setRetailerModalOpen(false)}
            onConfirm={handleAddToCart}
          />
        </>
      ) : null}

      <ImageSliderModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        images={previewImages}
        currentIndex={previewIndex}
        onIndexChange={setPreviewIndex}
      />
    </>
  );
}
