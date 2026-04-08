import React from "react";
import {ProductCatalogWorkspace} from "@/components/admin/ProductCatalogWorkspace";
import type {ProductCatalogRecord} from "@/components/products/ProductType";

type SoftgoodCatalogWorkspaceProps = {
  products: ProductCatalogRecord[];
  mode?: "managed" | "source_readonly";
  sourceCollectionName?: string;
  isLoading?: boolean;
  initialViewMode?: "product" | "sku";
};

export function SoftgoodCatalogWorkspace({
  products,
  mode = "managed",
  sourceCollectionName = "",
  isLoading = false,
  initialViewMode = "sku",
}: SoftgoodCatalogWorkspaceProps) {
  return (
    <ProductCatalogWorkspace
      products={products}
      title="Callaway Softgoods"
      description="Manage the Callaway Softgoods catalog, including apparel, accessories, and seasonal softline products."
      badgeLabel="SoftGood Catalog"
      workspaceMode={mode}
      importHref="/admin/imports"
      importLabel="Open imports"
      newProductHref={mode === "source_readonly" ? null : "/admin/products/new"}
      sourceNotice={
        mode === "source_readonly"
          ? `This catalog is currently sourced from ${sourceCollectionName || "the raw softgoods collection"}. Use Imports for catalog refreshes and daily stock updates so grouping and warehouse rules stay consistent.`
          : ""
      }
      isLoading={isLoading}
      initialViewMode={initialViewMode}
    />
  );
}
