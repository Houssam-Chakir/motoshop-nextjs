// types/checkout.ts

export interface CheckoutCartItem {
  productId: string;
  title: string;
  imageUrl?: string;
  slug?: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  originalPrice: number;
  inStock: boolean;
}

export interface FinalCart {
  cartItems: CheckoutCartItem[];
  totalDiscount: number;
  totalPrice: number;
}
