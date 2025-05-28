import mongoose, { Document, model, models, Schema } from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);

export interface CategoryDocument extends Document {
  name: string;
  slug: string;
  section: string;
  icon: { secure_url: string; public_id: string };
  applicableTypes: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Category Schema
const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, slug: "name", required: true, unique: true },
  section: {type: String, required: true },
  icon: {
    type: { secure_url: String, public_id: String },
    required: true,
  },
  // Reference to applicable types (optional but helpful)
  applicableTypes: [{ type: Schema.Types.ObjectId, ref: "Type" }],
});

const Category = models.Category || model("Category", CategorySchema);
export type CategoryType = Omit<CategoryDocument, keyof Document>;

export default Category;
