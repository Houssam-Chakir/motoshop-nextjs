// components/customerUI/navbar/CartSlider.tsx
"use client";

import { useUserContext } from "@/contexts/UserContext";
import { ShoppingCart, Box } from "lucide-react";
import {
  getGuestCart,
  removeItemFromGuestCart,
  updateItemQuantityInGuestCart,
  GuestCart, // Import GuestCart type
  GuestCartProductItem, // Import GuestCartProductItem type
} from "@/lib/guestCartStore";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { removeItemFromCart, updateCartItemQuantity } from "@/actions/cartActions";
import { toast } from "react-toastify";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMemo } from "react";
import { useSessionContext } from "@/contexts/SessionContext";
import OrderItemCard from "./OrderItemCard";
import { CartItem } from "@/types/cart";

export default function OrderItemsSection({ setFinalCart, shippingFee }: { setFinalCart: React.Dispatch<React.SetStateAction<CartItem[]>>; shippingFee?: number }) {
  const { session } = useSessionContext();

  const [parent] = useAutoAnimate();
  const router = useRouter();

  const { profile, cart, isLoadingCart, fetchCart } = useUserContext();
  const isLoggedIn = !!profile;

  // Initialize with an empty cart to prevent hydration mismatch. Server will render 0 items.
  const [guestCartItems, setGuestCartItems] = useState<GuestCartProductItem[]>([]);

  // Effect for handling guest cart
  useEffect(() => {
    const handleGuestCartChange = (event: CustomEvent<GuestCart>) => {
      setGuestCartItems(event.detail.products);
    };

    if (!session) {
      const guestCart = getGuestCart();
      console.log("guestCart: ", guestCart);
      setGuestCartItems(guestCart.products);
      window.addEventListener("guestCartChanged", handleGuestCartChange as EventListener);
    }

    return () => {
      window.removeEventListener("guestCartChanged", handleGuestCartChange as EventListener);
    };
  }, [session]);

  const displayCartItems = useMemo(() => {
    if (session && cart?.products) {
      console.log("cart in cartSLider", cart);
      return cart.products.map((item) => {
        const finalUnitPrice = item.productId.salePrice ? item.productId.salePrice : item.productId.retailPrice;
        const stockInfo = item.productId.stock?.sizes.find((s) => s.size === item.size);
        const inStock = stockInfo ? stockInfo.inStock : false;

        return {
          productId: item.productId._id.toString(),
          title: item.productId.title,
          imageUrl: item.productId.images?.[0]?.secure_url,
          size: item.size,
          quantity: item.quantity,
          unitPrice: finalUnitPrice,
          totalPrice: finalUnitPrice * item.quantity,
          originalPrice: item.productId.retailPrice,
          inStock: inStock, // Added required property
          // Add other missing properties with default values if necessary
          slug: item.productId.slug,
        };
      });
    } else if (!session) {
      // Guest cart items are assumed to be in stock when added.
      return guestCartItems.map((item) => ({ ...item, inStock: true }));
    }
    return [];
  }, [session, cart, guestCartItems]);

  const { subtotal, totalDiscount, finalTotal, totalCartItems } = useMemo(() => {
    const totals = displayCartItems.reduce(
      (acc, item) => {
        const originalTotal = (item.originalPrice || item.unitPrice) * item.quantity;
        const finalTotal = item.totalPrice || 0;

        acc.subtotal += originalTotal;
        acc.finalTotal += finalTotal;
        acc.totalCartItems += item.quantity;
        return acc;
      },
      { subtotal: 0, finalTotal: 0, totalCartItems: 0 }
    );

    return {
      ...totals,
      totalDiscount: totals.subtotal - totals.finalTotal,
    };
  }, [displayCartItems]);

  useEffect(() => {
    setFinalCart({ cartItems: displayCartItems, totalPrice: finalTotal, totalDiscount });
  }, [displayCartItems, setFinalCart, finalTotal, totalDiscount]);

  const handleRemoveItem = async (productId: string, size: string) => {
    if (isLoggedIn) {
      try {
        const result = await removeItemFromCart({ productId, size });
        if (result.success) {
          toast.success(result.message);
          await fetchCart();
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to remove item.");
      }
    } else {
      removeItemFromGuestCart(productId, size || "Standard");
    }
  };

  const handleQuantityChange = async (productId: string, size: string, newQuantity: number) => {
    console.log("quantity change", newQuantity);
    if (isLoggedIn) {
      try {
        const result = await updateCartItemQuantity({ productId, size, quantity: newQuantity });
        if (result.success) {
          await fetchCart();
        } else {
          toast.error(result.message);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to update cart.");
      }
    } else {
      // Parameters for updateItemQuantityInGuestCart are (productId: string, size: string, newQuantity: number)
      if (newQuantity <= 0) {
        // Ensure guest store's remove logic is hit if quantity is 0 or less
        removeItemFromGuestCart(productId, size || "Standard"); // Use productId and size, provide fallback for size
      } else {
        updateItemQuantityInGuestCart(productId, size || "Standard", newQuantity); // Use productId, size, and newQuantity
      }
    }
  };

  const handleCheckout = () => {
    router.push("/checkout"); // Navigate to your checkout page
    // Potentially close the slider here if it doesn't close automatically
  };

  return (
    <div className='w-full flex flex-col h-1/2 md:px-6'>
      {/* Header */}
      <div className='px-4 py-3 mb-2 w-full flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Box className='h-5 w-5 text-gray-700' />
          <span className='text-md font-semibold'>Order information </span> <span className='text-xs text-gray-500 pt-0.5'> ({totalCartItems} items)</span>
        </div>
      </div>

      {/* Cart Items */}
      <div ref={parent} className='flex flex-col flex-grow overflow-y-auto p-2 gap-2 pb-8'>
        {displayCartItems.length > 0 ? (
          displayCartItems.map((item, idx) => (
            <React.Fragment key={item.productId + item.size}>
              <OrderItemCard item={item} onRemove={handleRemoveItem} onQuantityChange={handleQuantityChange} />
              {idx !== displayCartItems.length - 1 && <hr className='my-2 border-gray-200' />}
            </React.Fragment>
          ))
        ) : (
          <div className='p-8 pt-12 text-center text-gray-500'>
            <ShoppingCart size={48} className='mx-auto mb-4 opacity-50' />
            <p className='font-semibold'>Your cart is empty</p>
            <p className='text-sm mt-1'>Looks like you haven&apos;t added anything to your cart yet.</p>
          </div>
        )}
      </div>

      {/* Footer - Summary & Checkout */}
      {displayCartItems.length > 0 && (
        <div className='p-2 space-y-4 shrink-0 bg-white/90 backdrop-blur-xs'>
          <div className='font-semibold'>Summary</div>
          <div className='bg-grey-dark/20 py-2 px-4 mb-4 border custom-dashed space-y-2'>
            {/* Subtotal */}
            <div className='flex justify-between text-sm font-'>
              <span>Subtotal:</span>
              <span className='font-bold text-slate-700'>{subtotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
            </div>
            {/* Sales */}
            {totalDiscount > 0 && (
              <div className='flex justify-between text-sm font-'>
                <span>Sales:</span>
                <span className='font-bold text-success-green'>- {totalDiscount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
              </div>
            )}
            {/* Shipping */}
            <div className='flex justify-between text-sm font-'>
              <span>Shipping:</span>
              <span className='font-bold text-success-green'>{shippingFee ? "+" + shippingFee : "TBD"}</span>
            </div>
            {/* Shipping - Placeholder */}
            <hr className='border-grey-medium' />
            {/* Total */}
            <div className='flex justify-between text-sm font-bold'>
              <span>Total:</span>
              <span className='font-bold text-blue'>{finalTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
