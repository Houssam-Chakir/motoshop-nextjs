import mongoose, { Document, model, models, Schema } from "mongoose";
import slug from 'mongoose-slug-updater';

mongoose.plugin(slug);

export interface CategoryDocument extends Document {
  name: string
  slug: string
  icon: string;
  applicableTypes: mongoose.Types.ObjectId[]
  createdAt?: Date;
  updatedAt?: Date;
}

// Category Schema
const CategorySchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, slug: 'name', required: true, unique: true },
  icon: { type: String, required: true, unique: true },
  // Reference to applicable types (optional but helpful)
  applicableTypes: [{ type: Schema.Types.ObjectId, ref: 'Type' }]
});

const Category = models.Category || model("Category", CategorySchema);
export type CategoryType = Omit<CategoryDocument, keyof Document>;


export default Category;
