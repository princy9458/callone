export interface BrandMedia {
  logoPath?: string;
  thumbnailPath?: string;
  sliderPaths?: string[];
}

export interface BrandType {
  _id?: string;
  code?: string;
  __v?: number;
  createdAt?: string;
  description?: string;
  isActive?: boolean;
  media?: BrandMedia;
  name?: string;
  slug?: string;
  collection?:string;
  updatedAt?: string;
  websiteUrl?: string;
}
