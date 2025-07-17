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

    const products = await getProducts(
      {
        searchQuery: q, // Use the search query for the title, slug, and description
        sort: "",
        type: [],
        brand: [],
        size: [],
        minPrice: 0,
        maxPrice: 30000,
        page: 0,
        limit: 10, // Adjust the limit as needed
      },
      {
        brands: [],
      }
    );

    return NextResponse.json(products);
  } catch (err) {
    console.error("Product search API error", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
