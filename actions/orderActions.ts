'use server'

import connectDB from "@/config/database";
import Order, { OrderDocument } from "@/models/Order";
import Product, { ProductDocument } from "@/models/Product";
import Stock from "@/models/Stock";
import { SaleDocument } from "@/models/Sale";
import mongoose from "mongoose";

// For each product in the order
interface OrderProductInput {
  productId: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt?: Date;
}

// Delivery information type (from models/User.ts)
interface DeliveryInformation {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  address: string;
  zipcode: number;
  extraDirections: string;
}

// Main order input type
export interface OrderInput {
  userId: string;
  products: Omit<OrderProductInput, "unitPrice" | "totalPrice">[]; // Prices will be calculated on the server
  quantity: number;
  deliveryFee: number;
  orderTotalPrice: number; // This will be validated against the server-calculated price
  paymentMethod: "cmi" | "delivery" | "pickup";
  deliveryInformation: DeliveryInformation;
  notes?: string;
}

/**
 * The result type for createOrder: either success with the order, or failed with a message.
 */
export type CreateOrderResult = { status: "success"; order: OrderDocument } | { status: "failed"; message: string };

/**
 * Creates a new order with server-verified pricing and atomic stock updates.
 * @param {OrderInput} orderData - The data for the new order, client-side prices are ignored.
 * @returns {Promise<CreateOrderResult>} The result of the order creation.
 */
export async function createOrder(orderData: OrderInput): Promise<CreateOrderResult> {
  await connectDB();

  if (
    !orderData.userId ||
    !orderData.products ||
    !Array.isArray(orderData.products) ||
    orderData.products.length === 0 ||
    !orderData.paymentMethod ||
    !orderData.deliveryInformation
  ) {
    throw new Error("Missing required order fields.");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Get all product data from DB to have an authoritative source for price and stock
    const productIds = orderData.products.map((p) => p.productId);
    const currentDate = new Date();

    const products = await Product.find({ _id: { $in: productIds } })
      .select("stock retailPrice saleInfo") // Select all fields needed
      .populate<{ saleInfo: SaleDocument | null }>({
        path: "saleInfo",
        match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
      })
      .session(session);

    const productMap = new Map<string, ProductDocument>();
    for (const p of products) {
      productMap.set(p._id.toString(), p);
    }

    let serverCalculatedSubtotal = 0;
    const serverCalculatedProducts: OrderProductInput[] = [];

    // 2. Atomically update stock and calculate prices for each item
    for (const item of orderData.products) {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found.`);
      }
      if (!product.stock) {
        throw new Error(`Stock information not found for product ID ${item.productId}.`);
      }

      // --- Atomic Stock Update ---
      const updateResult = await Stock.updateOne(
        { _id: product.stock, "sizes.size": item.size, "sizes.quantity": { $gte: item.quantity } },
        { $inc: { "sizes.$.quantity": -item.quantity } },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Insufficient stock for product ${item.productId} (size: ${item.size}).`);
      }

      // --- Server-Side Price Calculation using Virtual Property ---
      const unitPrice = product.salePrice ?? product.retailPrice;

      const totalPrice = unitPrice * item.quantity;
      serverCalculatedSubtotal += totalPrice;

      serverCalculatedProducts.push({
        ...item,
        unitPrice: Math.round(unitPrice * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
      });
    }

    // 3. Create the order document with server-verified data
    const finalOrderTotal = serverCalculatedSubtotal + orderData.deliveryFee;

    // Security Check: Validate client price against server price. Allow for minor floating point discrepancies.
    if (Math.abs(finalOrderTotal - orderData.orderTotalPrice) > 0.01) {
      console.warn(`Potential price tampering detected. Discarding client price. Client Total: ${orderData.orderTotalPrice}, Server Total: ${finalOrderTotal}`);
    }

    const order = new Order({
      ...orderData,
      products: serverCalculatedProducts, // USE SERVER-CALCULATED PRODUCTS
      orderTotalPrice: finalOrderTotal, // USE SERVER-CALCULATED TOTAL
      trackingNumber: `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentStatus: orderData.paymentMethod === "cmi" ? "paid" : "pending",
      deliveryStatus: "processing",
      orderedAt: new Date(),
    });

    await order.save({ session });

    // 4. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return { status: "success", order };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const message = error instanceof Error ? error.message : "An unexpected error occurred during order creation.";
    console.error("Order creation failed:", message);
    return { status: "failed", message };
  }
}
