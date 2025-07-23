"use server";

import connectDB from "@/config/database";
import Product, { ProductDocument, ProductType } from "@/models/Product";
import Stock, { StockDocument, StockType } from "@/models/Stock";
import makeSerializable from "@/utils/convertToObj";
import { getServerSession } from "next-auth/next";
import authOptions from "@/utils/authOptions";
import Cart, { CartDocument, CartProductItem } from "@/models/Cart";
import User from "@/models/User"; // Import the User model
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { SaleDocument } from "./productsActions";

interface ProductAndStockResult {
  success: boolean;
  message?: string;
  data?: {
    product: ProductType;
  } | null;
}

export async function getProductWithStock(productId: string): Promise<ProductAndStockResult> {
  if (!productId) {
    return { success: false, message: "Product ID is required." };
  }

  try {
    await connectDB();
    const currentDate = new Date();

    const productDoc = await Product.findById(productId)
      .populate<{ saleInfo: SaleDocument | null }>({
        path: "saleInfo",
        match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
        select: "name discountType discountValue",
      })
      .populate({ path: "stock", select: "sizes" })
      .lean({ virtuals: true });

    if (!productDoc) {
      return { success: false, message: "Product not found." };
    }

    const serializableData = {
      product: makeSerializable(productDoc) as ProductType,
    };

    return {
      success: true,
      data: serializableData,
    };
  } catch (error) {
    console.error("Error fetching product with stock:", error);
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return { success: false, message: `Server Error: ${message}` };
  }
}

export async function getCart() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { success: false, message: "Unauthorized: Please log in.", cart: null };
  }

  try {
    await connectDB();
    const currentDate = new Date();
    const cart = await Cart.findOne({ userId: session.user.id })
      .populate({
        path: "products.productId",
        model: "Product",
        select: "title images retailPrice slug", // Keep original fields for UI
        populate: [
          {
            path: "saleInfo",
            match: { isActive: true, startDate: { $lte: currentDate }, endDate: { $gte: currentDate } },
            select: "name discountType discountValue startDate endDate isActive",
          },
          {
            path: "stock",
            select: "sizes",
          },
        ],
      })
      .lean({ virtuals: true });

    if (!cart) {
      return { success: true, message: "Cart not found.", cart: null };
    }

    return {
      success: true,
      message: "Cart fetched successfully.",
      cart: makeSerializable(cart),
    };
  } catch (error) {
    console.error("Error fetching cart:", error);
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return { success: false, message: `Server Error: ${message}`, cart: null };
  }
}

type AddToCartActionState = {
  success: boolean;
  message: string;
};

export async function addItemToCart({ productId, size, quantity: selectedSizeQuantity }: { productId: string; size: string; quantity: number }): Promise<AddToCartActionState> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  if (!productId || !size || selectedSizeQuantity <= 0) {
    return { success: false, message: "Invalid input data." };
  }

  try {
    await connectDB();

    const product = await Product.findById(productId);
    if (!product) {
      return { success: false, message: "Product not found." };
    }

    console.log("* Product in cartActions: ", product);

    let cart: CartDocument | null = await Cart.findOne({ userId: session.user.id });

    const unitPrice = product.salePrice ? product.salePrice : product.retailPrice;
    const totalPrice = unitPrice * selectedSizeQuantity;

    if (cart) {
      // Cart exists, check if product already exists
      const productIndex = cart.products.findIndex((p: CartProductItem) => p.productId.toString() === productId && p.size === size);

      if (productIndex > -1) {
        // Product exists, update quantity
        cart.products[productIndex].quantity += selectedSizeQuantity;
        cart.products[productIndex].totalPrice = cart.products[productIndex].quantity * unitPrice;
      } else {
        // Product does not exist, add new item
        cart.products.push({
          productId: new mongoose.Types.ObjectId(productId),
          size,
          quantity: selectedSizeQuantity,
          unitPrice,
          totalPrice,
          addedAt: new Date(),
        } as CartProductItem);
      }
    } else {
      // No cart for user, create a new one
      cart = new Cart({
        userId: session.user.id,
        products: [
          {
            productId: new mongoose.Types.ObjectId(productId),
            size,
            quantity: selectedSizeQuantity,
            unitPrice,
            totalPrice,
            addedAt: new Date(),
          },
        ],
      });
    }

    // This check is to satisfy TypeScript's control flow analysis.
    if (!cart) {
      // This path should logically not be reached.
      return { success: false, message: "Error: Cart not found or created." };
    }

    // Recalculate total amount and quantity
    cart.totalAmount = cart.products.reduce((acc: number, item: CartProductItem) => acc + item.totalPrice, 0);
    cart.quantity = cart.products.reduce((acc: number, item: CartProductItem) => acc + item.quantity, 0);

    await cart.save();
    revalidatePath("/cart"); // Or any other relevant path

    return { success: true, message: "Item added to cart successfully." };
  } catch (error) {
    console.error("Error adding item to cart:", error);
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return { success: false, message: `Server Error: ${message}` };
  }
}

// Remove item from cart for authenticated user
export async function updateCartItemQuantity({ productId, size, quantity: newQuantity }: { productId: string; size: string; quantity: number }): Promise<AddToCartActionState> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { success: false, message: "Unauthorized: Please log in." };
  }
  if (!productId || !size || newQuantity <= 0) {
    return { success: false, message: "Invalid input data." };
  }
  try {
    await connectDB();
    const cart: CartDocument | null = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return { success: false, message: "Cart not found." };
    }
    const item = cart.products.find((p: CartProductItem) => p.productId.toString() === productId && p.size === size);
    if (!item) {
      return { success: false, message: "Item not found in cart." };
    }
    item.quantity = newQuantity;
    item.totalPrice = item.unitPrice * newQuantity;
    cart.totalAmount = cart.products.reduce((acc: number, p: CartProductItem) => acc + p.totalPrice, 0);
    cart.quantity = cart.products.reduce((acc: number, p: CartProductItem) => acc + p.quantity, 0);
    await cart.save();
    revalidatePath("/cart");
    return { success: true, message: "Cart updated successfully." };
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return { success: false, message: `Server Error: ${message}` };
  }
}

export async function removeItemFromCart({ productId, size }: { productId: string; size: string }): Promise<AddToCartActionState> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  if (!productId || !size) {
    return { success: false, message: "Invalid input data." };
  }

  try {
    await connectDB();
    const cart: CartDocument | null = await Cart.findOne({ userId: session.user.id });
    if (!cart) {
      return { success: false, message: "Cart not found." };
    }

    const originalLength = cart.products.length;
    cart.products = cart.products.filter((p: CartProductItem) => !(p.productId.toString() === productId && p.size === size));

    if (cart.products.length === originalLength) {
      return { success: false, message: "Item not found in cart." };
    }

    cart.totalAmount = cart.products.reduce((acc: number, item: CartProductItem) => acc + item.totalPrice, 0);
    cart.quantity = cart.products.reduce((acc: number, item: CartProductItem) => acc + item.quantity, 0);

    await cart.save();
    revalidatePath("/cart");

    return { success: true, message: "Item removed from cart successfully." };
  } catch (error) {
    console.error("Error removing item from cart:", error);
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return { success: false, message: `Server Error: ${message}` };
  }
}

export async function clearCart(): Promise<AddToCartActionState> {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return { success: false, message: "Unauthorized: Please log in." };
  }

  const mongooseSession = await mongoose.startSession();
  mongooseSession.startTransaction();

  try {
    await connectDB();

    // Step 1: Delete the cart document
    const cartDeletionResult = await Cart.findOneAndDelete({ userId: session.user.id }).session(mongooseSession);

    if (!cartDeletionResult) {
      // If no cart exists, there's nothing to do. The state is already what we want.
      await mongooseSession.commitTransaction();
      mongooseSession.endSession();
      return { success: true, message: "Cart is already empty." };
    }

    // Step 2: Unset the cart field from the User document
    await User.updateOne({ _id: session.user.id }, { $unset: { cart: "" } }).session(mongooseSession);

    // If both operations succeed, commit the transaction
    await mongooseSession.commitTransaction();
    mongooseSession.endSession();

    revalidatePath("/cart");

    return { success: true, message: "Cart cleared successfully." };
  } catch (error) {
    // If any error occurs, abort the transaction
    await mongooseSession.abortTransaction();
    mongooseSession.endSession();

    console.error("Error clearing cart:", error);
    const message = error instanceof Error ? error.message : "An unexpected server error occurred.";
    return { success: false, message: `Server Error: ${message}` };
  }
}
