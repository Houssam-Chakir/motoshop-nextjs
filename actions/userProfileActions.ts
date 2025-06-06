"use server";

import connectDB from "@/config/database";
import User from "@/models/User";
import { UserProfile } from "@/types/user";
import { Types } from "mongoose";

interface ActionResult {
  success: boolean;
  data?: UserProfile | null;
  message?: string;
}

export async function getMyDetailedProfile(userId: string): Promise<ActionResult> {
  if (!userId) {
    return { success: false, message: "User ID is required." };
  }

  try {
    await connectDB();
    // Populate user wishlist with product details
    const userFromDb = await User.findById(userId).populate("wishlist").lean();
    console.log("user from db:", userFromDb);

    if (!userFromDb) {
      return { success: false, message: "User not found." };
    }

    // Add this check to ensure userFromDb is not an array
    if (Array.isArray(userFromDb)) {
      // This scenario is unexpected for findById
      console.error("Error fetching detailed profile: Expected a single user document, but received an array.");
      return { success: false, message: "Unexpected data format for user." };
    }

    // At this point, TypeScript knows userFromDb is a single object
    const profileData: UserProfile = {
      id: (userFromDb._id as Types.ObjectId).toString(),
      name: userFromDb.name || null,
      email: userFromDb.email || null,
      image: userFromDb.image || null,
      role: userFromDb.role || null,
      orders: userFromDb.orders || null,
      wishlist: userFromDb.wishlist
        ? (userFromDb.wishlist as any[]).map((item: any) => ({
            id: item._id ? item._id.toString() : "", // Ensure _id exists and convert to string
            title: item.title,
            imageUrl: item.images && item.images[0] ? item.images[0].secure_url : undefined,
            retailPrice: item.retailPrice,
            identifiers: item.identifiers, // Assuming structure matches
            slug: item.slug,
            inStock: item.inStock,
          }))
        : null,
      cart: userFromDb.cart || null,
    };

    return { success: true, data: profileData, message: "Profile fetched successfully." };
  } catch (error) {
    console.error("Error fetching detailed profile:", error);
    let errorMessage = "An unexpected server error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { success: false, message: `Server Error: ${errorMessage}` };
  }
}
