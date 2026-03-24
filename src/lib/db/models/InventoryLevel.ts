import mongoose, {Document, Schema} from "mongoose";

export interface IInventoryLevel extends Document {
  variantId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  onHand: number;
  reserved: number;
  blocked: number;
  available: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryLevelSchema = new Schema<IInventoryLevel>(
  {
    variantId: {type: Schema.Types.ObjectId, ref: "Variant", required: true},
    warehouseId: {type: Schema.Types.ObjectId, ref: "Warehouse", required: true},
    onHand: {type: Number, default: 0},
    reserved: {type: Number, default: 0},
    blocked: {type: Number, default: 0},
    available: {type: Number, default: 0},
  },
  {timestamps: true}
);

InventoryLevelSchema.index({variantId: 1, warehouseId: 1}, {unique: true});

InventoryLevelSchema.pre("save", function updateAvailable() {
  this.available = Math.max(0, this.onHand - this.reserved - this.blocked);
});

export const InventoryLevel =
  mongoose.models.InventoryLevel ||
  mongoose.model<IInventoryLevel>("InventoryLevel", InventoryLevelSchema);
