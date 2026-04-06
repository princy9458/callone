import mongoose, {Document, Schema} from "mongoose";

export interface IUser extends Document {
  legacyId?: number;
  id?: number;
  name: string;
  email: string;
  passwordHash: string;
  new_hash_password?: string;
  password_hash?: string;
  roleId: mongoose.Types.ObjectId;
  roleKey: string;
  phone?: string;
  phone2?: string;
  code?: string;
  designation?: string;
  managerId?: mongoose.Types.ObjectId | null;
  manager_id?: number | null;
  gstin?: string;
  address?: string;
  secondaryEmail?: string;
  secondary_email?: string;
  assignedBrandIds: mongoose.Types.ObjectId[];
  assignedWarehouseIds: mongoose.Types.ObjectId[];
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  created_at?: string;
  updated_at?: string;
}

const UserSchema = new Schema<IUser>(
  {
    legacyId: {type: Number, unique: true, sparse: true},
    id: {type: Number, unique: true, sparse: true},
    name: {type: String, required: true, trim: true},
    email: {type: String, required: true, unique: true, lowercase: true, trim: true},
    passwordHash: {type: String, required: true},
    new_hash_password: {type: String},
    password_hash: {type: String},
    roleId: {type: Schema.Types.ObjectId, ref: "Role", required: true},
    roleKey: {type: String, required: true, index: true},
    phone: {type: String, default: ""},
    phone2: {type: String, default: ""},
    code: {type: String, default: ""},
    designation: {type: String, default: ""},
    managerId: {type: Schema.Types.ObjectId, ref: "User", default: null},
    manager_id: {type: Number, default: null},
    gstin: {type: String, default: ""},
    address: {type: String, default: ""},
    secondaryEmail: {type: String, default: ""},
    secondary_email: {type: String, default: ""},
    assignedBrandIds: [{type: Schema.Types.ObjectId, ref: "Brand"}],
    assignedWarehouseIds: [{type: Schema.Types.ObjectId, ref: "Warehouse"}],
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    created_at: {type: String},
    updated_at: {type: String},
  },
  {timestamps: true}
);

export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
