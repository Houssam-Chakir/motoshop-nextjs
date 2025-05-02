import mongoose, { Document, model, models, Schema } from "mongoose";

interface SizeQuantityType {
  size: string; // e.g., 'S', 'M', 'L', 'XL'
  quantity: number;
}

export interface StockType extends Document {
  product: mongoose.Types.ObjectId;
  sizes: SizeQuantityType[];
  createdAt: Date;
  updatedAt: Date;
}

const SizeQuantitySchema = new Schema<SizeQuantityType>(
  {
    size: {
      type: String,
      required: [true, "Please refrence the size (Ex: XS)"],
      trim: true,
      uppercase: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Please include the quantity of the referenced size'],
      min: 0,
    },
  },
  { _id: false }
);

const StockSchema = new Schema<StockType>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: [true, 'Product id is required for stock collection'],
      unique: true,
    },
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

const Stock = models.Stock || model<StockType>("Stock", StockSchema);
export default Stock;
