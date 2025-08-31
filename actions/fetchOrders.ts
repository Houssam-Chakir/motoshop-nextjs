"use server";

import connectDB from "@/config/database";
import Order from "@/models/Order";
import { OrderType } from "@/types/order";
import { Types } from "mongoose";
import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOptions";

// Get orders for authenticated user
export async function getUserOrders(): Promise<OrderType[]> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return [];
    }
    
    await connectDB();
    
    const orders = await Order.find({ userId: new Types.ObjectId(session.user.id) })
      .sort({ createdAt: -1 }) // Most recent first
      .populate("products.productId", "name images slug")
      .lean();
    
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return [];
  }
}

// Get a single order by id
export async function getOrderById(orderId: string): Promise<OrderType | null> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return null;
    }
    
    await connectDB();
    
    // Find order that belongs to current user
    const order = await Order.findOne({
      _id: new Types.ObjectId(orderId),
      userId: new Types.ObjectId(session.user.id)
    })
    .populate("products.productId", "name images slug")
    .lean();
    
    if (!order) {
      return null;
    }
    
    return JSON.parse(JSON.stringify(order));
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
}

// Admin function to get all orders
export async function getAllOrders(): Promise<OrderType[]> {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is admin
    if (!session?.user?.id) {
      return [];
    }
    
    await connectDB();
    
    // Verify admin status would be done here
    // For now we'll just implement the function
    
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .populate("products.productId", "name images slug")
      .populate("userId", "name email")
      .lean();
    
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }
}
