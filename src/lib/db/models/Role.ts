import mongoose, {Document, Schema} from "mongoose";

export interface IRole extends Document {
  key: string;
  name: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    key: {type: String, required: true, unique: true, trim: true},
    name: {type: String, required: true, trim: true},
    description: {type: String, default: ""},
    permissions: [{type: String}],
    isSystem: {type: Boolean, default: false},
    isActive: {type: Boolean, default: true},
  },
  {timestamps: true}
);

export const Role =
  mongoose.models.Role || mongoose.model<IRole>("Role", RoleSchema);
