"use server";
import Product from "@/models/Product";
import Stock from "@/models/Stock";
import { revalidatePath } from "next/cache";
// Import mongoose to use transactions
import mongoose from "mongoose";

const deleteProduct = async (productId: string) => {
  // Validate productId (important for security and preventing errors)
  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    console.error("Invalid or missing Product ID:", productId);
    throw new Error("Invalid or missing Product ID.");
  }

  // Start a Mongoose session for the transaction
  const session = await mongoose.startSession();
  session.startTransaction(); // Start the transaction

  try {
    const opts = { session }; // Options object to pass the session to Mongoose operations

    // 1. Delete the product within the transaction
    const product = await Product.findByIdAndDelete(productId, opts);

    if (!product) {
      await session.abortTransaction(); // Abort transaction if product not found
      session.endSession(); // End the session
      console.warn("Product not found for deletion:", productId);
      throw new Error("Product not found.");
    }
    console.log("Deleted product: ", product);

    // 2. Delete the associated stock within the transaction
    // Use product._id from the deleted product object to ensure consistency,
    // though productId should be the same.
    const stock = await Stock.findOneAndDelete({ productId: product._id }, opts);

    if (!stock) {
      // Depending on your business logic, a missing stock might or might not be an error.
      console.warn("Stock not found for product ID (might be normal or indicate prior inconsistency):", product._id);
    } else {
      console.log("Deleted stock: ", stock);
    }

    // If all operations were successful, commit the transaction
    await session.commitTransaction();
    revalidatePath("/", "layout");

    // return a success status or the deleted items
    return { success: true, deletedProductId: product._id.toString(), deletedStockId: stock?._id.toString() || null };
  } catch (error) {
    // If any error occurs, abort the transaction
    if (session.inTransaction()) {
      // Check if a transaction is active before trying to abort
      await session.abortTransaction();
    }
    console.error("Error deleting product (transaction aborted):", error);

    // Ensure a proper Error object is thrown
    if (error instanceof Error) {
      // Avoid re-throwing "Product not found" if it was already handled and thrown
      if (error.message === "Product not found.") {
        throw error;
      }
      throw new Error(error.message || "Failed to delete product.");
    } else {
      throw new Error("An unknown error occurred during product deletion.");
    }
  } finally {
    // end the session in a finally block to ensure it's closed
    // whether the transaction succeeded or failed.
    session.endSession();
  }
};

export default deleteProduct;
