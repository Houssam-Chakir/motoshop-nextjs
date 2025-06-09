// types/cart.ts
export interface CartItem {
  id: string; // Unique identifier for the item (e.g., product ID)
  title?: string;
  imageUrl?: string;
  price?: number;
  quantity: number; // Essential for cart items
  slug?: string;
  // Optional: Add fields for product variants if applicable
  // selectedVariant?: {
  //   id: string;
  //   name: string; // e.g., "Color: Red, Size: M"
  //   price?: number; // Variant-specific price, if different
  // };
  identifiers?: { brand: string; categoryType: string; category: string };
}
