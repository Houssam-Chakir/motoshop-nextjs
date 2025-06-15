import mongoose, { Document, model, models, Schema } from "mongoose";
import slug from "mongoose-slug-updater";
import { nanoid } from "nanoid";
import mongooseLeanVirtuals from "mongoose-lean-virtuals";

mongoose.plugin(slug);

// Define interfaces first, within the same file
interface ProductSpec {
  name: string;
  description: string;
}

interface ProductReview {
  user: mongoose.Types.ObjectId;
  body: string;
  rating: number;
  createdAt: Date;
}

// Main Product interface that extends Document
export interface ProductDocument extends Document {
  barcode: string;
  sku: string;
  title: string;
  identifiers: { brand: string; categoryType: string; category: string };
  slug?: string;
  productModel: string;
  brand: mongoose.Types.ObjectId;
  description: string;
  wholesalePrice: number;
  retailPrice: number;
  salePrice?: number;
  saleInfo?: mongoose.Types.ObjectId;
  season: "All seasons" | "Summer" | "Winter" | "Spring/Fall";
  style: "None" | "Versitile" | "Racing" | "Adventure" | "Enduro" | "Urban" | "Touring";

  category: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  stock?: mongoose.Types.ObjectId;
  inStock: boolean;

  specifications: ProductSpec[];
  reviews: ProductReview[];
  images: { secure_url: string; public_id: string }[];

  likes: number;

  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema: Schema = new Schema(
  {
    barcode: { type: String, required: true, unique: true, default: () => nanoid(12), index: true },
    sku: { type: String, trim: true, required: [true, "Please provide a sku"], index: true },
    title: { type: String, required: [true, "Please provide a title"], trim: true, index: true },
    identifiers: {
      type: {
        brand: String,
        categoryType: String,
        category: String,
      },
    },
    slug: { type: String, slug: "title", unique: true, index: true },
    productModel: { type: String, required: [true, "Please provide a model"], trim: true, index: true },
    brand: { type: Schema.Types.ObjectId, ref: "Brand", required: [true, "Please provide a brand"], index: true },
    description: { type: String, required: [true, "Please provide a description"], trim: true },
    wholesalePrice: { type: Number, required: [true, "Please provide a price"], min: [0, "Price cannot be negative"] },
    retailPrice: { type: Number, required: [true, "Please provide a price"], min: [0, "Price cannot be negative"] },
    saleInfo: { type: Schema.Types.ObjectId, ref: "Sale", index: true, default: null },
    season: { type: String, enum: ["All seasons", "Summer", "Winter", "Spring/Fall"], default: "All seasons" },
    style: { type: String, enum: ["None", "Versitile", "Racing", "Adventure", "Enduro", "Urban", "Touring"], default: "None" },
    images: {
      type: [{ secure_url: String, public_id: String }],
      required: true,
    },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: [true, "Please choose a category"], index: true },
    type: { type: Schema.Types.ObjectId, ref: "Type", required: [true, "Please choose a type"], index: true },

    stock: { type: mongoose.Types.ObjectId, unique: true },
    inStock: { type: Boolean, default: true },
    specifications: [
      {
        name: { type: String, required: [true, "Please provide a name for the spec"] },
        description: { type: String, required: [true, "Please provide information about the spec"] },
      },
    ],

    reviews: [{ type: mongoose.Types.ObjectId }],
    likes: { type: Number, default: 0, min: 0 },
  },

  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProductSchema.plugin(mongooseLeanVirtuals);
// --- Virtuals ---
ProductSchema.virtual("sale", {
  ref: "Sale",
  localField: "saleInfo",
  foreignField: "_id",
  justOne: true,
  match: { isActive: true, startDate: { $lte: new Date() }, endDate: { $gte: new Date() } },
});

ProductSchema.virtual("salePrice").get(function (this: ProductDocument) {
  if (!this.saleInfo) return undefined;

  // determine discount based on discountType
  const { discountType, discountValue } = this.saleInfo as any;
  let price = this.retailPrice;

  if (discountType === "percentage") {
    price = price * (1 - discountValue / 100);
  } else if (discountType === "fixed_amount") {
    price = price - discountValue;
  }

  return Math.max(price, 0); // avoid negative
});

// --- Helper function to generate attribute codes (define before use) ---
function getAttributeCode(attributeValue: string | undefined | null, length = 3): string {
  // More robust check for attributeValue
  if (typeof attributeValue !== "string" || attributeValue.trim() === "") {
    // console.warn(`SKU Part Gen: Attribute value is not a non-empty string. Received: '${attributeValue}'. Using 'XXX'.`);
    return "XXX"; // Return a placeholder for invalid/missing essential parts
  }
  return attributeValue
    .substring(0, length)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, ""); // Sanitize
}

// -- MIDDLEWARE (HOOK) --
ProductSchema.pre("validate", function (this: ProductDocument, next) {
  console.log("PRE-VALIDATE HOOK: Triggered.");
  // console.log('Is "this" a Mongoose Document instance?', this instanceof mongoose.Document); // Should be true
  // console.log('Type of this.isNew:', typeof this.isNew, '; Value:', this.isNew);
  // console.log('Current SKU value before check:', this.sku);

  // Modified condition: Check if it's a new document AND if `sku` is not already truthy (i.e., not set or empty)

  console.log("this: ", this);
  if (this.isNew && !this.sku) {
    // Using !this.sku as an alternative to !this.isSet("sku")
    console.log("PRE-VALIDATE HOOK: Conditions met for SKU generation (isNew=true, SKU is falsy).");
    try {
      const parts: string[] = [];

      if (this.identifiers && typeof this.identifiers.brand === "string") {
        parts.push(getAttributeCode(this.identifiers.brand, 3));
      } else {
        console.warn("SKU Gen: Brand name for SKU is missing or invalid. Using XXX.");
        parts.push("XXX");
      }

      if (this.identifiers && typeof this.identifiers.category === "string") {
        parts.push(getAttributeCode(this.identifiers.category, 3));
      } else {
        console.warn("SKU Gen: Category name for SKU is missing or invalid. Using XXX.");
        parts.push("XXX");
      }

      if (this.identifiers && typeof this.identifiers.categoryType === "string") {
        parts.push(getAttributeCode(this.identifiers.categoryType, 3));
      } else {
        console.warn("SKU Gen: Type name for SKU is missing or invalid. Using XXX.");
        parts.push("XXX");
      }

      if (typeof this.productModel === "string" && this.productModel) {
        parts.push(getAttributeCode(this.productModel, 3));
      } else {
        console.warn("SKU Gen: Product model for SKU is missing or invalid. Using XXX.");
        parts.push("XXX");
      }

      if (typeof this.style === "string" && this.style) {
        parts.push(getAttributeCode(this.style, 3));
      } else {
        console.warn("SKU Gen: Product style for SKU is missing or invalid. Using XXX.");
        parts.push("XXX");
      }

      parts.push(nanoid(4).toUpperCase()); // Unique suffix

      this.sku = parts.join("-");
      console.log("PRE-VALIDATE HOOK: Generated SKU:", this.sku);
    } catch (error) {
      console.error("PRE-VALIDATE HOOK: Error during SKU parts assembly:", error);
    }
  } else if (this.isNew && this.sku) {
    console.log("PRE-VALIDATE HOOK: SKU was already provided for new document:", this.sku);
  } else if (!this.isNew) {
    console.log("PRE-VALIDATE HOOK: Document is not new. SKU generation skipped. Current SKU:", this.sku);
  } else {
    console.warn("PRE-VALIDATE HOOK: SKU generation conditions not met (isNew=false or SKU already set).");
  }
  next();
});

ProductSchema.index({ brand: 1, category: 1 });
ProductSchema.index({ title: "text", description: "text" });

const Product = models.Product || model("Product", ProductSchema);

// Export a type without the Document methods for use in functions
export type ProductType = Omit<ProductDocument, keyof Document> & {
  _id: string;
  brand?: { _id: string; name: string };
  category?: { _id: string; name: string };
  stock?: {
    _id: string;
    sizes: string[];
  };
};
export default Product;
