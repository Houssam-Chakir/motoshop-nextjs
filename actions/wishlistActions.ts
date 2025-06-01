// app/actions/wishlistActions.ts
'use server';

import connectDB from '@/config/database';
import User from '@/models/User'; // Your Mongoose User model
import { getSessionUser } from '@/utils/getSessionUser'; // Your utility for session
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

// Interface for the result of these actions
interface WishlistActionResult {
  success: boolean;
  message: string;
  wasModified?: boolean; // Indicates if the DB document was actually changed
}

/**
 * Adds an item to the logged-in user's wishlist in the database.
 * Uses $addToSet to ensure uniqueness.
 * Assumes User model has a field like 'wishlistItems: [mongoose.Schema.Types.ObjectId]'
 */
export async function addItemToDbWishlistAction(itemId: string): Promise<WishlistActionResult> {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return { success: false, message: 'Unauthorized. Please sign in.' };
    }

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, message: 'Invalid Item ID provided.' };
    }

    await connectDB();
    const objectItemId = new mongoose.Types.ObjectId(itemId);

    const updateResult = await User.updateOne(
      { _id: sessionUser.userId },
      { $addToSet: { wishlistItems: objectItemId } } // Ensure 'wishlistItems' is the correct field name in your User schema
    );

    if (updateResult.matchedCount === 0) {
      return { success: false, message: 'User not found.' };
    }

    const wasModified = updateResult.modifiedCount > 0;
    if (wasModified) {
      revalidatePath('/wishlist'); // Example path, adjust as needed
      // revalidatePath(`/products/${itemId}`); // If product page shows wishlist status
    }

    return {
      success: true,
      message: wasModified ? 'Item added to wishlist.' : 'Item is already in wishlist.',
      wasModified,
    };
  } catch (error) {
    console.error('Error in addItemToDbWishlistAction:', error);
    const msg = error instanceof Error ? error.message : 'Server error occurred while adding to wishlist.';
    return { success: false, message: msg };
  }
}

/**
 * Removes an item from the logged-in user's wishlist in the database.
 * Assumes User model has a field like 'wishlistItems: [mongoose.Schema.Types.ObjectId]'
 */
export async function removeItemFromDbWishlistAction(itemId: string): Promise<WishlistActionResult> {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return { success: false, message: 'Unauthorized. Please sign in.' };
    }

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, message: 'Invalid Item ID provided.' };
    }

    await connectDB();
    const objectItemId = new mongoose.Types.ObjectId(itemId);

    const updateResult = await User.updateOne(
      { _id: sessionUser.userId },
      { $pull: { wishlistItems: objectItemId } } // Ensure 'wishlistItems' is the correct field name
    );

    if (updateResult.matchedCount === 0) {
      return { success: false, message: 'User not found.' };
    }

    const wasModified = updateResult.modifiedCount > 0;
    if (wasModified) {
      revalidatePath('/wishlist'); // Example path, adjust as needed
      // revalidatePath(`/products/${itemId}`);
    }

    return {
      success: true,
      message: wasModified ? 'Item removed from wishlist.' : 'Item not found in wishlist to remove.',
      wasModified,
    };
  } catch (error) {
    console.error('Error in removeItemFromDbWishlistAction:', error);
    const msg = error instanceof Error ? error.message : 'Server error occurred while removing from wishlist.';
    return { success: false, message: msg };
  }
}
