'use server';

import connectDB from '@/config/database'; // Adjust path as needed
import User, { UserType } from '@/models/User'; // Adjust path and import UserType if defined
import { getSessionUser } from '@/utils/getSessionUser'; // Adjust path as needed
import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache'; // Optional: for revalidating cached pages

interface ActionResult {
  success: boolean;
  message: string;
  wasAdded?: boolean; // Indicates if the item was newly added or already existed
}

/**
 * Server Action to add an item to the logged-in user's wishlist in the database.
 * Uses $addToSet to ensure the item is only added if it's not already present.
 *
 * @param itemId - The string ID of the item to add to the wishlist.
 * @returns ActionResult object indicating success or failure.
 */
export async function addItemToWishlistAction(itemId: string): Promise<ActionResult> {
  try {
    // 1. Connect to the database
    await connectDB();

    // 2. Get the current authenticated user
    const sessionUser = await getSessionUser();
    if (!sessionUser?.userId) {
      return { success: false, message: 'Unauthorized. Please sign in to add items to your wishlist.' };
    }

    // 3. Validate the itemId
    if (!itemId) {
      return { success: false, message: 'Item ID is required.' };
    }
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return { success: false, message: 'Invalid Item ID format.' };
    }

    const userId = sessionUser.userId;
    const objectItemId = new mongoose.Types.ObjectId(itemId);

    // 4. Perform the update operation using $addToSet
    const updateResult = await User.updateOne(
      { _id: userId },                             // Filter: find the user by their ID
      { $addToSet: { wishlist: objectItemId } } // Update: add the item ID to the 'wishlistItems' array if not already present
    );

    // 5. Check the result of the update operation
    if (updateResult.matchedCount === 0) {
      return { success: false, message: 'User not found. Could not update wishlist.' };
    }

    const wasItemNewlyAdded = updateResult.modifiedCount > 0;

    if (wasItemNewlyAdded) {
      revalidatePath('/wishlist');
      revalidatePath('/');
      revalidatePath(`/products`);
      revalidatePath(`/products/${itemId}`);

      return { success: true, message: 'Item successfully added to your wishlist!', wasAdded: true };
    } else {
      return { success: true, message: 'This item is already in your wishlist.', wasAdded: false };
    }

  } catch (error) {
    console.error('Error in addItemToWishlistAction:', error);
    let errorMessage = 'An unexpected error occurred while adding the item to your wishlist.';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return { success: false, message: `Server error: ${errorMessage}` };
  }
}
