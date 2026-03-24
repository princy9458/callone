import mongoose, {Document, Schema} from "mongoose";

export interface IBlockedStock extends Document {
  sku: string;
  variantId?: mongoose.Types.ObjectId | null;
  warehouseId?: mongoose.Types.ObjectId | null;
  brand?: string;
  category?: string;
  blockedUnder?: string;
  description?: string;
  quantity: number;
  source: "legacy" | "manual";
  createdAt: Date;
  updatedAt: Date;
}

const BlockedStockSchema = new Schema<IBlockedStock>(
  {
    sku: {type: String, required: true, index: true},
    variantId: {type: Schema.Types.ObjectId, ref: "Variant", default: null},
    warehouseId: {type: Schema.Types.ObjectId, ref: "Warehouse", default: null},
    brand: {type: String, default: ""},
    category: {type: String, default: ""},
    blockedUnder: {type: String, default: ""},
    description: {type: String, default: ""},
    quantity: {type: Number, required: true, default: 0},
    source: {type: String, enum: ["legacy", "manual"], default: "manual"},
  },
  {timestamps: true}
);

export const BlockedStock =
  mongoose.models.BlockedStock ||
  mongoose.model<IBlockedStock>("BlockedStock", BlockedStockSchema);
