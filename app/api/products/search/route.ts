import { NextResponse } from "next/server";
import { getProducts } from "@/actions/productsActions";

// /api/products/search?q=term
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";

    if (!q.trim()) {
      // Empty query returns empty list to avoid heavy DB load.
      return NextResponse.json([]);
    }

    // Case-insensitive regex search on product name or slug. Extend as needed.
    const regex = new RegExp(q, "i");

    const products = await getProducts({
      $or: [{ title: regex }, { slug: regex }, { description: regex }],
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error("Product search API error", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
