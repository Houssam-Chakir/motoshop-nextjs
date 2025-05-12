"use server";

import connectDB from "@/config/database";
import User from "@/models/User";
import { getSessionUser } from "@/utils/getSessionUser";
import mongoose from "mongoose";
import Product from "../../models/Product";

interface AddProductValues {
  brand: mongoose.Types.ObjectId;
  slug: string;
  productModel: string;
  title: string;
  identifiers: { brand: string; categoryType: string; category: string };
  category: mongoose.Types.ObjectId;
  type: mongoose.Types.ObjectId;
  season: "All seasons" | "Summer" | "Winter" | "Spring/Fall";
  wholesalePrice: number;
  retailPrice: number;
  stock: mongoose.Types.ObjectId; // Replace `any` with a more specific type if available
  description: string; // Replace `any` with a more specific type if available
  specifications?: { name: string; description: string }; // Replace `any` with a more specific type if available
  images: { name: string }[] | { url: string; altText: string };
  createdAt?: Date;
  updatedAt?: Date;
}

export default async function addNewProduct(values: AddProductValues): Promise<void> {
  try {
    await connectDB();

    // --- Authentication/Authorization ---
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.userId) {
        throw new Error("User session not found or invalid");
    }
    const { userId } = sessionUser;
    const user = await User.findById(userId);
    if (!user || user.role !== "admin") {
        throw new Error("Unauthorized: Admin privileges required");
    }

    console.log("Server Action: Received values: ", values);

    const { identifiers, brand, model: productModel, title, category, type, season, wholesalePrice, retailPrice, description, specifications, images: imageFiles } = values;
    console.log("specifications: ", specifications);
    const images = imageFiles.filter((image: { name: string }) => image.name !== "").map((image: { name: string }) => ({ url: image.name, altText: image.name }));

    const productData: AddProductValues = {
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
      stock: new mongoose.Types.ObjectId(userId),
      // images cloudinary urls, for now just simple names
      images,
      slug: title.toLowerCase().replace(/ /g, "-"), // Example slug generation
      createdAt: new Date(), // Example creation date
      updatedAt: new Date(), // Example update date
    };
    console.log("productData: look for identifiers before new Product", productData);
    const newProduct = new Product(productData);
    newProduct.save();
  } catch (error) {}
  //TODO create stock for product and link them

  // redirect(`/products/${newProduct._id}`)
  // validate session
  // data formating and validation
  // make sure all ids refere to existing documents
  //generate SKU, BARCODE
  // validate images and upload them , TODO later
}
