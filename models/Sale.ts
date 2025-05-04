import mongoose, { Document, model, models, Schema } from "mongoose";

export interface SaleDocument extends Document {
  name: string
  color: string
  banner: string
  description: string
  discountType: string
  discountValue: number
  startDate: Date
  endDate: Date
  isActive: boolean
  applicableProducts: mongoose.Types.ObjectId[]
  applicableCategories: mongoose.Types.ObjectId[]
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Sale Schema
 * Centralized sales management with references to applicable products
 */
const SaleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    banner: { type: {url: String, altText: String} , required: true },
    description: { type: String, trim: true },
    discountType: { type: String, required: true, enum: ["percentage", "fixed_amount"], default: "percentage" },
    discountValue: { type: Number, required: true, min: [0, "Discount cannot be negative"] },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    // Products this sale applies to (empty array means all products)
    applicableProducts: { type: [{ type: Schema.Types.ObjectId, ref: "Product" }], default: [] },
    // Categories this sale applies to (empty array means all categories)
    applicableCategories: { type: [{ type: Schema.Types.ObjectId, ref: "Category" }], default: [] },
  },
  { timestamps: true }
);

const Sale = models.Sale || model("Sale", SaleSchema);
export type SaleType = Omit<SaleDocument, keyof Document>
export default Sale;
