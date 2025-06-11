'use server';

import connectDB from '@/config/database';
import Product, { ProductDocument } from '@/models/Product';
import Stock, { StockDocument } from '@/models/Stock';
import makeSerializable from '@/utils/convertToObj';

interface ProductAndStockResult {
  success: boolean;
  message?: string;
  data?: {
    product: ProductDocument;
    stock: StockDocument | null;
  } | null;
}

export async function getProductWithStock(productId: string): Promise<ProductAndStockResult> {
  if (!productId) {
    return { success: false, message: 'Product ID is required.' };
  }

  try {
    await connectDB();

    const [productDoc, stockDoc] = await Promise.all([
      Product.findById(productId).lean(),
      Stock.findOne({ productId: productId }).lean()
    ]);

    if (!productDoc) {
      return { success: false, message: 'Product not found.' };
    }

    const serializableData = {
      product: makeSerializable(productDoc),
      stock: makeSerializable(stockDoc),
    };

    return {
      success: true,
      data: serializableData,
    };

  } catch (error) {
    console.error("Error fetching product with stock:", error);
    const message = error instanceof Error ? error.message : 'An unexpected server error occurred.';
    return { success: false, message: `Server Error: ${message}` };
  }
}
