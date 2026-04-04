export type ProductAttributeGroup = {
  key: string;
  label: string;
  values: string[];
};

export type ProductVariantPreview = {
  id: string;
  sku: string;
  title: string;
  optionValues: Record<string, string>;
  availableStock: number;
};

export type ProductCatalogRecord = {
  id: string;
  name: string;
  slug: string;
  baseSku: string;
  sku?:string
  brand: {
    id: string;
    name: string;
    code: string;
  };
  category: string;
  subcategory: string;
  productType: string;
  status: string;
  availableStock: number;
  variantCount: number;
  variantSkus: string[];
  variantTitles: string[];
  variants: ProductVariantPreview[];
  attributeGroups: ProductAttributeGroup[];
  updatedAt: string;
  primary_url?: string;
};

export type ProductCatalogWorkspaceProps = {
  products: ProductCatalogRecord[];
  title?: string;
  description?: string;
  badgeLabel?: string;
  workspaceMode?: "managed" | "source_readonly";
  importHref?: string;
  importLabel?: string;
  newProductHref?: string | null;
  newProductLabel?: string;
  sourceNotice?: string;
};

export interface ProductExcelData {

  attributeSetId?: string; 
  brandId?: string;      
  sku?: string;
  description?: string;
  category?: string;
  season?: string;
  style_code?: string; 
  color?: string;
  color_code?: string;
  size?: string;
  size_type?: string;
  length?: string;
  gender?: string;
  line?: string;
  variation_sku?: string; // Often an array if comma-separated, but mapped as a string from Excel
  primary_image_url?: string;
  gallery_images_url?: string; // Can also be string[] depending on how you parse it later
  stock_90?: string | number;
  stock_88?: string | number;
  gst?: string | number;
  mrp?: string | number;
  family?: string;
  createdAt?: string;
  metaData?: {
    section: string;
  };

}
