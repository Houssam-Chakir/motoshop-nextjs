"use server";

import connectDB from "@/config/database";
import Order, { OrderDocument } from "@/models/Order";
import Product, { ProductDocument } from "@/models/Product";
import Stock from "@/models/Stock";
import Sale, { SaleDocument } from "@/models/Sale";
import User from "@/models/User"; // Import the User model
import mongoose, { Types } from "mongoose";

// ... (interfaces remain the same for now, we handle optional userId in the function)

// Main order input type
export interface OrderInput {
  userId?: string; // userId is now optional
  products: Omit<OrderProductInput, "unitPrice" | "totalPrice">[];
  quantity: number;
  deliveryFee: number;
  orderTotalPrice: number;
  paymentMethod: "cmi" | "delivery" | "pickup";
  deliveryInformation: DeliveryInformation;
}

interface OrderProductInput {
  productId: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt?: Date;
}

interface DeliveryInformation {
  fullName: string;
  phoneNumber: string;
  email: string;
  city: string;
  address: string;
  zipcode: number;
  extraDirections: string;
}

export type CreateOrderResult = { status: "success"; order: OrderDocument } | { status: "failed"; message: string };

export async function createOrder(orderData: OrderInput): Promise<CreateOrderResult> {
  await connectDB();

  if (
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
    let userIdForOrder: Types.ObjectId;

    // --- User Handling Logic ---
    if (orderData.userId) {
      // Case 1: User is logged in.
      userIdForOrder = new Types.ObjectId(orderData.userId);
    } else {
      // Case 2: Guest checkout.
      const { email, fullName } = orderData.deliveryInformation;
      if (!email) {
        throw new Error("Email is required for guest checkout.");
      }

      let user = await User.findOne({ email }).session(session);

      if (user) {
        // User with this email already exists.
        if (user.role === "customer") {
          // If it's a full customer account, they must log in.
          throw new Error("An account with this email already exists. Please log in to place your order.");
        }
        // If it's a guest account, we can reuse it.
        userIdForOrder = user._id;
      } else {
        // No user found, create a new guest account.
        const newGuest = new User({
          name: fullName,
          email: email,
          role: "guest",
        });
        await newGuest.save({ session });
        userIdForOrder = newGuest._id;
      }
    }

    // --- Stock and Price Calculation ---
    const productIds = orderData.products.map((p) => p.productId);
    const currentDate = new Date();
    const products = await Product.find({ _id: { $in: productIds } })
      .select("stock retailPrice saleInfo")
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

    for (const item of orderData.products) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
      if (!product.stock) throw new Error(`Stock information for product ID ${item.productId} not found.`);

      const updateResult = await Stock.updateOne(
        { _id: product.stock, "sizes.size": item.size, "sizes.quantity": { $gte: item.quantity } },
        { $inc: { "sizes.$.quantity": -item.quantity } },
        { session }
      );

      if (updateResult.modifiedCount === 0) {
        throw new Error(`Insufficient stock for product ${item.productId} (size: ${item.size}).`);
      }

      const unitPrice = product.salePrice ?? product.retailPrice;
      const totalPrice = unitPrice * item.quantity;
      serverCalculatedSubtotal += totalPrice;

      serverCalculatedProducts.push({
        ...item,
        unitPrice: Math.round(unitPrice * 100) / 100,
        totalPrice: Math.round(totalPrice * 100) / 100,
      });
    }

    // --- Order Creation ---
    const finalOrderTotal = serverCalculatedSubtotal + orderData.deliveryFee;

    const order = new Order({
      ...orderData,
      userId: userIdForOrder, // Use the determined userId
      products: serverCalculatedProducts,
      orderTotalPrice: finalOrderTotal,
      trackingNumber: `TRK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentStatus: orderData.paymentMethod === "cmi" ? "paid" : "pending",
      deliveryStatus: "processing",
      orderedAt: new Date(),
    });

    await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    const plainOrder = JSON.parse(JSON.stringify(order));
    return { status: "success", order: plainOrder };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    console.error("Order creation failed:", message);
    return { status: "failed", message };
  }
}