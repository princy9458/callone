import mongoose, {Document, Schema} from "mongoose";

export interface IInventoryMovement extends Document {
  variantId: mongoose.Types.ObjectId;
  warehouseId: mongoose.Types.ObjectId;
  type:
    | "import"
    | "adjustment"
    | "reservation"
    | "release"
    | "shipment"
    | "transfer";
  delta: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryMovementSchema = new Schema<IInventoryMovement>(
  {
    variantId: {type: Schema.Types.ObjectId, ref: "Variant", required: true},
    warehouseId: {type: Schema.Types.ObjectId, ref: "Warehouse", required: true},
    type: {
      type: String,
      enum: ["import", "adjustment", "reservation", "release", "shipment", "transfer"],
      required: true,
    },
    delta: {type: Number, required: true},
    reason: {type: String, default: ""},
    referenceType: {type: String, default: ""},
    referenceId: {type: String, default: ""},
    notes: {type: String, default: ""},
  },
  {timestamps: true}
);

export const InventoryMovement =
  mongoose.models.InventoryMovement ||
  mongoose.model<IInventoryMovement>("InventoryMovement", InventoryMovementSchema);
