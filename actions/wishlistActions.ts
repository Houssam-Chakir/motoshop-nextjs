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
  console.log('[ServerAction] addItemToDbWishlistAction invoked. Item ID:', itemId);
  try {
    const sessionUser = await getSessionUser();
    console.log('[ServerAction] Session User:', sessionUser);

    if (!sessionUser?.userId) {
      console.log('[ServerAction] User not authenticated or userId missing.');
      return { success: false, message: 'Unauthorized. Please sign in.' };
    }

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      console.log('[ServerAction] Invalid Item ID:', itemId);
      return { success: false, message: 'Invalid Item ID provided.' };
    }

    console.log('[ServerAction] Connecting to DB...');
    await connectDB();
    console.log('[ServerAction] DB Connected. User ID:', sessionUser.userId);

    const objectItemId = new mongoose.Types.ObjectId(itemId);

    console.log('[ServerAction] Attempting to update User:', sessionUser.userId, 'with Item:', objectItemId.toString());
    const updateResult = await User.updateOne(
      { _id: sessionUser.userId },
      { $addToSet: { wishlist: objectItemId } }
    );
    console.log('[ServerAction] Mongoose updateResult:', updateResult);

    if (updateResult.matchedCount === 0) {
      console.log('[ServerAction] User not found in DB with ID:', sessionUser.userId);
      return { success: false, message: 'User not found.' };
    }

    const wasModified = updateResult.modifiedCount > 0;
    console.log('[ServerAction] Item was modified in DB:', wasModified);

    if (wasModified) {
      console.log('[ServerAction] Revalidating path');
      revalidatePath('/');
    }

    return {
      success: true,
      message: wasModified ? 'Item added to wishlist in DB.' : 'Item already in wishlist in DB.',
      wasModified,
    };
  } catch (error) {
    console.error('[ServerAction] Critical error in addItemToDbWishlistAction:', error);
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
      { $pull: { wishlist: objectItemId } } // Ensure 'wishlistItems' is the correct field name
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
