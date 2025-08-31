import { Types } from "mongoose";

// Type for ProductId that can be either a string or an object with product details
export interface PopulatedProduct {
  _id: Types.ObjectId | string;
  name: string;
  images: string[];
  slug: string;
  [key: string]: any;
}

// Interface for each product in the order
export interface OrderProduct {
  productId: string | PopulatedProduct;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: Date;
}

// Main Order type
export interface OrderType {
  _id: Types.ObjectId | string;
  trackingNumber: string;
  userId: Types.ObjectId | string;
  products: OrderProduct[];
  quantity: number;
  deliveryFee: number;
  orderTotalPrice: number;
  paymentMethod: "cmi" | "delivery" | "pickup";
  paymentStatus: "pending" | "processing" | "paid" | "failed" | "refunded";
  orderedAt: Date;
  deliveryInformation: {
    fullName: string;
    phoneNumber: string;
    email: string;
    city: string;
    address: string;
    zipcode: number;
    extraDirections?: string;
  };
  deliveryStatus: "processing" | "awaiting pickup" | "packaged" | "shipped" | "in city" | "in delivery" | "delivered" | "cancelled";
  estimatedDeliveryDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
