export interface OgioType {
  _id?: string;
  sku?: string;
  attributeSetId?: string;
  brandId?: string;
  description?: string;
  product_type?: string;
  category?: string;
  product_model?: string;
  stock_90?: string | number;
  gst?: string | number;
  mrp?: string | number;
  primary_image_url?: string;
  gallery_images_url?: string; // string of comma-separated URLs
  variation_sku?: string; // string of comma-separated SKUs
  createdAt?: string;
  metaData?: {
    section: string;
  };
}
