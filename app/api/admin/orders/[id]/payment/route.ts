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
    const validStatuses = ["pending", "processing", "paid", "failed", "refunded"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid payment status value" }, { status: 400 });
    }

    await connectDB();

    const { id } = context.params;
    const order = await Order.findByIdAndUpdate(
      new Types.ObjectId(id),
      { $set: { paymentStatus: status } },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (err) {
    console.error("PATCH /api/admin/orders/[id]/payment error", err);
    return NextResponse.json({ success: false, error: "Failed to update payment status" }, { status: 500 });
  }
}
