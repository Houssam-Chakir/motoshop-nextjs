import { Types, model, models, Schema } from "mongoose";
import { DeliveryInformation, DeliveryInfoSchema } from "./User";

// Define the order item interface
export interface IOrderItem {
  productId: Types.ObjectId;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
}

// Define the payment method types
export type PaymentMethod = "credit_card" | "cash_on_delivery";

// Define the payment status types
export type PaymentStatus = "pending" | "processing" | "paid" | "failed" | "refunded";

// Define the delivery status types
export type DeliveryStatus = "processing" | "shipped" | "delivered" | "cancelled";

// Define the order interface
export interface IOrder {
  _id?: Types.ObjectId;
  trackingNumber: string;
  userId: Types.ObjectId;
  products: IOrderItem[];
  quantity: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderedAt: Date;
  deliveryInformation: DeliveryInformation;
  deliveryStatus: DeliveryStatus;
  estimatedDeliveryDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for creating a new order (client-side)
export interface ICreateOrderInput {
  trackingNumber: string;
  userId: string;
  products: Array<{
    productId: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  quantity: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  deliveryInformation: DeliveryInformation;
  notes?: string;
}

// Interface for order response (client-side)
export interface IOrderResponse extends Omit<IOrder, "userId" | "products"> {
  userId: string;
  products: Array<{
    productId: string;
    size: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    addedAt: string;
  }>;
}

const OrderSchema: Schema = new Schema(
  {
    trackingNumber: { type: String, required: true, index: true },
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
    deliveryPrice: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
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
export default Order;
