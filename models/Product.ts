import mongoose, { Document, model, models, Schema } from "mongoose";

// Define interfaces first, within the same file
interface ProductSpec {
  title: string;
  body: string;
}

interface ProductReview {
  user: mongoose.Types.ObjectId;
  body: string;
  rating: number;
  createdAt: Date;
}

interface ProductImage {
  url: string;
  altText: string;
}

// Main Product interface that extends Document
export interface IProduct extends Document {
  barcode: string;
  sku: string;
  title: string;
  productModel: string;
  brand: string;
  description: string;
  price: number;
  saleInfo: mongoose.Types.ObjectId;
  season: "All seasons" | "Summer" | "Winter" | "Spring/Fall";

  category: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  stock: mongoose.Types.ObjectId;

  specs: ProductSpec[];
  reviews: ProductReview[];
  images: ProductImage[];

  likes: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema: Schema = new Schema(
  {
    barcode: { type: String, unique: true, required: [true, "Please provide a barcode"], trim: true, index: true },
    sku: { type: String, trim: true, required: [true, "Please provide a sku"], index: true },
    title: { type: String, required: [true, "Please provide a title"], trim: true, index: true },
    productModel: { type: String, required: [true, "Please provide a model"], trim: true, index: true },
    brand: { type: String, required: [true, "Please provide a brand"], trim: true, index: true },
    description: { type: String, required: [true, "Please provide a description"], trim: true },
    price: { type: Number, required: [true, "Please provide a price"], min: [0, "Price cannot be negative"] },
    saleInfo: { type: Schema.Types.ObjectId, ref: "Sale", index: true },
    season: { type: String, enum: ["All seasons", "Summer", "Winter", "Spring/Fall"], default: "All seasons" },
    images: {
      type: [{ url: String, altText: String }],
      validate: [(val: ProductImage[]) => val.length > 0, "Please provide at least 1 image"],
      required: true,
    },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: [true, "Please choose a category"], index: true },
    type: { type: Schema.Types.ObjectId, ref: "Type", required: [true, "Please choose a type"], index: true },

    stock: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    specs: [
      {
        title: { type: String, required: [true, "Please provide a name for the spec"] },
        body: { type: String, required: [true, "Please provide information about the spec"] },
      },
    ],
    reviews: [{ type: mongoose.Types.ObjectId }],
    likes: { type: Number, default: 0, min: 0 },
  },

  { timestamps: true }
);

ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ title: "text", description: "text" });

const Product = models.Product || model("Product", ProductSchema);

// Export a type without the Document methods for use in functions
export type ProductType = Omit<IProduct, keyof Document>;
export default Product;
