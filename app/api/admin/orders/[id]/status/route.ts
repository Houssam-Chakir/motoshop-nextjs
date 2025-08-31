import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "@/utils/authOptions";
import connectDB from "@/config/database";
import Order from "@/models/Order";
import { Types } from "mongoose";

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    // TODO: enforce admin role here if available on session

    const { status } = await req.json();
    const validStatuses = [
      "processing",
      "awaiting pickup",
      "packaged",
      "shipped",
      "in city",
      "in delivery",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status value" }, { status: 400 });
    }

    await connectDB();

    const update: any = { deliveryStatus: status };
    if (status === "shipped") {
      update.estimatedDeliveryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const { id } = context.params;
    const order = await Order.findByIdAndUpdate(new Types.ObjectId(id), { $set: update }, { new: true });
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id]/status error", err);
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 });
  }
}
