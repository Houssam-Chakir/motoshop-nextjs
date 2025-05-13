'use server'
import Product from "@/models/Product";
import { revalidatePath } from "next/cache";

const deleteProduct = async (productId) => {
  const product = await Product.findByIdAndDelete(productId);
  console.log("product: ", product);
  revalidatePath('/', 'layout')
};

export default deleteProduct;
