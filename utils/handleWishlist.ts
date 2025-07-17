import { addItemToGuestWishlist, isItemInGuestWishlist, removeItemFromGuestWishlist } from "@/lib/guestWishlistStore";
import { WishlistItem } from "@/types/wishlist";

interface HandleWishlistParams {
  wishlistProduct: WishlistItem;
  isLoggedIn: boolean;
  isInWishlist: (id: string) => boolean;
  removeItemFromWishlist: (id: string) => void;
  addItemToWishlist: (item: WishlistItem) => void;
  isGuestItemInWishlist: boolean;
  setIsGuestItemInWishlist: (inWishlist: boolean) => void;
}

export const handleWishlistProcess = (params: HandleWishlistParams) => {
  const { wishlistProduct, isLoggedIn, isInWishlist, removeItemFromWishlist, addItemToWishlist, isGuestItemInWishlist, setIsGuestItemInWishlist } = params;
  if (isLoggedIn) {
    if (isInWishlist(wishlistProduct.id)) {
      console.log("[ProductCard] Logged in: removing Item From DB Wishlist", wishlistProduct.id);
      removeItemFromWishlist(wishlistProduct.id);
    } else {
      console.log("[ProductCard] Logged in: adding Item to DB Wishlist", wishlistProduct.id);
      addItemToWishlist(wishlistProduct);
    }
  } else {
    // Guest user: interact with localStorage
    if (isGuestItemInWishlist) {
      console.log("[ProductCard] Guest: removing Item From Local Wishlist", wishlistProduct.id);
      removeItemFromGuestWishlist(wishlistProduct.id);
    } else {
      console.log("[ProductCard] Guest: adding Item to Local Wishlist", wishlistProduct.id);
      addItemToGuestWishlist(wishlistProduct);
    }
    // Update local state for guest after action
    setIsGuestItemInWishlist(isItemInGuestWishlist(wishlistProduct.id));
  }
};
