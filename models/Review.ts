import mongoose, { Document, model, models, Schema } from "mongoose";

export interface Review extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  body?: string;
  rating: number;
}

const ReviewSchema: Schema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, trim: true },
    rating: { type: Number, min: 1, max: 5, required: [true, "Please rate this product from 1 to 5 stars"] },
  },

  { timestamps: true }
);

const Review = models.Review || model("Review", ReviewSchema);

export default Review;
