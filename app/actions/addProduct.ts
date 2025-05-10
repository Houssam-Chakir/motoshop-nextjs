"use server";

import { ProductType } from "@/models/Product";

export default async function addNewProduct(values) {
  console.log("values: ", values);
  const { brand, model: productModel, title, category, type, season, wholesalePrice, retailPrice, stockItems, description, specification: specs, images: imageFiles } = values;
  const images = imageFiles.filter((image: { name: string }) => image.name !== "").map((image: { name: string }) => image.name);

  // const stock = {

  // }

  const newProduct: ProductType = {
    brand,
    productModel,
    title,
    category,
    type,
    season,
    wholesalePrice,
    retailPrice,
    // stock: should have newly created stock id
    description,
    specs,
    // images cloudinary urls, for now just simple names
    images,
    barcode: "GENERATED_BARCODE", // Replace with actual barcode generation logic
    sku: "GENERATED_SKU", // Replace with actual SKU generation logic
    slug: title.toLowerCase().replace(/ /g, "-"), // Example slug generation
    saleInfo: { discount: 0, isOnSale: false }, // Replace with actual sale info
    createdAt: new Date().toISOString(), // Example creation date
    updatedAt: new Date().toISOString(), // Example update date
  };
  console.log(newProduct)

  // validate session
  // data formating and validation
  // make sure all ids refere to existing documents
  //generate SKU, BARCODE
  // validate images and upload them , TODO later
}
