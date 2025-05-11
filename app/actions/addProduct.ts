"use server";

import connectDB from "@/config/database";
import { ProductType } from "@/models/Product";
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
  description: string;
  specs: { name: string; description: string }; // Replace `any` with a more specific type if available
  images: { name: string }[] | { url: string; altText: string };
}

export default async function addNewProduct(values: AddProductValues): Promise<void> {
  //TODO create stock for product and link them
  await connectDB();

  // get session user
  const sessionUser = await getSessionUser();
  if (!sessionUser || !sessionUser.userId) throw new Error("Cant get session user");
  const { userId } = sessionUser;

  //check if user is admin
  const user = await User.findById(userId);
  console.log("user: ", user);
  if (user.role !== "admin") throw new Error("Only admins can do this operation");

  console.log("values: ", values);
  const { identifiers, brand, model: productModel, title, category, type, season, wholesalePrice, retailPrice, description, specification: specs, images: imageFiles } = values;
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
    specs,
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

  // redirect(`/products/${newProduct._id}`)
  // validate session
  // data formating and validation
  // make sure all ids refere to existing documents
  //generate SKU, BARCODE
  // validate images and upload them , TODO later
}
