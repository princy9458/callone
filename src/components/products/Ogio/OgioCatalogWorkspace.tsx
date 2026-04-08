import React from "react";
import {ProductCatalogWorkspace} from "@/components/admin/ProductCatalogWorkspace";
import type {ProductCatalogRecord} from "@/components/products/ProductType";

type OgioCatalogWorkspaceProps = {
  products: ProductCatalogRecord[];
  mode?: "managed" | "source_readonly";
  sourceCollectionName?: string;
  isLoading?: boolean;
  initialViewMode?: "product" | "sku";
};

export function OgioCatalogWorkspace({
  products,
  mode = "managed",
  sourceCollectionName = "",
  isLoading = false,
  initialViewMode = "sku",
}: OgioCatalogWorkspaceProps) {
  return (
    <ProductCatalogWorkspace
      products={products}
      title="Ogio"
      description="Travel gear, backpacks, and bag essentials from the Ogio assortment."
      badgeLabel="Ogio Catalog"
      workspaceMode={mode}
      importHref="/admin/imports"
      importLabel="Open imports"
      newProductHref={mode === "source_readonly" ? null : "/admin/products/new"}
      sourceNotice={
        mode === "source_readonly"
          ? `This catalog is currently sourced from ${sourceCollectionName || "the raw Ogio collection"}. Use Imports for catalog and inventory refreshes, and keep image uploads on a separate lane.`
          : ""
      }
      isLoading={isLoading}
      initialViewMode={initialViewMode}
    />
  );
}
