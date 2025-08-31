"use server";

import connectDB from "@/config/database";
import Order from "@/models/Order";
import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOptions";
import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

/**
 * Update the delivery status of an order
 * 
 * @param orderId - The ID of the order to update
 * @param status - The new delivery status
 * @returns Object indicating success or failure with optional error message
 */
export async function updateOrderStatus(orderId: string, status: string) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    // Check if user is admin - implement role check here
    // if (session.user.role !== 'admin') {
    //   return { success: false, error: "Admin privileges required" };
    // }
    
    await connectDB();
    
    // Validate status
    const validStatuses = [
      "processing", 
      "awaiting pickup", 
      "packaged", 
      "shipped", 
      "in city", 
      "in delivery", 
      "delivered", 
      "cancelled"
    ];
    
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid status value" };
    }
    
    // Update the order
    const result = await Order.findByIdAndUpdate(
      new Types.ObjectId(orderId),
      { 
        $set: { 
          deliveryStatus: status,
          // Update estimatedDeliveryDate based on status
          ...(status === "shipped" && {
            estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          })
        } 
      },
      { new: true }
    );
    
    if (!result) {
      return { success: false, error: "Order not found" };
    }
    
    // Revalidate cache for orders pages
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");
    
    return { success: true, order: result };
  } catch (error) {
    console.error("Error updating order status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update order status" 
    };
  }
}

/**
 * Update the payment status of an order
 * 
 * @param orderId - The ID of the order to update
 * @param status - The new payment status
 * @returns Object indicating success or failure with optional error message
 */
export async function updatePaymentStatus(orderId: string, status: string) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    // Check if user is admin - implement role check here
    // if (session.user.role !== 'admin') {
    //   return { success: false, error: "Admin privileges required" };
    // }
    
    await connectDB();
    
    // Validate status
    const validStatuses = ["pending", "processing", "paid", "failed", "refunded"];
    
    if (!validStatuses.includes(status)) {
      return { success: false, error: "Invalid payment status value" };
    }
    
    // Update the order
    const result = await Order.findByIdAndUpdate(
      new Types.ObjectId(orderId),
      { $set: { paymentStatus: status } },
      { new: true }
    );
    
    if (!result) {
      return { success: false, error: "Order not found" };
    }
    
    // Revalidate cache for orders pages
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");
    
    return { success: true, order: result };
  } catch (error) {
    console.error("Error updating payment status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update payment status" 
    };
  }
}

/**
 * Fetch orders with advanced filters
 */
export async function getFilteredOrders({
  status,
  paymentStatus,
  search,
  sort,
  sortDirection,
  page = 0,
  limit = 10
}: {
  status?: string;
  paymentStatus?: string;
  search?: string;
  sort?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}) {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required", orders: [] };
    }
    
    await connectDB();
    
    // Build query
    const query: any = {};
    
    // Apply status filter
    if (status && status !== "all") {
      query.deliveryStatus = status;
    }
    
    // Apply payment status filter
    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }
    
    // Apply search
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { trackingNumber: searchRegex },
        { "deliveryInformation.fullName": searchRegex },
        { "deliveryInformation.email": searchRegex },
        { "deliveryInformation.phoneNumber": searchRegex }
      ];
    }
    
    // Build sort options
    const sortOptions: any = {};
    
    if (sort) {
      switch (sort) {
        case "date":
          sortOptions.createdAt = sortDirection === "asc" ? 1 : -1;
          break;
        case "amount":
          sortOptions.orderTotalPrice = sortDirection === "asc" ? 1 : -1;
          break;
        case "status":
          sortOptions.deliveryStatus = sortDirection === "asc" ? 1 : -1;
          break;
        default:
          sortOptions.createdAt = -1; // Default to newest first
      }
    } else {
      sortOptions.createdAt = -1; // Default to newest first
    }
    
    // Count total orders for pagination
    const totalOrders = await Order.countDocuments(query);
    
    // Get paginated orders
    const orders = await Order.find(query)
      .sort(sortOptions)
      .skip(page * limit)
      .limit(limit)
      .populate("products.productId", "name images slug")
      .populate("userId", "name email")
      .lean();
    
    // Format for response
    return {
      success: true,
      orders: JSON.parse(JSON.stringify(orders)),
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error("Error fetching filtered orders:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch orders",
      orders: []
    };
  }
}

/**
 * Get order statistics for dashboard
 */
export async function getOrderStats() {
  try {
    // Verify authentication and admin role
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required" };
    }
    
    await connectDB();
    
    // Get counts for different statuses
    const [
      totalOrders,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue,
      paidRevenue
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ deliveryStatus: "processing" }),
      Order.countDocuments({ deliveryStatus: { $in: ["shipped", "in city", "in delivery"] } }),
      Order.countDocuments({ deliveryStatus: "delivered" }),
      Order.countDocuments({ deliveryStatus: "cancelled" }),
      Order.aggregate([
        { $group: { _id: null, total: { $sum: "$orderTotalPrice" } } }
      ]),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$orderTotalPrice" } } }
      ])
    ]);
    
    return {
      success: true,
      stats: {
        totalOrders,
        processing,
        shipped,
        delivered,
        cancelled,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        paidRevenue: paidRevenue.length > 0 ? paidRevenue[0].total : 0,
        conversionRate: totalOrders > 0 ? (delivered / totalOrders * 100).toFixed(1) : 0
      }
    };
  } catch (error) {
    console.error("Error fetching order stats:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch order statistics"
    };
  }
}
