import mongoose, { Document, model, models, Schema } from "mongoose";
import slug from "mongoose-slug-updater";
import { nanoid } from "nanoid";

mongoose.plugin(slug);

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
export interface ProductDocument extends Document {
  barcode: string;
  sku: string;
  title: string;
  slug: string;
  productModel: string;
  brand: mongoose.Types.ObjectId;
  description: string;
  wholesalePrice: number;
  retailPrice: number;
  saleInfo?: mongoose.Types.ObjectId;
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
    barcode: { type: String, required: true, unique: true, default: () => nanoid(12), index: true },
    sku: { type: String, trim: true, required: [true, "Please provide a sku"], index: true },
    title: { type: String, required: [true, "Please provide a title"], trim: true, index: true },
    slug: { type: String, slug: "title", required: true, unique: true, index: true },
    productModel: { type: String, required: [true, "Please provide a model"], trim: true, index: true },
    brand: { type: Schema.Types.ObjectId, required: [true, "Please provide a brand"], index: true },
    description: { type: String, required: [true, "Please provide a description"], trim: true },
    wholesalePrice: { type: Number, required: [true, "Please provide a price"], min: [0, "Price cannot be negative"] },
    retailPrice: { type: Number, required: [true, "Please provide a price"], min: [0, "Price cannot be negative"] },
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
export type ProductType = Omit<ProductDocument, keyof Document>;
export default Product;

// --- Helper function to generate attribute codes ---
function getAttributeCode(attributeValue: string, length = 3) {
  if (!attributeValue || typeof attributeValue !== "string") {
    throw new Error("error creating attributes code");
  }
  return attributeValue
    .substring(0, length)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ""); // Sanitize
}


//f/ -- MIDDLEWARE --
ProductSchema.pre("save", function (next) {
  // Generate SKU only if it's a new document and SKU is not already set (allows manual override)
  if (this.isNew && !this.isSet("sku")) {
    const parts: string[] = [];

    // 1. Brand Code
    parts.push(getAttributeCode(this.brand as string, 3));

    // 2. Category Code
    parts.push(getAttributeCode(this.category as string, 3));

    // 3. Product Type Code
    parts.push(getAttributeCode(this.productType as string, 3));

    // 4. Model Code
    parts.push(getAttributeCode(this.productModel as string, 3));

    if (this.size) {
      parts.push(getAttributeCode(this.size as string, 2));
    }

    // 5. Unique Suffix (e.g., 4-character nanoid)
    // This ensures uniqueness even if all attribute-based parts are identical for two distinct items
    parts.push(nanoid(4).toUpperCase());

    this.sku = parts.join("-"); // e.g., "NIK-APP-TSH-BLU-LG-A1B2"
  }

  next();
});
