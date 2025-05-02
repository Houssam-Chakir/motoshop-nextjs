import mongoose, { Document, model, models, Schema } from "mongoose";

interface ProductCartItem {
  productId: mongoose.Types.ObjectId;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
}

export interface CartType extends Document {
  userId: mongoose.Types.ObjectId;
  products: ProductCartItem[];
  quantity: number;
  totalAmount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const CartSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    // product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    products: {
      type: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
          size: { type: String, required: true, trim: true, uppercase: true },
          quantity: { type: Number, default: 1, min: [1, "Quantity cannot be less than 1"], required: true },
          unitPrice: { type: Number, default: 0, min: [0, "Make sure total price is calculated"], required: true },
          totalPrice: { type: Number, default: 0, min: [0, "Make sure total price is calculated"], required: true },
          addedAt: { type: Date, default: Date.now, required: true },
        },
      ],
    },
    quantity: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
  },

  { timestamps: true }
);

const Cart = models.Cart || model("Cart", CartSchema);

export default Cart;
