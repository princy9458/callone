
export interface TravisMathewType {
  _id?:string,
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