import { Types, model, models, Schema, Document } from "mongoose";
import { DeliveryInformation, DeliveryInfoSchema } from "./User";

// Interface for each product in the order
interface OrderProduct {
  productId: Types.ObjectId;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
}

// Main Order interface extending Mongoose Document
export interface OrderDocument extends Document {
  trackingNumber: string;
  userId: Types.ObjectId;
  products: OrderProduct[];
  quantity: number;
  deliveryFee: number;
  orderTotalPrice: number;
  paymentMethod: "credit_card" | "cash_on_delivery";
  paymentStatus: "pending" | "processing" | "paid" | "failed" | "refunded";
  orderedAt: Date;
  deliveryInformation: DeliveryInformation;
  deliveryStatus: "processing" | "shipped" | "delivered" | "cancelled";
  estimatedDeliveryDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema: Schema = new Schema(
  {
    trackingNumber: { type: String, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
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
    deliveryFee: { type: Number, required: true, min: 0 },
    orderTotalPrice: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, required: true, enum: ["credit_card", "cash_on_delivery"] },
    paymentStatus: { type: String, required: true, enum: ["pending", "processing", "paid", "failed", "refunded"], default: "pending" },
    orderedAt: { type: Date, default: Date.now },
    deliveryInformation: DeliveryInfoSchema,
    deliveryStatus: { type: String, required: true, enum: ["processing", "shipped", "delivered", "cancelled"], default: "processing" },
    estimatedDeliveryDate: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

const Order = models.Order || model("Order", OrderSchema);
export type OrderType = Omit<OrderDocument, keyof Document>;
export default Order;
