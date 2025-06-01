import { WishlistItem } from '@/types/wishlist';

const LOCAL_WISHLIST_KEY = 'motoshop-wishlist'; // Choose a unique key for your app

/**
 * Retrieves the current wishlist from localStorage.
 * @returns {WishlistItem[]} An array of wishlist items, or an empty array if none exists or on error.
 */
export function getWishlistFromLocalStorage(): WishlistItem[] {
  // Ensure this code only runs on the client-side
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const storedWishlist = window.localStorage.getItem(LOCAL_WISHLIST_KEY);
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.error("Error reading wishlist from localStorage:", error);
    return []; // Return empty array on error to prevent crashes
  }
}

/**
 * Saves the given wishlist array to localStorage.
 * @param {WishlistItem[]} wishlist - The wishlist array to save.
 */
function saveWishlistToLocalStorage(wishlist: WishlistItem[]): void {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.localStorage.setItem(LOCAL_WISHLIST_KEY, JSON.stringify(wishlist));
  } catch (error) {
    console.error("Error saving wishlist to localStorage:", error);
  }
}

/**
 * Adds an item to the wishlist in localStorage.
 * Ensures uniqueness based on item ID.
 * @param {WishlistItem} newItem - The item to add.
 * @returns {WishlistItem[]} The updated wishlist array.
 */
export function addItemToLocalStorageWishlist(newItem: WishlistItem): WishlistItem[] {
  if (typeof window === 'undefined') {
    // This function should only be called client-side, but as a safeguard:
    console.warn("Attempted to add to localStorage wishlist on the server.");
    return [];
  }

  if (!newItem || !newItem.id) {
    console.error("Invalid item: Cannot add to wishlist without an ID.");
    return getWishlistFromLocalStorage(); // Return current wishlist without changes
  }

  const currentWishlist = getWishlistFromLocalStorage();

  // Check if the item already exists in the wishlist
  const itemExists = currentWishlist.some(item => item.id === newItem.id);

  if (itemExists) {
    // Item already in wishlist, return the current wishlist without changes
    return currentWishlist;
  } else {
    // Item not in wishlist, add it
    const updatedWishlist = [...currentWishlist, newItem];
    saveWishlistToLocalStorage(updatedWishlist);
    return updatedWishlist;
  }
}

/**
 * Removes an item from the wishlist in localStorage by its ID.
 * @param {string} itemIdToRemove - The ID of the item to remove.
 * @returns {WishlistItem[]} The updated wishlist array.
 */
export function removeItemFromLocalStorageWishlist(itemIdToRemove: string): WishlistItem[] {
  if (typeof window === 'undefined') {
    console.warn("Attempted to remove from localStorage wishlist on the server.");
    return [];
  }

  if (!itemIdToRemove) {
    console.error("Invalid item ID: Cannot remove from wishlist.");
    return getWishlistFromLocalStorage();
  }

  const currentWishlist = getWishlistFromLocalStorage();
  const updatedWishlist = currentWishlist.filter(item => item.id !== itemIdToRemove);

  // Only update localStorage if a change actually occurred
  if (updatedWishlist.length < currentWishlist.length) {
    saveWishlistToLocalStorage(updatedWishlist);
  }
  return updatedWishlist;
}

/**
 * Clears the entire wishlist from localStorage.
 */
export function clearLocalStorageWishlist(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(LOCAL_WISHLIST_KEY);
}
