"use client";

// lib/guestWishlistStore.ts

const GUEST_WISHLIST_KEY = "guestWishlist";

/**
 * Retrieves the guest wishlist from local storage.
 * @returns {string[]} An array of item IDs or an empty array if none exists or in SSR.
 */
export const getGuestWishlist = (): string[] => {
  if (typeof window === "undefined") {
    return []; // Return empty array during SSR or if window is not available
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
 * @param {string} itemId - The ID of the item to add.
 */
export const addItemToGuestWishlist = (itemId: string): void => {
  if (typeof window === "undefined") return;
  try {
    const currentWishlist = getGuestWishlist();
    if (!currentWishlist.includes(itemId)) {
      const updatedWishlist = [...currentWishlist, itemId];
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updatedWishlist));
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
    const updatedWishlist = currentWishlist.filter((id) => id !== itemId);
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(updatedWishlist));
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
    return currentWishlist.includes(itemId);
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
  } catch (error) {
    console.error("Error clearing guest wishlist from localStorage:", error);
  }
};
