import mongoose, {Document, Schema} from "mongoose";

export interface IVariant extends Document {
  productId: mongoose.Types.ObjectId;
  sku: string;
  title: string;
  optionValues: Record<string, string>;
  mrp: number;
  gstRate: number;
  cost: number;
  imagePath?: string;
  status: "active" | "draft" | "archived";
  legacyWarehouseHint?: "WH88" | "WH90" | "";
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IVariant>(
  {
    productId: {type: Schema.Types.ObjectId, ref: "Product", required: true},
    sku: {type: String, required: true, unique: true, trim: true},
    title: {type: String, required: true},
    optionValues: {type: Map, of: String, default: {}},
    mrp: {type: Number, default: 0},
    gstRate: {type: Number, default: 18},
    cost: {type: Number, default: 0},
    imagePath: {type: String, default: ""},
    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "draft",
    },
    legacyWarehouseHint: {
      type: String,
      enum: ["WH88", "WH90", ""],
      default: "",
    },
  },
  {timestamps: true}
);

export const Variant =
  mongoose.models.Variant || mongoose.model<IVariant>("Variant", VariantSchema);
