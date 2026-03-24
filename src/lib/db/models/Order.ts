import mongoose, {Document, Schema} from "mongoose";

export type OrderWorkflowStatus =
  | "draft"
  | "submitted"
  | "availability_check"
  | "manager_approval"
  | "approved"
  | "completed"
  | "rejected"
  | "cancelled";

const participantSnapshotSchema = new Schema(
  {
    legacyId: {type: Number},
    name: {type: String, default: ""},
    email: {type: String, default: ""},
    phone: {type: String, default: ""},
    role: {type: String, default: ""},
    code: {type: String, default: ""},
    gstin: {type: String, default: ""},
    address: {type: String, default: ""},
  },
  {_id: false}
);

const orderItemSchema = new Schema(
  {
    variantId: {type: Schema.Types.ObjectId, ref: "Variant", default: null},
    sku: {type: String, required: true},
    name: {type: String, required: true},
    brandId: {type: Schema.Types.ObjectId, ref: "Brand", default: null},
    brandName: {type: String, default: ""},
    warehouseId: {type: Schema.Types.ObjectId, ref: "Warehouse", default: null},
    warehouseCode: {type: String, default: ""},
    quantity: {type: Number, required: true, min: 1},
    mrp: {type: Number, required: true, default: 0},
    gstRate: {type: Number, default: 18},
    lineDiscountValue: {type: Number, default: 0},
    lineDiscountAmount: {type: Number, default: 0},
    grossAmount: {type: Number, default: 0},
    taxableAmount: {type: Number, default: 0},
    taxAmount: {type: Number, default: 0},
    finalAmount: {type: Number, default: 0},
  },
  {_id: false}
);

const orderNoteSchema = new Schema(
  {
    message: {type: String, required: true},
    name: {type: String, default: ""},
    userId: {type: Schema.Types.ObjectId, ref: "User", default: null},
    access: {type: String, default: "all"},
    type: {type: String, enum: ["system", "user"], default: "system"},
    createdAt: {type: Date, default: Date.now},
  },
  {_id: false}
);

const attachmentSchema = new Schema(
  {
    kind: {type: String, enum: ["pdf", "excel", "image"], required: true},
    originalName: {type: String, required: true},
    filePath: {type: String, required: true},
  },
  {_id: false}
);

export interface IOrder extends Document {
  orderNumber: string;
  legacyOrderId?: number;
  createdById?: mongoose.Types.ObjectId | null;
  retailerId?: mongoose.Types.ObjectId | null;
  managerId?: mongoose.Types.ObjectId | null;
  salesRepId?: mongoose.Types.ObjectId | null;
  brandId?: mongoose.Types.ObjectId | null;
  workflowStatus: OrderWorkflowStatus;
  sourceStatus?: string;
  participantSnapshots: {
    retailer?: Record<string, unknown>;
    manager?: Record<string, unknown>;
    salesRep?: Record<string, unknown>;
  };
  items: Array<Record<string, unknown>>;
  pricing: {
    discountType: "inclusive" | "exclusive" | "flat" | "none";
    discountValue: number;
    discountAmount: number;
    subtotal: number;
    taxableAmount: number;
    taxAmount: number;
    finalTotal: number;
  };
  notesTimeline: Array<Record<string, unknown>>;
  attachments: Array<Record<string, unknown>>;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {type: String, required: true, unique: true},
    legacyOrderId: {type: Number},
    createdById: {type: Schema.Types.ObjectId, ref: "User", default: null},
    retailerId: {type: Schema.Types.ObjectId, ref: "User", default: null},
    managerId: {type: Schema.Types.ObjectId, ref: "User", default: null},
    salesRepId: {type: Schema.Types.ObjectId, ref: "User", default: null},
    brandId: {type: Schema.Types.ObjectId, ref: "Brand", default: null},
    workflowStatus: {
      type: String,
      enum: [
        "draft",
        "submitted",
        "availability_check",
        "manager_approval",
        "approved",
        "completed",
        "rejected",
        "cancelled",
      ],
      default: "draft",
    },
    sourceStatus: {type: String, default: ""},
    participantSnapshots: {
      retailer: participantSnapshotSchema,
      manager: participantSnapshotSchema,
      salesRep: participantSnapshotSchema,
    },
    items: [orderItemSchema],
    pricing: {
      discountType: {
        type: String,
        enum: ["inclusive", "exclusive", "flat", "none"],
        default: "none",
      },
      discountValue: {type: Number, default: 0},
      discountAmount: {type: Number, default: 0},
      subtotal: {type: Number, default: 0},
      taxableAmount: {type: Number, default: 0},
      taxAmount: {type: Number, default: 0},
      finalTotal: {type: Number, default: 0},
    },
    notesTimeline: [orderNoteSchema],
    attachments: [attachmentSchema],
  },
  {timestamps: true}
);

OrderSchema.pre("validate", function setOrderNumber() {
  if (!this.orderNumber) {
    this.orderNumber = `CO-${Date.now().toString().slice(-8)}`;
  }
});

export const Order =
  mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
