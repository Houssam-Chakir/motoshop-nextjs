import mongoose, { Document, model, models, Schema } from "mongoose";


export interface SizeQuantityType {
  size: string; // e.g., 'S', 'M', 'L', 'XL'
  quantity: number;
}

export interface StockDocument extends Document {
  productId: mongoose.Types.ObjectId;
  sizes: SizeQuantityType[];
  createdAt?: Date;
  updatedAt?: Date;
}

const SizeQuantitySchema = new Schema<SizeQuantityType>(
  {
    size: { type: String, required: [true, "Please refrence the size (Ex: XS)"], trim: true, uppercase: true },
    quantity: { type: Number, required: [true, "Please include the quantity of the referenced size"], min: 0 },
  },
  { _id: false }
);

const StockSchema = new Schema<StockDocument>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: [true, "Product id is required for stock collection"], unique: true, index: true },
    sizes: {
      type: [SizeQuantitySchema],
      validate: {
        validator: function (v: SizeQuantityType[]) {
          return v.length > 0;
        },
        message: "At least one size must be specified.",
      },
    },
  },
  { timestamps: { updatedAt: true, createdAt: false } }
);

const Stock = models.Stock || model<StockDocument>("Stock", StockSchema);
// Refined StockType for serialized data
export type StockType = Omit<StockDocument, keyof Document | 'productId' | 'createdAt' | 'updatedAt'> & {
  _id: string;
  productId: string; // ObjectId is serialized to string
  sizes: SizeQuantityType[]; // This structure is fine, assuming SizeQuantityType is defined above
  createdAt?: string; // Date is often serialized to string
  updatedAt?: string; // Date is often serialized to string
};

export default Stock;
