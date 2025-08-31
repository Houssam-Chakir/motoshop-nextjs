"use server";

import connectDB from "@/config/database";
import Product from "@/models/Product";
import User from "@/models/User";
import Order from "@/models/Order";
import Stock, { SizeQuantityType } from "@/models/Stock";

/**
 * Fetches all key metrics for the dashboard
 * @returns Dashboard statistics and key metrics
 */
export async function getDashboardStats() {
  try {
    await connectDB();

    // Get counts
    const totalProducts = await Product.countDocuments();
    const totalCustomers = await User.countDocuments({ role: "customer" });
    
    // Get orders for revenue calculation
    const orders = await Order.find().lean();
    const totalOrders = orders.length;
    
    // Calculate total revenue from all orders
    const totalRevenue = orders.reduce((sum, order: any) => sum + (order.orderTotalPrice || 0), 0);
    
    // Get orders from the current month for calculating growth
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const ordersThisMonth = await Order.find({
      createdAt: { $gte: firstDayOfMonth }
    }).lean();
    
    const revenueThisMonth = ordersThisMonth.reduce((sum, order: any) => sum + (order.orderTotalPrice || 0), 0);
    
    // Get orders from previous month for comparison
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const ordersLastMonth = await Order.find({
      createdAt: {
        $gte: firstDayOfLastMonth,
        $lte: lastDayOfLastMonth
      }
    }).lean();
    
    const revenueLastMonth = ordersLastMonth.reduce((sum, order: any) => sum + (order.orderTotalPrice || 0), 0);
    
    // Calculate revenue growth percentage
    let revenueGrowth = 0;
    if (revenueLastMonth > 0) {
      revenueGrowth = ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100;
    }
    
    // Count new customers this month
    const newCustomers = await User.countDocuments({ 
      role: "customer",
      createdAt: { $gte: firstDayOfMonth }
    });
    
    // Get pending orders (by paymentStatus)
    const pendingOrders = await Order.countDocuments({ paymentStatus: "pending" });
    
    // Get low stock items
    // Find products where at least one size is below threshold (5 items)
    const lowStockItems = await Stock.countDocuments({
      "sizes": { 
        $elemMatch: { 
          "quantity": { $lt: 5, $gt: 0 } 
        }
      }
    });
    
    // Calculate conversion rate (orders / unique visitors) - placeholder
    // In a real app, this would use analytics data
    const conversionRate = (totalOrders / Math.max(totalCustomers, 1)) * 100;

    return {
      totalProducts,
      totalOrders,
      totalCustomers,
      totalRevenue,
      revenueGrowth,
      lowStockItems,
      pendingOrders,
      newCustomers,
      conversionRate: parseFloat(conversionRate.toFixed(2))
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard statistics");
  }
}

/**
 * Fetches recent orders for the dashboard
 * @param limit Number of orders to return
 * @returns Recent orders with customer information
 */
export async function getRecentOrders(limit = 5) {
  try {
    await connectDB();
    
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "userId", select: "name email" })
      .lean();
      
    return recentOrders;
  } catch (error) {
    console.error("Error fetching recent orders:", error);
    throw new Error("Failed to fetch recent orders");
  }
}

/**
 * Fetches recent customer activities for the dashboard
 * @param limit Number of activities to return
 * @returns Recent customer activities
 */
export async function getRecentActivity(limit = 10) {
  try {
    await connectDB();
    
    // Get recent users
    const recentUsers = await User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name email createdAt")
      .lean();
      
    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate({ path: "userId", select: "name email" })
      .select("userId orderTotalPrice paymentStatus createdAt")
      .lean();
      
    // Combine and sort by date
    const activities = [
      ...recentUsers.map(user => ({
        type: "new_user",
        user: { name: user.name, email: user.email },
        timestamp: user.createdAt,
        data: null
      })),
      ...recentOrders.map(order => ({
        type: "new_order",
        user: order.userId,
        timestamp: order.createdAt,
        data: {
          totalAmount: order.orderTotalPrice,
          status: order.paymentStatus,
          orderId: order._id
        }
      }))
    ];
    
    // Sort by timestamp, most recent first
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    return activities.slice(0, limit);
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    throw new Error("Failed to fetch recent activity");
  }
}

/**
 * Fetches top selling products
 * @param limit Number of products to return
 * @returns Top selling products
 */
export async function getTopSellingProducts(limit = 5) {
  try {
    await connectDB();
    
    // Aggregate orders to find top selling products
    const topProducts = await Order.aggregate([
      // Unwind the products array to work with individual items
      { $unwind: "$products" },
      
      // Group by product ID and sum quantities and revenue
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
          totalRevenue: { $sum: "$products.totalPrice" }
        }
      },
      
      // Sort by total sold, descending
      { $sort: { totalSold: -1 } },
      
      // Limit to the top N products
      { $limit: limit },
      
      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      
      // Unwind the productDetails array
      { $unwind: "$productDetails" },
      
      // Project the final result
      {
        $project: {
          _id: 1,
          name: "$productDetails.title",
          totalSold: 1,
          totalRevenue: 1,
          image: { $arrayElemAt: ["$productDetails.images", 0] },
          slug: "$productDetails.slug"
        }
      }
    ]);
    
    return topProducts;
  } catch (error) {
    console.error("Error fetching top selling products:", error);
    throw new Error("Failed to fetch top selling products");
  }
}

/**
 * Fetches inventory alerts (low stock, out of stock)
 * @returns Inventory alerts with product information
 */
export async function getInventoryAlerts() {
  try {
    await connectDB();
    
    // Find stocks with low quantities
    const lowStockItems = await Stock.find({
      "sizes": { 
        $elemMatch: { 
          "quantity": { $lt: 5, $gt: 0 } 
        }
      }
    }).populate({
      path: "productId",
      select: "title images slug"
    }).lean();
    
    // Find out of stock items
    const outOfStockItems = await Stock.find({
      "sizes": { 
        $not: { $elemMatch: { "quantity": { $gt: 0 } } }
      }
    }).populate({
      path: "productId",
      select: "title images slug"
    }).lean();
    
    return {
      lowStock: lowStockItems.map(item => ({
        stockId: item._id,
        product: item.productId,
        sizes: item.sizes.filter((size: SizeQuantityType) => size.quantity < 5 && size.quantity > 0)
      })),
      outOfStock: outOfStockItems.map(item => ({
        stockId: item._id,
        product: item.productId,
        sizes: item.sizes
      }))
    };
  } catch (error) {
    console.error("Error fetching inventory alerts:", error);
    throw new Error("Failed to fetch inventory alerts");
  }
}

/**
 * Fetches sales data for the chart
 * @param days Number of days to include in the chart
 * @returns Daily sales data for the specified period
 */
export async function getSalesChartData(days = 30) {
  try {
    await connectDB();
    
    // Calculate the start date (X days ago)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Aggregate orders by day
    const salesData = await Order.aggregate([
      // Match orders within the date range
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      
      // Group by day
      {
        $group: {
          _id: { 
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          totalSales: { $sum: "$orderTotalPrice" },
          orderCount: { $sum: 1 }
        }
      },
      
      // Format the result
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          totalSales: 1,
          orderCount: 1
        }
      },
      
      // Sort by date
      { $sort: { date: 1 } }
    ]);
    
    // Fill in missing days with zero values
    const filledData = [];
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      // Format date as YYYY-MM-DD
      const dateString = currentDate.toISOString().split('T')[0];
      
      // Find if we have data for this date
      const existingData = salesData.find(item => 
        new Date(item.date).toISOString().split('T')[0] === dateString
      );
      
      if (existingData) {
        filledData.push({
          date: dateString,
          totalSales: existingData.totalSales,
          orderCount: existingData.orderCount
        });
      } else {
        filledData.push({
          date: dateString,
          totalSales: 0,
          orderCount: 0
        });
      }
    }
    
    return filledData;
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    throw new Error("Failed to fetch sales chart data");
  }
}
