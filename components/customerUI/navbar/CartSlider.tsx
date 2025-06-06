// components/customerUI/navbar/CartSlider.tsx
"use client";

import { useUserContext } from "@/contexts/UserContext";
import { Session } from "next-auth";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { ShoppingCart, X, Trash2 } from "lucide-react";
import { CartItem as CartItemType } from "@/types/cart";
import { getGuestCart, removeItemFromGuestCart, updateGuestCartItemQuantity, getGuestCartTotalItems, getGuestCartSubtotal } from "@/lib/guestCartStore";
import React, { useState, useEffect, useMemo } from "react";
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
  item: CartItemType;
  session: Session | null;
  onRemove: (itemId: string, variantId?: string) => void;
  onQuantityChange: (itemId: string, quantity: number, variantId?: string) => void;
}) => {
  const handleRemove = () => {
    onRemove(item.id /*, item.selectedVariant?.id */);
  };

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(item.id, newQuantity /*, item.selectedVariant?.id */);
  };

  return (
    <div className='flex gap-3 border-b py-3 px-1 items-center'>
      <div className='w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0'>
        <Image src={item.imageUrl || "/noProductImage.png"} alt={item.title || "Cart item"} width={80} height={80} className='object-cover w-full h-full' />
      </div>
      <div className='flex-grow'>
        <h4 className='text-sm font-medium line-clamp-1'>{item.title}</h4>
        {/* {item.selectedVariant && <p className='text-xs text-gray-500'>{item.selectedVariant.name}</p>} */}
        <p className='text-xs text-gray-500'>Price: {item.price?.toFixed(2)} MAD</p>
        <div className='flex items-center gap-2 mt-1'>
          <button onClick={() => handleQuantityChange(item.quantity - 1)} className='px-2 py-0.5 border rounded text-sm'>
            -
          </button>
          <span>{item.quantity}</span>
          <button onClick={() => handleQuantityChange(item.quantity + 1)} className='px-2 py-0.5 border rounded text-sm'>
            +
          </button>
        </div>
      </div>
      <div className='text-right flex-shrink-0'>
        <p className='text-sm font-semibold'>{(item.price && item.quantity ? item.price * item.quantity : 0).toFixed(2)} MAD</p>
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

  const [guestCartItems, setGuestCartItems] = useState<CartItemType[]>([]);
  const [guestTotalItems, setGuestTotalItems] = useState(0);
  const [guestSubtotal, setGuestSubtotal] = useState(0);

  useEffect(() => {
    const updateGuestCartState = () => {
      setGuestCartItems(getGuestCart());
      setGuestTotalItems(getGuestCartTotalItems());
      setGuestSubtotal(getGuestCartSubtotal());
    };
    updateGuestCartState();
    window.addEventListener("guestCartChanged", updateGuestCartState);
    return () => window.removeEventListener("guestCartChanged", updateGuestCartState);
  }, []);

  // TODO: Combine with logged-in user's cart state from UserContext once implemented
  const displayCartItems = isLoggedIn ? [] /* cart */ : guestCartItems;
  const totalCartItems = isLoggedIn ? 0 /* cart.reduce((sum, item) => sum + item.quantity, 0) */ : guestTotalItems;
  const cartSubtotal = isLoggedIn ? 0 /* cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) */ : guestSubtotal;

  const handleRemoveItem = (itemId: string, variantId?: string) => {
    if (isLoggedIn) {
      // removeItemFromCart(itemId, variantId); // TODO: From UserContext
      console.log("TODO: Remove from DB cart", itemId, variantId);
    } else {
      removeItemFromGuestCart(itemId /*, variantId */);
    }
  };

  const handleQuantityChange = (itemId: string, quantity: number, variantId?: string) => {
    if (isLoggedIn) {
      // updateCartItemQuantity(itemId, quantity, variantId); // TODO: From UserContext
      console.log("TODO: Update DB cart quantity", itemId, quantity, variantId);
    } else {
      updateGuestCartItemQuantity(itemId, quantity /*, variantId */);
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
        <div ref={parent} className='flex-grow overflow-y-auto p-3 space-y-3'>
          {displayCartItems.length > 0 ? (
            displayCartItems.map((item) => (
              <CartItemCard
                key={item.id + /* item.selectedVariant?.id || */ ""}
                item={item}
                session={session}
                onRemove={handleRemoveItem}
                onQuantityChange={handleQuantityChange}
              />
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
