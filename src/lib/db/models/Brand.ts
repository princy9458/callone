import mongoose, {Document, Schema} from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  code: string;
  description?: string;
  websiteUrl?: string;
  media: {
    logoPath?: string;
    thumbnailPath?: string;
    sliderPaths: string[];
  };
  isActive: boolean;
  legacyId?: number;
  createdAt: Date;
  updatedAt: Date;
}

const BrandSchema = new Schema<IBrand>(
  {
    name: {type: String, required: true, trim: true},
    slug: {type: String, required: true, unique: true, trim: true},
    code: {type: String, required: true, unique: true, trim: true},
    description: {type: String, default: ""},
    websiteUrl: {type: String, default: ""},
    media: {
      logoPath: {type: String, default: ""},
      thumbnailPath: {type: String, default: ""},
      sliderPaths: [{type: String}],
    },
    isActive: {type: Boolean, default: true},
    legacyId: {type: Number},
  },
  {timestamps: true}
);

export const Brand =
  mongoose.models.Brand || mongoose.model<IBrand>("Brand", BrandSchema);
