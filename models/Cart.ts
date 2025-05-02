import mongoose, { Document, model, models, Schema } from "mongoose";

interface ProductsType {
  productId: mongoose.Types.ObjectId;
  size: string;
  quantity: number;
}

export interface CartType extends Document {
  userId: mongoose.Types.ObjectId;
  products: ProductsType[];
  quantity: number;
}

const CartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    products: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
          size: { type: String, required: true, trim: true, uppercase: true },
          quantity: { type: Number, default: 1, min: [1, "Quantity cannot be less than 1"], required: true },
          totalPrice: { type: Number, default: 1, min: [1, "Quantity cannot be less than 1"], required: true },
          addedAt: { type: Date, default: Date.now, required: true },
        },
      ],
    },
    quantity: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },

  { timestamps: true }
);

CartSchema.index({ userId: 1 });

const Cart = models.Cart || model("Cart", CartSchema);

export default Cart;
