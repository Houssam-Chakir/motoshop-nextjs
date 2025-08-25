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

export interface ICardInfo {
  name: string | null;
  cardNumber: string | null;
  expiry: string | null;
  cvc: string | null;
}

export interface CheckoutDataType {
  number: string | null;
  address: string | null;
  city: string | null;
  email: string | null;
  fullName: string | null;
  shippingFee?: number;
  paymentMethod: "cmi" | "delivery" | "pickup" | null;
  extraDirections?: string | null;
  saveAddress?: boolean | null;
  cardInfo: ICardInfo;
}
