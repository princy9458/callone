import mongoose, {Document, Schema} from "mongoose";

export interface IProductOption {
  key: string;
  label: string;
  values: string[];
  useForVariants: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  baseSku: string;
  brandId: mongoose.Types.ObjectId;
  category: string;
  subcategory?: string;
  productType: "hardgoods" | "apparel" | "softgoods" | "accessory" | "custom";
  description?: string;
  status: "active" | "draft" | "archived";
  taxRate: number;
  listPrice: number;
  optionDefinitions: IProductOption[];
  media: {
    primaryImagePath?: string;
    galleryPaths: string[];
  };
  attributeSetId?: string;
  metadata: Record<string, string>;
  legacySource?: {
    table?: string;
    legacySku?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ProductOptionSchema = new Schema<IProductOption>(
  {
    key: {type: String, required: true},
    label: {type: String, required: true},
    values: [{type: String}],
    useForVariants: {type: Boolean, default: true},
  },
  {_id: false}
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, trim: true},
    baseSku: {type: String, required: true, unique: true, trim: true},
    brandId: {type: Schema.Types.ObjectId, ref: "Brand", required: true},
    category: {type: String, required: true, trim: true},
    subcategory: {type: String, default: ""},
    productType: {
      type: String,
      enum: ["hardgoods", "apparel", "softgoods", "accessory", "custom"],
      default: "apparel",
    },
    description: {type: String, default: ""},
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },
    taxRate: {type: Number, default: 18},
    listPrice: {type: Number, default: 0},
    optionDefinitions: [ProductOptionSchema],
    media: {
      primaryImagePath: {type: String, default: ""},
      galleryPaths: [{type: String}],
    },
    attributeSetId: {type: String},
    metadata: {type: Map, of: String, default: {}},
    legacySource: {
      table: {type: String, default: ""},
      legacySku: {type: String, default: ""},
    },
  },
  {timestamps: true}
);

export const Product =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
