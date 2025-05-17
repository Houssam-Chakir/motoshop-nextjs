"use server";

import connectDB from "@/config/database";
import mongoose from "mongoose";
import Product from "../../models/Product";
import Stock from "@/models/Stock";
import { revalidatePath } from "next/cache";
import imageUploader from "@/utils/imageUploadCloudinary";
import isUserAuthorized from "@/utils/isUserAuthorized";
import deleteImages from "@/utils/imageDeleteCloudinary";
import { images } from "@/components/forms/ProductEditForm";

interface ProductValues {
  productId: string;
  stockId?: string | null;
  brand: mongoose.Types.ObjectId;
  productModel: string;
  title: string;
  identifiers: { brand: string; categoryType: string; category: string };
  category: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  season: "All seasons" | "Summer" | "Winter" | "Spring/Fall";
  wholesalePrice: number;
  retailPrice: number;
  stockItems: SizeValues[]; // Replace `any` with a more specific type if available
  description: string; // Replace `any` with a more specific type if available
  specifications?: { name: string; description: string }; // Replace `any` with a more specific type if available
  images: images[];
  imagesToUpload: File[];
  imagesToDelete: images[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ProductObject {
  brand: mongoose.Types.ObjectId;
  productModel: string;
  title: string;
  identifiers: { brand: string; categoryType: string; category: string };
  category: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  season: "All seasons" | "Summer" | "Winter" | "Spring/Fall";
  wholesalePrice: number;
  retailPrice: number;
  stock?: mongoose.Types.ObjectId; // Replace `any` with a more specific type if available
  description: string; // Replace `any` with a more specific type if available
  specifications?: { name: string; description: string }; // Replace `any` with a more specific type if available
  images: images[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface SizeValues {
  size: string;
  quantity: string;
}

interface StockValues {
  productId: mongoose.Types.ObjectId;
  sizes: SizeValues[];
}

//f/ UPDATE PRODUCT FUNCTION ---------------------------------------------------
export default async function updateProduct(values: ProductValues): Promise<{ status: boolean; slug: string }> {
  let uploadedImagesData: { public_id: string; secure_url: string }[] = [];
  // -- starting a transaction session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectDB();

    // --- Authentication/Authorization -----------------
    const requiredRole = "admin";
    await isUserAuthorized(requiredRole);

    console.log("Server Action: Received values: ", values);

    const {
      productId,
      stockId,
      stockItems,
      identifiers,
      brand,
      productModel,
      title,
      category,
      type,
      season,
      wholesalePrice,
      retailPrice,
      description,
      specifications,
      images,
      imagesToDelete,
      imagesToUpload,
    } = values;

    // -- update product -----------------------
    const productUpdatedData: ProductObject = {
      brand,
      productModel,
      identifiers,
      title,
      category,
      type,
      season,
      wholesalePrice,
      retailPrice,
      // stock: done later
      description,
      specifications,
      images,
      createdAt: new Date(),
    };

    // -- Upload New images to cloudinary and add secure urls array to productData --------
    // returns objects array or secure url and public id
    if (imagesToUpload.length > 0) {
      uploadedImagesData = await imageUploader(imagesToUpload);
      // extract secure urls for images field and add them to images array or existing images urls
      productUpdatedData.images.push(...uploadedImagesData);
    }

    // -- Delete removed images from cloudinary
    if (imagesToDelete.length > 0) {
      console.log("Deleting uploaded images from Cloudinary...");
      const imagesPublicIds = imagesToDelete.map((image) => image.public_id);
      try {
        await deleteImages(imagesPublicIds);
        console.log("Image deletion completed.");
      } catch (deleteError) {
        console.error("An error occurred during the image deletion process:", deleteError);
      }
    }

    // transaction session options
    const sessionOptions = { session };

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      { $set: productUpdatedData },
      // `new: true` returns the modified document
      // `runValidators: true` ensures schema validations are run
      { new: true, runValidators: true }
    ).session(session);

    // check if product was updated
    if (!updatedProduct) {
      throw new Error("Server action: Error updating product info");
    } else {
      console.log("Server action: Initial product updated successful");
    }
    console.log('updatedProduct: ------------------', updatedProduct);

    //-- Update or Create new Stock -----------
    // check if stock exists and same in product
    // -- Create new stock for product
    if (!updatedProduct.stock || updatedProduct.stock.toString() !== stockId) {
      console.log('updatedProduct.stock.toString(): ', updatedProduct.stock.toString());
      console.log('stockId: ', stockId);
      const stockData: StockValues = {
        productId: updatedProduct._id,
        sizes: stockItems,
      };
      const newStock = new Stock(stockData);
      await newStock.save(sessionOptions);
      console.log("Server Action: Stock saved. ID:", newStock._id);

      // --- Update Product with Stock ID ---
      const updatedProductWithStock = await Product.findByIdAndUpdate(
        productId,
        { $set: { stock: newStock._id } }, // Use $set to update only the stock field
        { new: true } // Return the updated document
      ).session(session);

      if (!updatedProductWithStock) {
        // in case the product couldn't be found right after creation
        console.error("Server Action: Failed to find and update product with stock ID. Product ID:", updatedProductWithStock._id);
        // delete stock if updated product not found
        await Stock.deleteOne({ _id: newStock._id }, sessionOptions);
        throw new Error("Failed to link stock to product after creation.");
      }
    }

    // -- Update existing stock
    console.log('// -- Update existing stock');
    if (updatedProduct.stock) {
      const updatedStock = await Stock.findByIdAndUpdate(
        stockId,
        { $set: {sizes: stockItems} },
        // `new: true` returns the modified document
        // `runValidators: true` ensures schema validations are run
        { new: true, runValidators: true }
      ).session(session);
      if (!updatedStock) {
        console.log('Server action: Error updating stock info');
        throw new Error("Server action: Error updating stock info");
      } else {
        console.log("Server action: stock updated successful");
      }
    }

    console.log("Server Action: Product updated with Stock ID:", updatedProduct.stock);
    console.log("Server Action: Product update complete.");

    await session.commitTransaction();
    revalidatePath("/", "layout");
    return { status: true, slug: updatedProduct.slug };
    //
  } catch (error) {
    if (session.inTransaction()) {
      // Check if a transaction is active before trying to abort
      await session.abortTransaction();
    }

    if (uploadedImagesData.length > 0) {
      console.log("Rolling back: Deleting uploaded images from Cloudinary...");
      const imagesPublicIds = uploadedImagesData.map((image) => image.public_id);
      try {
        await deleteImages(imagesPublicIds);
        console.log("Image rollback completed.");
      } catch (deleteError) {
        console.error("An error occurred during the image deletion process:", deleteError);
      }
    }

    console.error("Server Action: Error during product/stock creation:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  } finally {
    // end the session in a finally block to ensure it's closed
    // whether the transaction succeeded or failed.
    session.endSession();
  }
}
