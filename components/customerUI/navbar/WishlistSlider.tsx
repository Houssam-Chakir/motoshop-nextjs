/* eslint-disable @next/next/no-img-element */
"use client";

import { useUserContext } from "@/contexts/UserContext";
import { Session } from "next-auth";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { Heart, Trash, X } from "lucide-react";
import { WishlistItem as WishlistItemType } from "@/types/wishlist";
import { getGuestWishlist, removeItemFromGuestWishlist } from "@/lib/guestWishlistStore";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function WishlistSlider({ session }: { session: Session | null }) {
  const [parent] = useAutoAnimate();

  const { wishlist } = useUserContext();
  const [guestWishlistItems, setGuestWishlistItems] = useState<WishlistItemType[]>([]);

  useEffect(() => {
    // Function to update guest wishlist items from localStorage
    const updateGuestWishlist = () => {
      setGuestWishlistItems(getGuestWishlist());
    };
    // Initial load
    updateGuestWishlist();
    // Listen for custom event
    window.addEventListener("guestWishlistChanged", updateGuestWishlist);
    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener("guestWishlistChanged", updateGuestWishlist);
    };
  }, []);

  return (
    <MobileSlider
      side='right'
      showDefaultCloseButton={false}
      className='md:w-[450px] xs:w-[90%]  p-0'
      trigger={
        <div className='flex flex-col items-center group cursor-pointer'>
          <Heart className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-primary'>Wishlist</span>
        </div>
      }
    >
      <div className='flex flex-col h-full min-h-0'>
        {/* Profile Info & Counts Section */}
        {session && (
          <div className='p-4 border-b shrink-0'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-300 bg-gray-100'>
                <Image
                  src={session.user?.image || "/default-avatar.png"}
                  alt={session.user?.name || "User Avatar"}
                  width={48}
                  height={48}
                  className='object-cover w-full h-full'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }}
                />
              </div>
              <div>
                <p className='font-semibold text-sm truncate'>{session.user?.name || "User Name"}</p>
                <p className='text-xs text-gray-500 truncate'>{session.user?.email || "user@example.com"}</p>
              </div>
            </div>
          </div>
        )}
        {!session && (
          <div className='px-4 w-full flex justify-center items-center border-b mb-1'>
            <Heart />
            <span className='w-full p-4 text-md font-semibold truncate'>Wishlist Items</span>
            <div>
              <SheetClose asChild>
                <Button variant='ghost' size='icon' className='p-1 h-8 w-8 shrink-0 rounded-none'>
                  <X className='h-5 w-5' />
                </Button>
              </SheetClose>
            </div>
          </div>
        )}
        <div ref={parent} className='flex flex-col gap-2 p-2'>
          {(() => {
            const displayItems = [...wishlist, ...guestWishlistItems];
            return displayItems.length > 0 ? (
              displayItems.map((item, idx) => (
                <React.Fragment key={item.id ?? idx}>
                  <WishlistItem item={item} session={session} />
                  {idx !== displayItems.length - 1 && <hr className='my-2 border-gray-200' />}
                </React.Fragment>
              ))
            ) : (
              <div className='p-8 pt-12 text-center text-gray-500'>
                <img className='opacity-80 w-40 mx-auto pb-4' src='/empty.svg' alt='empty wishlist' />
                <p className='font-semibold'>Your wishlist is empty</p>
                <p className='text-sm mt-1'>Looks like you haven&apos;t added anything to your wishlist yet.</p>
              </div>
            );
          })()}
        </div>
      </div>
    </MobileSlider>
  );
}

function WishlistItem({ item, session }: { item: WishlistItemType; session: Session | null }) {
  const router = useRouter();
  const { removeItemFromWishlist } = useUserContext(); // Get the context function

  console.log("item from wishlist", item);
  const finalPrice = item.salePrice ? item.salePrice : item.retailPrice;

  // Click handlers
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Takes you to product page
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/product/${item.slug}`);
  };

  // remove item from wishlist
  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (session) {
      // Use the context function for logged-in users
      removeItemFromWishlist(item.id);
    } else {
      // Use the direct function for guest users
      removeItemFromGuestWishlist(item.id);
    }
  };

  return (
    <div onClick={handleItemClick} key={item.id} className='relative flex text-start gap-2 transition-all  hover:border-gray-400 cursor-pointer'>
      {/* Image */}
      <div className='shrink-0 aspect-square w-[100px] flex items-center justify-center bg-grey-light p-2 overflow-clip'>
        <Image className='object-contain w-full h-full' src={item.imageUrl ?? "/noProductImage.png"} alt={item.title ?? "Wishlist Item"} width={90} height={90} />
        {item.salePrice && (
          <div className={`bg-primary transition-all text-white absolute uppercase font-bold text-[12px] px-1.5 py-0.5 bottom-0 left-0`}>
            {/* calculate percentage of discount from original price to unitprice and remove numbers after comma*/}-
            {Math.floor(((item.retailPrice! - item.salePrice!) / item.retailPrice!) * 100)}%
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className='shrink-1 flex flex-col justify-center'>
        <div className='pb-1.5'>
          <h3 className='font-medium text-[clamp(13px,1.5vw,14px)] line-clamp-1 w-full'>{item.title}</h3>
          <p className='text-[12px] text-grey-darker'>
            {item.identifiers?.brand} {item.identifiers?.category}
          </p>
        </div>
        <div className='gap-2 items-center pl-0.5'>
          {item.quantity > 0 && <span className='text-emerald-500 text-xs'>In Stock</span>}
          {item.quantity === 0 || (!item.quantity && <span className='text-red-500 text-xs'>Out of Stock</span>)}
          <div className='flex gap-2 items-center'>
            <p className='font-bold text-[clamp(13px,1.5vw,14px)] text-blue'>{finalPrice?.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</p>
            {item.salePrice && (
              <div className='flex gap-1 text-success-green items-center line-through italic'>
                <div className=' text-[clamp(8px,1.5vw,11px)]'>{item.retailPrice?.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                <div className='text-[clamp(8px,1.5vw,11px)]'>
                  <span className='text-[clamp(8px,1.5vw,11px)]'> MAD</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Remove Button */}
      <button onClick={handleRemoveItem} className='absolute top-0 right-0 flex items-center justify-center h-full w-[24px] hover:bg-primary group '>
        <Trash size={12} className='text-grey-darker group-hover:text-white' />
      </button>
    </div>
  );
}
