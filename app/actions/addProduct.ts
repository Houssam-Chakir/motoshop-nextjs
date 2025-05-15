"use server";

import connectDB from "@/config/database";
import { getSessionUser } from "@/utils/getSessionUser";
import mongoose from "mongoose";
import Product from "../../models/Product";
import Stock from "@/models/Stock";
import { revalidatePath } from "next/cache";
import imageUploader from "@/utils/imageUploadCloudinary";
import isUserAdmin from "@/utils/isUserAuthorized";
import isUserAuthorized from "@/utils/isUserAuthorized";

interface ProductValues {
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
  images: File[];
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
  images: string[];
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

//f/ ADD NEW PRODUCT FUNCTION ---------------------------------------------------
export default async function addNewProduct(values: ProductValues): Promise<void> {
  try {
    await connectDB();

    // --- Authentication/Authorization -----------------
    const requiredRole = 'admin'
    await isUserAuthorized(requiredRole)

    console.log("Server Action: Received values: ", values);

    const { stockItems, identifiers, brand, productModel, title, category, type, season, wholesalePrice, retailPrice, description, specifications, images: imageFiles } = values;
    const images = imageFiles.filter((image: { name: string }) => image.name !== "");

    // -- Create new product data -----------------------
    const productData: ProductObject = {
      brand,
      productModel,
      identifiers,
      title,
      category,
      type,
      season,
      wholesalePrice,
      retailPrice,
      // stock: should have newly created stock id
      description,
      specifications,
      images: [], // Initialize images as an empty array
      createdAt: new Date(), // Example creation date
      updatedAt: new Date(), // Example update date
    };

    // -- Upload images to cloudinary and add secure urls array to productData --------
    productData.images = await imageUploader(images);
    //TODO Delete images incase of product saving error

    console.log("productData:", productData);
    // -- Create new product to DB
    const newProduct = new Product(productData);
    await newProduct.save();

    // -- Create new stock for product
    const stockData: StockValues = {
      productId: newProduct._id,
      sizes: stockItems,
    };
    const newStock = new Stock(stockData);
    await newStock.save();
    console.log("Server Action: Stock saved. ID:", newStock._id);

    // --- Update Product with Stock ID ---
    // Use findByIdAndUpdate
    const updatedProduct = await Product.findByIdAndUpdate(
      newProduct._id,
      { $set: { stock: newStock._id } }, // Use $set to update only the stock field
      { new: true } // Return the updated document
    );

    if (!updatedProduct) {
      // in case the product couldn't be found right after creation
      console.error("Server Action: Failed to find and update product with stock ID. Product ID:", newProduct._id);
      // delete stock if updated product not found
      await newStock.deleteOne();
      throw new Error("Failed to link stock to product after creation.");
    }

    console.log("Server Action: Product updated with Stock ID:", updatedProduct.stock);
    console.log("Server Action: Product creation complete.");

    revalidatePath("/", "layout");
  } catch (error) {
    console.error("Server Action: Error during product/stock creation:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error("An unknown error occurred");
    }
  }
}
