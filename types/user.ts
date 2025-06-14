// types/user.ts (or your existing types file where UserContextType is defined)
import mongoose from "mongoose";
import { WishlistItem } from "./wishlist"; // Adjust path if needed

export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  orders?: mongoose.Types.ObjectId[] | null;
  wishlist?: WishlistItem[] | null; // This will hold the populated wishlist items
  cart?: mongoose.Types.ObjectId[] | null;
}

export interface UserContextType {
  // Existing profile state
  profile: UserProfile | null;
  isLoadingProfile: boolean;
  profileError: string | null;

  // NEW: Wishlist state
  wishlist: WishlistItem[]; // Client-side wishlist will be array of {id: string}
  isLoadingWishlist: boolean; // For add/remove operations
  wishlistError: string | null;

  fetchInitialUserData: () => Promise<void>;
  clearUserData: () => void;

  // NEW: Wishlist functions
  addItemToWishlist: (item: WishlistItem) => Promise<void>;
  removeItemFromWishlist: (itemId: string) => Promise<void>;
  isInWishlist: (itemId: string) => boolean;

  // Cart State
  cart: import("./cart").CartType | null;
  isLoadingCart: boolean;
  cartError: string | null;

  // Cart Functions
  fetchCart: () => Promise<void>;

  // Cart Mutations
  addItemToCart: (args: { productId: string; size: string; quantity: number }) => Promise<void>;
}
