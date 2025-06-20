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

// For Authenticated User Cart (from database)
export interface CartProductItemType {
  productId: {
    _id: string;
    title: string;
    images: { secure_url: string; public_id?: string }[];
    retailPrice: number;
    slug: string;
    // Populated fields from getCart action
    saleInfo?: {
      name: string;
      discountType: "percentage" | "fixed";
      discountValue: number;
      isActive: boolean;
    } | null;
    stock?: {
      sizes: {
        size: string;
        quantity: number;
        inStock: boolean;
      }[];
    };
  };
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string | Date;
}

export interface CartType {
  _id: string;
  userId: string;
  products: CartProductItemType[];
  quantity: number;
  totalAmount: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
