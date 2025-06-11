import { ProductDocument } from "@/models/Product"; // Assuming ProductDocument is exported from your models

const GUEST_CART_KEY = "guestCart";

// Interface for a single product item within the guest cart
export interface GuestCartProductItem {
  productId: string; // Corresponds to ProductDocument._id.toString()
  title: string;
  slug?: string;
  imageUrl?: string; // From ProductDocument.images[0].secure_url
  size: string; // User-selected size
  quantity: number;
  unitPrice: number; // From ProductDocument.retailPrice
  totalPrice: number; // Calculated as quantity * unitPrice
  inStock: boolean; // From ProductDocument.inStock
  brand?: string; // From ProductDocument.identifiers.brand
}

// Interface for the overall guest cart stored in sessionStorage
export interface GuestCart {
  products: GuestCartProductItem[];
  totalQuantity: number; // Total number of individual items in the cart
  totalAmount: number; // Total monetary value of the cart
}

// Helper function to calculate totals for the cart
const calculateCartTotals = (products: GuestCartProductItem[]): { totalQuantity: number; totalAmount: number } => {
  let totalQuantity = 0;
  let totalAmount = 0;
  products.forEach((item) => {
    totalQuantity += item.quantity;
    totalAmount += item.totalPrice;
  });
  return { totalQuantity, totalAmount };
};

/**
 * Retrieves the guest cart from sessionStorage.
 * Returns an empty cart structure if no cart is found or on error.
 */
export const getGuestCart = (): GuestCart => {
  if (typeof window === "undefined") {
    return { products: [], totalQuantity: 0, totalAmount: 0 };
  }
  try {
    const storedCart = sessionStorage.getItem(GUEST_CART_KEY);
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart) as GuestCart;
      // Recalculate totals to ensure data integrity, though they should be stored correctly
      const { totalQuantity, totalAmount } = calculateCartTotals(parsedCart.products);
      return { ...parsedCart, totalQuantity, totalAmount };
    }
  } catch (error) {
    console.error("Error retrieving guest cart from sessionStorage:", error);
  }
  return { products: [], totalQuantity: 0, totalAmount: 0 };
};

/**
 * Saves the guest cart to sessionStorage and dispatches a change event.
 */
const saveGuestCart = (cart: GuestCart): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent("guestCartChanged", { detail: cart }));
  } catch (error) {
    console.error("Error saving guest cart to sessionStorage:", error);
  }
};

/**
 * Adds an item to the guest cart or updates its quantity if it already exists (for the same size).
 * @param product The full product object (ProductDocument or similar structure)
 * @param size The selected size for the product.
 * @param quantity The quantity to add.
 */
export const addItemToGuestCart = (
  product: Pick<ProductDocument, "_id" | "title" | "slug" | "images" | "retailPrice" | "inStock" | "identifiers" | "brand">,
  size: string,
  quantity: number
): { success: boolean; message: string } => {
  if (typeof window === "undefined") {
    return { success: false, message: "Cannot add to cart from server." };
  }
  if (quantity <= 0) {
    return { success: false, message: "Quantity must be positive." };
  }
  if (!size) {
    return { success: false, message: "Please select a size." };
  }

  const cart = getGuestCart();
  const productIdStr = (product._id as any).toString();
  const existingItemIndex = cart.products.findIndex((item) => item.productId === productIdStr && item.size === size);

  if (existingItemIndex > -1) {
    // Item with the same ID and size exists, update quantity
    cart.products[existingItemIndex].quantity += quantity;
    cart.products[existingItemIndex].totalPrice = cart.products[existingItemIndex].quantity * cart.products[existingItemIndex].unitPrice;
  } else {
    // Item does not exist, add as new
    const newItem: GuestCartProductItem = {
      productId: productIdStr,
      title: product.title,
      slug: product.slug,
      imageUrl: product.images && product.images.length > 0 ? product.images[0].secure_url : undefined,
      size,
      quantity,
      unitPrice: product.retailPrice,
      totalPrice: product.retailPrice * quantity,
      inStock: product.inStock,
      brand: product.identifiers?.brand,
    };
    cart.products.push(newItem);
  }

  const { totalQuantity, totalAmount } = calculateCartTotals(cart.products);
  saveGuestCart({ ...cart, totalQuantity, totalAmount });

  return { success: true, message: "Item added to guest cart successfully." };
};

/**
 * Removes an item (identified by productId and size) from the guest cart.
 * @param productId The ID of the product to remove.
 * @param size The size of the product to remove.
 */
export const removeItemFromGuestCart = (productId: string, size: string): void => {
  if (typeof window === "undefined") return;
  const cart = getGuestCart();
  cart.products = cart.products.filter((item) => !(item.productId === productId && item.size === size));
  const { totalQuantity, totalAmount } = calculateCartTotals(cart.products);
  saveGuestCart({ ...cart, totalQuantity, totalAmount });
};

/**
 * Updates the quantity of a specific item in the guest cart.
 * If newQuantity is 0 or less, the item is removed.
 * @param productId The ID of the product to update.
 * @param size The size of the product to update.
 * @param newQuantity The new quantity for the item.
 */
export const updateItemQuantityInGuestCart = (productId: string, size: string, newQuantity: number): void => {
  if (typeof window === "undefined") return;

  if (newQuantity <= 0) {
    removeItemFromGuestCart(productId, size);
    return;
  }

  const cart = getGuestCart();
  const itemIndex = cart.products.findIndex((item) => item.productId === productId && item.size === size);

  if (itemIndex > -1) {
    cart.products[itemIndex].quantity = newQuantity;
    cart.products[itemIndex].totalPrice = newQuantity * cart.products[itemIndex].unitPrice;
    const { totalQuantity, totalAmount } = calculateCartTotals(cart.products);
    saveGuestCart({ ...cart, totalQuantity, totalAmount });
  } else {
    console.warn("Attempted to update quantity for an item not in guest cart:", { productId, size });
  }
};

/**
 * Clears the entire guest cart from sessionStorage.
 */
export const clearGuestCart = (): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new CustomEvent("guestCartChanged", { detail: { products: [], totalQuantity: 0, totalAmount: 0 } }));
    console.log("Guest cart cleared from sessionStorage.");
  } catch (error) {
    console.error("Error clearing guest cart from sessionStorage:", error);
  }
};
