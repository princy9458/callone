import React from "react";
import {ProductCatalogWorkspace} from "@/components/admin/ProductCatalogWorkspace";
import type {ProductCatalogRecord} from "@/components/products/ProductType";

type HardgoodCatalogWorkspaceProps = {
  products: ProductCatalogRecord[];
  mode?: "managed" | "source_readonly";
  sourceCollectionName?: string;
  isLoading?: boolean;
  initialViewMode?: "product" | "sku";
};

export function HardgoodCatalogWorkspace({
  products,
  mode = "managed",
  sourceCollectionName = "",
  isLoading = false,
  initialViewMode = "sku",
}: HardgoodCatalogWorkspaceProps) {
  return (
    <ProductCatalogWorkspace
      products={products}
      title="Callaway Hardgoods"
      description="Clubs, balls, and equipment inventory from the Callaway hardgoods catalog."
      badgeLabel="Hardgoods Catalog"
      workspaceMode={mode}
      importHref="/admin/imports"
      importLabel="Open imports"
      newProductHref={mode === "source_readonly" ? null : "/admin/products/new"}
      sourceNotice={
        mode === "source_readonly"
          ? `This catalog is currently sourced from ${sourceCollectionName || "the raw hardgoods collection"}. Use Imports to adjust grouped products, warehouse mapping, and daily stock changes without editing rows in place.`
          : ""
      }
      isLoading={isLoading}
      initialViewMode={initialViewMode}
    />
  );
}
