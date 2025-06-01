// types/wishlist.ts (or any shared types file)
export interface WishlistItem {
  id: string; // Unique identifier for the item (e.g., product ID)
  title?: string; // Title of the item, typically from database
  imageUrl?: string; // Optional
  // Add any other minimal details you want to store locally
}
