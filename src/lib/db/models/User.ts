import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document {
  legacyId?: number;
  name: string;
  email: string;
  passwordHash: string;
  roleId: mongoose.Types.ObjectId;
  roleKey: string;
  phone?: string;
  phone2?: string;
  code?: string;
  designation?: string;
  managerId?: mongoose.Types.ObjectId | null;
  gstin?: string;
  address?: string;
  secondaryEmail?: string;
  assignedBrandIds: mongoose.Types.ObjectId[];
  assignedWarehouseIds: mongoose.Types.ObjectId[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    legacyId: {type: Number, unique: true, sparse: true},
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    passwordHash: {type: String, required: true},
    roleId: {type: Schema.Types.ObjectId, ref: "Role", required: true},
    roleKey: {type: String, required: true, index: true},
    phone: {type: String, default: ""},
    phone2: {type: String, default: ""},
    code: {type: String, default: ""},
    designation: {type: String, default: ""},
    managerId: {type: Schema.Types.ObjectId, ref: "User", default: null},
    gstin: {type: String, default: ""},
    address: {type: String, default: ""},
    secondaryEmail: {type: String, default: ""},
    assignedBrandIds: [{type: Schema.Types.ObjectId, ref: "Brand"}],
    assignedWarehouseIds: [{type: Schema.Types.ObjectId, ref: "Warehouse"}],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {timestamps: true}
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
