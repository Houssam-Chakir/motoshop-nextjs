import connectDB from "@/config/database";
import Brand from "@/models/Brand";
import { unstable_cache as nextCache } from "next/cache";
import convertToSerializableObject from "@/utils/convertToObj";
import Type from "@/models/Type";
import Category from "@/models/Category";

/**
 * Fetches and caches the list of Brands / types / Categories.
 * Uses nextCache for deduplication across requests and provides tagging for on-demand revalidation.
 */
export const getCachedBrands = nextCache(
  async () => {
    console.log("Fetching brands from database...");
    await connectDB();
    const brandsDoc = await Brand.find({}).lean().exec();
    const brands = convertToSerializableObject(brandsDoc) as { _id: string; name: string }[];

    return brands;
  },
  ["all_brands_list"], // A unique key for this cached data. Can be more dynamic if needed.
  {
    tags: ["brands"], // Tag for on-demand revalidation (e.g., when a brand is added/updated)
    revalidate: 3600, // Optional: Time-based revalidation in seconds (e.g., 1 hour).
    // If not set, it might cache indefinitely until manually revalidated or a new deployment occurs.
  }
);
//
export const getCachedTypes = nextCache(
  async () => {
    console.log("Fetching types from database...");
    await connectDB();
    const TypesDoc = await Type.find({}).lean().exec();
    const Types = convertToSerializableObject(TypesDoc) as { _id: string; name: string }[];

    return Types;
  },
  ["all_types_list"], // A unique key for this cached data. Can be more dynamic if needed.
  {
    tags: ["types"], // Tag for on-demand revalidation (e.g., when a brand is added/updated)
    revalidate: 3600, // Optional: Time-based revalidation in seconds (e.g., 1 hour).
    // If not set, it might cache indefinitely until manually revalidated or a new deployment occurs.
  }
);
//
export const getCachedCategories = nextCache(
  async () => {
    console.log("Fetching Categories from database...");
    await connectDB();
    const categoriesDoc = await Category.find({}).lean().exec();
    const categories = convertToSerializableObject(categoriesDoc) as { _id: string; name: string }[];

    return categories;
  },
  ["all_categories_list"], // A unique key for this cached data. Can be more dynamic if needed.
  {
    tags: ["categories"], // Tag for on-demand revalidation (e.g., when a brand is added/updated)
    revalidate: 3600, // Optional: Time-based revalidation in seconds (e.g., 1 hour).
    // If not set, it might cache indefinitely until manually revalidated or a new deployment occurs.
  }
);
