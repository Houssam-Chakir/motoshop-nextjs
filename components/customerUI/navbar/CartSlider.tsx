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
      </div>
      <div className='w-full flex flex-col justify-around px-2'>
        <div>
          <h4 className='text-sm font-medium line-clamp-1'>{item.title}</h4>
          <p className='text-xs text-gray-500'>Size: {item.size}</p>
          <p className='text-xs text-gray-500'>Price: {item.unitPrice?.toFixed(2)} MAD</p>
        </div>
        <div className='flex w-full items-center-safe justify-around'>
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
          <div className='flex w-full justify-end'>
            <p className='font-bold text-[clamp(13px,1.5vw,14px)] text-blue pt-1'>
              {item.totalPrice?.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
            </p>
          </div>
        </div>
      </div>
      <button onClick={handleRemove} className='flex px-1.5 items-center justify-center h-full w-[24px] hover:bg-primary group'>
        <Trash size={12} className='text-grey-darker group-hover:text-white' />
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
  const [guestCart, setGuestCart] = useState<GuestCart>({ products: [], totalQuantity: 0, totalAmount: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // This effect runs only on the client, after the initial render.
    setIsClient(true); // Mark that we are on the client.
    setGuestCart(getGuestCart()); // Load the actual guest cart from sessionStorage.

    const handleGuestCartChange = (event: CustomEvent<GuestCart>) => {
      setGuestCart(event.detail);
    };

    window.addEventListener("guestCartChanged", handleGuestCartChange as EventListener);

    return () => {
      window.removeEventListener("guestCartChanged", handleGuestCartChange as EventListener);
    };
  }, []);

  // Convert authenticated cart items to GuestCartProductItem shape for unified rendering
  const userCartItems: GuestCartProductItem[] =
    cart?.products.map((item) => ({
      productId: item.productId._id,
      title: item.productId.title,
      slug: item.productId.slug,
      imageUrl: item.productId.images?.[0]?.secure_url,
      size: item.size,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      // The properties below are not in CartProductItemType, so we provide defaults.
      inStock: true, // Assuming items in cart are in stock. For more accuracy, this would need a re-fetch.
      brand: undefined,
    })) || [];

  // After hydration, the guestCart state updates, and this will re-render with the correct data.
  const displayCartItems = isLoggedIn ? userCartItems : guestCart.products;
  const totalCartItems = isLoggedIn ? cart?.quantity || 0 : guestCart.totalQuantity;
  const totalCartPrice = isLoggedIn ? cart?.totalAmount || 0 : guestCart.totalAmount;

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
                <span className="font-bold text-slate-700">{totalCartPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
              </div>
              {/* Sales */}
              <div className='flex justify-between text-sm font-'>
                <span>Sales:</span>
                <span className="font-bold text-success-green">- {totalCartPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
              </div>
              {/* Shipping */}
              {/* <div className='flex justify-between text-sm font-'>
                <span>Shipping:</span>
                <span className="font-bold text-success-green">{totalCartPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
              </div> */}
              <hr className="border-grey-medium" />
              {/* Total */}
              <div className='flex justify-between text-sm font-bold'>
                <span>Total:</span>
                <span className="font-bold text-blue">{totalCartPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
            <span className="text-xs text-grey-darker italic">Shipping fee varies by address.s</span>
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
