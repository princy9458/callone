import React from "react";
import {ProductCatalogWorkspace} from "@/components/admin/ProductCatalogWorkspace";
import type {ProductCatalogRecord} from "@/components/products/ProductType";

type TravisCatalogWorkspaceProps = {
  products: ProductCatalogRecord[];
  mode?: "managed" | "source_readonly";
  sourceCollectionName?: string;
  isLoading?: boolean;
  initialViewMode?: "product" | "sku";
};

export function TravisCatalogWorkspace({
  products,
  mode = "managed",
  sourceCollectionName = "",
  isLoading = false,
  initialViewMode = "sku",
}: TravisCatalogWorkspaceProps) {
  return (
    <ProductCatalogWorkspace
      products={products}
      title="Travis Mathew"
      description="Lifestyle apparel, layers, and accessories from the Travis Mathew assortment."
      badgeLabel="Travis Mathew Catalog"
      workspaceMode={mode}
      importHref="/admin/imports"
      importLabel="Open imports"
      newProductHref={mode === "source_readonly" ? null : "/admin/products/new"}
      sourceNotice={
        mode === "source_readonly"
          ? `This catalog is currently sourced from ${sourceCollectionName || "the raw Travis collection"}. Use Imports to normalize style, season, line, and stock updates before they affect the shared catalog behavior.`
          : ""
      }
      isLoading={isLoading}
      initialViewMode={initialViewMode}
    />
  );
}
