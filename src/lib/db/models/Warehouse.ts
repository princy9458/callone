import mongoose, {Document, Schema} from "mongoose";

export interface IWarehouse extends Document {
  code: string;
  name: string;
  location?: string;
  priority: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    code: {type: String, required: true, unique: true, trim: true},
    name: {type: String, required: true, trim: true},
    location: {type: String, default: ""},
    priority: {type: Number, default: 100},
    isDefault: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
  },
  {timestamps: true}
);

export const Warehouse =
  mongoose.models.Warehouse ||
  mongoose.model<IWarehouse>("Warehouse", WarehouseSchema);
