// components/customerUI/navbar/CartSlider.tsx
"use client";

import { useUserContext } from "@/contexts/UserContext";
import { Session } from "next-auth";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { ShoppingCart, X, Trash, Minus, Plus } from "lucide-react";
import { ProductType } from "@/models/Product";
import { CartType } from "@/types/cart";
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
import { removeItemFromCart, updateCartItemQuantity } from "@/actions/cartActions";
import { toast } from "react-toastify";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { useMemo } from "react";

// Placeholder for CartItemCard component - will be created in a separate file
const CartItemCard = ({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: GuestCartProductItem; // Changed to GuestCartProductItem
  onRemove: (productId: string, size: string) => void; // Adjusted params
  onQuantityChange: (productId: string, size: string, newQuantity: number) => void; // Adjusted params
}) => {
  console.log("cart item", item);
  const handleRemove = () => {
    onRemove(item.productId, item.size); // Use productId and size
  };

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(item.productId, item.size, newQuantity); // Use productId, size, and newQuantity
  };

  return (
    <div className='relative flex text-start transition-all hover:border-gray-400 cursor-pointer'>
      <div className='shrink-0 aspect-square w-[100px] flex items-center justify-center bg-grey-light p-1 overflow-clip'>
        <Image className='object-contain w-full h-full' src={item.imageUrl ?? "/noProductImage.png"} alt={item.title ?? "Cart Item"} width={90} height={90} />
        {item.originalPrice !== item.unitPrice && (
          <div
            className={`bg-primary transition-all text-white absolute uppercase font-bold text-[12px] px-1.5 py-0.5 bottom-0 left-0`}
          >
            {/* calculate percentage of discount from original price to unitprice and remove numbers after comma*/}
            -{Math.floor(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100)}%
          </div>
        )}
      </div>
      <div className='w-full flex flex-col justify-around px-2'>
        <div>
          <h4 className='text-sm font-medium line-clamp-1'>{item.title}</h4>
          <p className='text-xs text-gray-500'>Size: {item.size}</p>
          <p className='text-xs text-gray-500'>Price: {item.unitPrice?.toFixed(2)} MAD</p>
        </div>
        <div className='flex pt-1 w-full items-center-safe justify-between'>
          <div className='flex items-center gap-2 mt-2 border rounded-full'>
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className={`px-3 py-0  h-full hover:bg-grey-light rounded-l-full text-sm ${item.quantity === 1 ? "text-grey-dark" : ""}`}
              disabled={item.quantity === 1}
            >
              <Minus size={16} height={24} />
            </button>
            <span className='px-1'>{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item.quantity + 1)} className='text-[14px] px-3 py-0  h-full hover:bg-grey-light rounded-r-full text-sm'>
              <Plus size={16} height={24} />
            </button>
          </div>
          <div className='-space-y-1 flex flex-col items-end'>
            {item.originalPrice !== item.unitPrice && (
              <div className='flex gap-1 text-success-green items-center line-through italic'>
                <div className=' text-[clamp(8px,1.5vw,11px)]'>{item.originalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <div className='text-[clamp(8px,1.5vw,11px)]'>
                  <span className='text-[clamp(8px,1.5vw,11px)]'> MAD</span>
                </div>
              </div>
            )}
            <div className='flex gap-1 items-center'>
              <div className='font-bold text-blue text-[clamp(15px,1.5vw,16px)]'>
                {item.unitPrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className='text-[clamp(10px,1.5vw,14px)] text-blue'>
                <span className='font-bold text-[clamp(15px,1.5vw,16px)]'> MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={handleRemove} className='absolute top-0 right-0 flex px-1.5 items-center justify-center h-6 w-6 group hover:bg-red-50 rounded-full'>
        <Trash size={12} className='text-grey-darker group-hover:text-primary' />
      </button>
    </div>
  );
};

export default function CartSlider({ session }: { session: Session | null }) {
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
      return guestCartItems.map((item) => ({ ...item, originalPrice: item.unitPrice, inStock: true }));
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
    <MobileSlider
      side='right'
      showDefaultCloseButton={false}
      className='w-[450px] p-0'
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
        <div className='px-4 py-3 mb-2 w-full flex justify-between items-center border-b'>
          <div className='flex items-center gap-2'>
            <ShoppingCart className='h-5 w-5 text-gray-700' />
            <span className='text-md font-semibold'>Shopping Cart </span> <span className='text-xs text-gray-500 pt-0.5'> ({totalCartItems} items)</span>
          </div>
          <SheetClose asChild>
            <Button variant='ghost' size='icon' className='p-1 h-8 w-8 shrink-0 rounded-none'>
              <X className='h-5 w-5' />
            </Button>
          </SheetClose>
        </div>

        {/* Cart Items */}
        <div ref={parent} className='flex flex-col flex-grow overflow-y-auto p-2 gap-2'>
          {displayCartItems.length > 0 ? (
            displayCartItems.map((item, idx) => (
              <React.Fragment key={item.productId + item.size}>
                <CartItemCard item={item} onRemove={handleRemoveItem} onQuantityChange={handleQuantityChange} />
                {idx !== displayCartItems.length - 1 && <hr className='my-2 border-gray-200' />}
              </React.Fragment>
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
          <div className='absolute bottom-0 w-full border-t p-4 space-y-4 shrink-0 bg-white/90 backdrop-blur-xs'>
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
              {/* Shipping - Placeholder */}
              <hr className='border-grey-medium' />
              {/* Total */}
              <div className='flex justify-between text-sm font-bold'>
                <span>Total:</span>
                <span className='font-bold text-blue'>{finalTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>
              <span className='text-xs text-grey-darker italic'>Shipping fee varies by address.s</span>
              <Button onClick={handleCheckout} className='w-full bg-blue hover:bg-blue/90 rounded-full py-5 cursor-pointer text-white'>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </MobileSlider>
  );
}
