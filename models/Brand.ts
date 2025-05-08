// models/Brand.ts
import mongoose, { Document, Schema } from "mongoose";

// Brand interface
export interface BrandDocument extends Document {
  name: string;
  logo?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Brand schema
const BrandSchema = new Schema<BrandDocument>(
  {
    name: { type: String, required: [true, "Brand name is required"], trim: true },
    logo: { type: String },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

// Create and export the Brand model
const Brand = mongoose.models.Brand || mongoose.model<BrandDocument>("Brand", BrandSchema);

// Export a type without the Document methods for use in functions
export type BrandType = Omit<BrandDocument, keyof Document>;
export default Brand;
