// lib/guestCartStore.ts
"use client";

import { CartItem } from "@/types/cart";

const GUEST_CART_KEY = "guestCart";

// Helper to get cart from localStorage
const getCartFromStorage = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const storedCart = localStorage.getItem(GUEST_CART_KEY);
  return storedCart ? JSON.parse(storedCart) : [];
};

// Helper to save cart to localStorage and dispatch event
const saveCartToStorage = (cart: CartItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("guestCartChanged"));
};

export const getGuestCart = (): CartItem[] => {
  return getCartFromStorage();
};

export const addItemToGuestCart = (itemToAdd: CartItem): void => {
  const cart = getCartFromStorage();
  const existingItemIndex = cart.findIndex((item) => item.id === itemToAdd.id /* && item.selectedVariant?.id === itemToAdd.selectedVariant?.id */); // Add variant check if needed

  if (existingItemIndex > -1) {
    // Item exists, update quantity
    cart[existingItemIndex].quantity += itemToAdd.quantity;
  } else {
    // Item does not exist, add new item
    cart.push(itemToAdd);
  }
  saveCartToStorage(cart);
};

export const removeItemFromGuestCart = (itemId: string /*, variantId?: string */): void => {
  let cart = getCartFromStorage();
  cart = cart.filter((item) => {
    // const isSameVariant = variantId ? item.selectedVariant?.id === variantId : true;
    return !(item.id === itemId /* && isSameVariant */);
  });
  saveCartToStorage(cart);
};

export const updateGuestCartItemQuantity = (itemId: string, quantity: number /*, variantId?: string */): void => {
  const cart = getCartFromStorage();
  const itemIndex = cart.findIndex((item) => item.id === itemId /* && item.selectedVariant?.id === variantId */);

  if (itemIndex > -1) {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.splice(itemIndex, 1);
    } else {
      cart[itemIndex].quantity = quantity;
    }
    saveCartToStorage(cart);
  }
};

export const isItemInGuestCart = (itemId: string /*, variantId?: string */): boolean => {
  const cart = getCartFromStorage();
  return cart.some((item) => item.id === itemId /* && item.selectedVariant?.id === variantId */);
};

export const clearGuestCart = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new CustomEvent("guestCartChanged"));
  console.log("[GuestCartStore] Guest cart cleared from local storage.");
};

export const getGuestCartTotalItems = (): number => {
  const cart = getCartFromStorage();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

export const getGuestCartSubtotal = (): number => {
  const cart = getCartFromStorage();
  return cart.reduce((subtotal, item) => {
    const price = /* item.selectedVariant?.price ?? */ item.price ?? 0;
    return subtotal + price * item.quantity;
  }, 0);
};
