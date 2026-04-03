import mongoose, { Document, Schema } from "mongoose";

export interface ISheetDataset extends Document {
  name: string;
  slug: string;
  type: "brand_calibration" | "generic";
  sourceFileName: string;
  description?: string;
  columns: string[];
  rowCount: number;
  uniqueValues?: Record<string, string[]>;
  summary: {
    matched: number;
    partial: number;
    unmatched: number;
    issueCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SheetDatasetSchema = new Schema<ISheetDataset>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    type: {
      type: String,
      enum: ["brand_calibration", "generic"],
      default: "brand_calibration",
    },
    sourceFileName: { type: String, default: "" },
    description: { type: String, default: "" },
    columns: [{ type: String }],
    rowCount: { type: Number, default: 0 },
    uniqueValues: { type: Map, of: [String], default: {} },
    summary: {
      matched: { type: Number, default: 0 },
      partial: { type: Number, default: 0 },
      unmatched: { type: Number, default: 0 },
      issueCount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const SheetDataset =
  mongoose.models.SheetDataset ||
  mongoose.model<ISheetDataset>("SheetDataset", SheetDatasetSchema);
