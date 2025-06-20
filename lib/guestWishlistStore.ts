"use client";

// lib/guestWishlistStore.ts

const GUEST_WISHLIST_KEY = "guestWishlist";

// Define the structure for a guest wishlist item
export interface GuestWishlistItem {
  id: string;
  title: string;
  identifiers: {
    brand: string;
    categoryType: string;
    category: string;
    _id: string; // This is the identifier's own ID from the ProductCard interface
  };
  retailPrice: number;
  // Consider adding imageUrl if it's small or essential for a quick view, e.g.:
  imageUrl?: string;
  slug: string;
  quantity: number
  salePrice?: number
}

/**
 * Retrieves the guest wishlist from local storage.
 * @returns {GuestWishlistItem[]} An array of wishlist items or an empty array if none exists or in SSR.
 */
export const getGuestWishlist = (): GuestWishlistItem[] => {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const storedWishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
    return storedWishlist ? JSON.parse(storedWishlist) : [];
  } catch (error) {
    console.error("Error retrieving guest wishlist from localStorage:", error);
    return [];
  }
};

/**
 * Adds an item to the guest wishlist in local storage.
 * @param {GuestWishlistItem} item - The wishlist item object to add.
 */
export const addItemToGuestWishlist = (item: GuestWishlistItem): void => {
  console.log('item to add to guest wishlist:', item);
  if (typeof window === "undefined") return;
  try {
    const currentWishlist = getGuestWishlist();
    if (!currentWishlist.some((existingItem) => existingItem.id === item.id)) {
      const updatedWishlist = [...currentWishlist, item];
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updatedWishlist));
      window.dispatchEvent(new CustomEvent("guestWishlistChanged"));
    }
  } catch (error) {
    console.error("Error adding item to guest wishlist in localStorage:", error);
  }
};

/**
 * Removes an item from the guest wishlist in local storage.
 * @param {string} itemId - The ID of the item to remove.
 */
export const removeItemFromGuestWishlist = (itemId: string): void => {
  if (typeof window === "undefined") return;
  try {
    const currentWishlist = getGuestWishlist();
    const updatedWishlist = currentWishlist.filter((itemInStorage) => itemInStorage.id !== itemId);
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updatedWishlist));
    window.dispatchEvent(new CustomEvent("guestWishlistChanged"));
  } catch (error) {
    console.error("Error removing item from guest wishlist in localStorage:", error);
  }
};

/**
 * Checks if an item is in the guest wishlist.
 * @param {string} itemId - The ID of the item to check.
 * @returns {boolean} True if the item is in the wishlist, false otherwise.
 */
export const isItemInGuestWishlist = (itemId: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    const currentWishlist = getGuestWishlist();
    return currentWishlist.some((itemInStorage) => itemInStorage.id === itemId);
  } catch (error) {
    console.error("Error checking item in guest wishlist:", error);
    return false;
  }
};

/**
 * Clears the guest wishlist from local storage.
 */
export const clearGuestWishlist = (): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    console.log("Guest wishlist cleared from local storage.");
    window.dispatchEvent(new CustomEvent("guestWishlistChanged"));
  } catch (error) {
    console.error("Error clearing guest wishlist from localStorage:", error);
  }
};
