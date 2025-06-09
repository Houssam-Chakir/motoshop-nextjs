// components/customerUI/navbar/CartSlider.tsx
"use client";

import { useUserContext } from "@/contexts/UserContext";
import { Session } from "next-auth";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { ShoppingCart, X, Trash2, Minus, Plus } from "lucide-react";
// import { CartItem as CartItemType } from "@/types/cart"; // Using GuestCartProductItem directly
import {
  getGuestCart,
  removeItemFromGuestCart,
  updateItemQuantityInGuestCart,
  GuestCart, // Import GuestCart type
  GuestCartProductItem, // Import GuestCartProductItem type
} from "@/lib/guestCartStore";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
// import { removeItemFromDbCartAction, updateDbCartItemQuantityAction } from "@/actions/cartActions"; // Placeholder for server actions
import { useAutoAnimate } from "@formkit/auto-animate/react";

// Placeholder for CartItemCard component - will be created in a separate file
const CartItemCard = ({
  item,
  session,
  onRemove,
  onQuantityChange,
}: {
  item: GuestCartProductItem; // Changed to GuestCartProductItem
  session: Session | null;
  onRemove: (productId: string, size: string) => void; // Adjusted params
  onQuantityChange: (productId: string, size: string, newQuantity: number) => void; // Adjusted params
}) => {
  const handleRemove = () => {
    onRemove(item.productId, item.size); // Use productId and size
  };

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(item.productId, item.size, newQuantity); // Use productId, size, and newQuantity
  };

  return (
    <div className='flex gap-2 py-3 px-1'>
      <div className='shrink-0 aspect-square w-[100px] flex items-center justify-center bg-grey-light p-2 overflow-clip'>
        <Image className='object-contain w-full h-full' src={item.imageUrl ?? "/noProductImage.png"} alt={item.title ?? "Wishlist Item"} width={90} height={90} />
      </div>
      <div className='flex-grow flex flex-col justify-between'>
        <div>
          <h4 className='text-sm font-medium line-clamp-1'>{item.title}</h4>
          <p className='text-xs text-gray-500'>Size: {item.size}</p>
          <p className='text-xs text-gray-500'>Price: {item.unitPrice?.toFixed(2)} MAD</p>
        </div>
        <div className="flex w-full items-center-safe justify-between">
          <div className='flex items-center gap-2 mt-2 border rounded-full'>
            <button onClick={() => handleQuantityChange(item.quantity - 1)} className='px-3 py-0  h-full hover:bg-grey-light rounded-l-full text-sm'>
              <Minus size={16} height={24} />
            </button>
            <span className="px-1">{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item.quantity + 1)} className='text-[14px] px-3 py-0  h-full hover:bg-grey-light rounded-r-full text-sm'>
              <Plus size={16} height={24} />
            </button>
          </div>
          <p className='font-bold text-[clamp(13px,1.5vw,14px)] text-blue pt-1'>
            {item.totalPrice?.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
          </p>
        </div>
      </div>
      <div className='text-right flex-shrink-0'>
        <button onClick={handleRemove} className='text-red-500 hover:text-red-700 text-xs mt-1'>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default function CartSlider({ session }: { session: Session | null }) {
  const [parent] = useAutoAnimate();
  const router = useRouter();

  // const { cart, isLoadingCart, addItemToCart, removeItemFromCart, updateCartItemQuantity } = useUserContext(); // TODO: Add cart to UserContext
  const { profile } = useUserContext(); // Using profile to check if logged in
  const isLoggedIn = !!profile;

  const [guestCart, setGuestCart] = useState<GuestCart>(getGuestCart()); // Use GuestCart state

  useEffect(() => {
    const handleGuestCartChange = (event: CustomEvent<GuestCart>) => {
      setGuestCart(event.detail);
    };
    // Initial load is handled by useState, this is for subsequent changes
    window.addEventListener("guestCartChanged", handleGuestCartChange as EventListener);
    return () => window.removeEventListener("guestCartChanged", handleGuestCartChange as EventListener);
  }, []);

  // TODO: Combine with logged-in user's cart state from UserContext once implemented
  const displayCartItems = isLoggedIn ? [] /* cart.products */ : guestCart.products;
  const totalCartItems = isLoggedIn ? 0 /* cart.totalQuantity */ : guestCart.totalQuantity;
  const cartSubtotal = isLoggedIn ? 0 /* cart.totalAmount */ : guestCart.totalAmount;

  const handleRemoveItem = (productId: string, size: string) => {
    if (isLoggedIn) {
      // removeItemFromCart(itemId, variantId); // TODO: From UserContext
      console.log("TODO: Remove from DB cart", productId, size);
    } else {
      // Parameters for removeItemFromGuestCart are (productId: string, size: string)
      removeItemFromGuestCart(productId, size || "Standard"); // Use productId and size, provide fallback for size if necessary
    }
  };

  const handleQuantityChange = (productId: string, size: string, newQuantity: number) => {
    if (isLoggedIn) {
      // updateCartItemQuantity(itemId, quantity, variantId); // TODO: From UserContext
      console.log("TODO: Update DB cart quantity", productId, newQuantity, size);
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
    <MobileSlider
      side='right'
      showDefaultCloseButton={false}
      className="w-[450px] p-0"
      trigger={
        <div className='relative flex flex-col items-center group cursor-pointer'>
          <ShoppingCart className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-primary'>Cart</span>
          <span className='absolute -top-1.5 -right-2 bg-secondary-light opacity-80 group-hover:opacity-100 text-white text-sm font-bold rounded-full duration-100 group-hover:-translate-y-1 h-4 w-4 flex items-center justify-center'>
            {totalCartItems}
          </span>
        </div>
      }
    >
      <div className='flex flex-col h-full min-h-0'>
        {/* Header */}
        <div className='px-4 py-3 w-full flex justify-between items-center border-b'>
          <div className='flex items-center gap-2'>
            <ShoppingCart className='h-5 w-5 text-gray-700' />
            <span className='text-md font-semibold'>Shopping Cart</span>
          </div>
          <SheetClose asChild>
            <Button variant='ghost' size='icon' className='p-1 h-8 w-8 shrink-0 rounded-none'>
              <X className='h-5 w-5' />
            </Button>
          </SheetClose>
        </div>

        {/* Cart Items */}
        <div ref={parent} className='flex-grow overflow-y-auto p-2'>
          {displayCartItems.length > 0 ? (
            displayCartItems.map((item) => (
              <CartItemCard key={item.productId + item.size} item={item} session={session} onRemove={handleRemoveItem} onQuantityChange={handleQuantityChange} />
            ))
          ) : (
            <div className='p-8 pt-12 text-center text-gray-500'>
              <ShoppingCart size={48} className='mx-auto mb-4 opacity-50' />
              <p className='font-semibold'>Your cart is empty</p>
              <p className='text-sm mt-1'>Looks like you haven't added anything to your cart yet.</p>
            </div>
          )}
        </div>

        {/* Footer - Summary & Checkout */}
        {displayCartItems.length > 0 && (
          <div className='border-t p-4 space-y-3 shrink-0'>
            <div className='flex justify-between text-sm font-medium'>
              <span>Subtotal ({totalCartItems} items)</span>
              <span>{cartSubtotal.toFixed(2)} MAD</span>
            </div>
            <Button onClick={handleCheckout} className='w-full bg-primary hover:bg-primary-dark text-white'>
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </MobileSlider>
  );
}
