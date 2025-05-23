import mongoose, { Document, model, models, Schema } from "mongoose";
import slug from "mongoose-slug-updater";

mongoose.plugin(slug);

export interface TypeDocument extends Document {
  name: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type Schema
const TypeSchema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  // Reference to parent Type
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
});

const Type = models.Type || model("Type", TypeSchema);
export type TypeType = Omit<TypeDocument, keyof Document>;

export default Type;
