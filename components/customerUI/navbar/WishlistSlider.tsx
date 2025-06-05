"use client";

import { useUserContext } from "@/contexts/UserContext";
import { Session } from "next-auth";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { Heart, X } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { WishlistItem as WishlistItemType } from "@/types/wishlist";
import { getGuestWishlist } from "@/lib/guestWishlistStore";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function WishlistSlider({ session }: { session: Session | null }) {
  const { wishlist } = useUserContext();
  const [guestWishlistItems, setGuestWishlistItems] = useState<WishlistItemType[]>([]);
  console.log("WISHLIST RERENDERED", guestWishlistItems);
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

  console.log("Guest wishlist from state:", guestWishlistItems);

  return (
    <MobileSlider
      side='right'
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
            <div className='flex items-center gap-3 mb-3'>
              <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-300 bg-gray-100'>
                <Image
                  src={session.user?.image || "/default-avatar.png"} // Ensure you have a fallback avatar
                  alt={session.user?.name || "User Avatar"}
                  width={48}
                  height={48}
                  className='object-cover w-full h-full'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }} // Fallback for broken image links
                />
              </div>
              <div>
                <p className='font-semibold text-sm truncate'>{session.user?.name || "User Name"}</p>
                <p className='text-xs text-gray-500 truncate'>{session.user?.email || "user@example.com"}</p>
              </div>
            </div>
            <div className='bg-grey border-grey-medium border-1 border-dashed *:flex *:gap-1 rounded-full py-2 px-4 flex justify-around gap-2 text-center text-xs'>
              <div>
                <p className='font-semibold'>{wishlist?.length ?? guestWishlistItems.length}</p>
                <p className='text-slate-700'>Wishlist</p>
              </div>
              <div>
                <p className='font-semibold'>0</p>
                <p className='text-slate-700'>Cart</p>
              </div>
              <div>
                <p className='font-semibold'>0</p>
                <p className='text-slate-700'>Orders</p>
              </div>
            </div>
          </div>
        )}
        {!session && (
          <div className="w-full text-center p-4 text-md font-semibold truncate border-b mb-1">Wishlist Items</div>
        )}
        {/* wishlist items from logged in users */}
        <div className='flex flex-col gap-2 p-2'>
          {wishlist &&
            wishlist.map((item) => {
              console.log(item);
              return <WishlistItem item={item} />;
            })}
          {/* wishlist items from guest users */}
          {guestWishlistItems.length > 0 &&
            guestWishlistItems.map((item) => {
              console.log(item);
              return <WishlistItem item={item} />;
            })}
        </div>
      </div>
    </MobileSlider>
  );
}

function WishlistItem({ item }: { item: WishlistItemType }) {
  return (
    <div key={item.id} className='relative flex gap-2 transition-all'>
      {/* Image */}
      <div className='shrink-0 aspect-square w-[90px] flex items-center justify-center bg-grey-light p-2 overflow-clip'>
        <CldImage className='object-contain w-full h-full' src={item.imageUrl ?? ""} alt={item.title ?? "Wishlist Item"} width={90} height={90} />
      </div>
      {/* Product Info */}
      <div className='shrink-1 flex flex-col'>
        <div className='pb-1.5'>
          <h3 className='font-medium text-[clamp(13px,1.5vw,14px)] line-clamp-1 w-full'>{item.title}</h3>
          <p className='text-[12px] text-grey-darker'>
            {item.identifiers?.brand} {item.identifiers?.category}
          </p>
          <p className='font-bold text-[clamp(13px,1.5vw,14px)] text-blue'>{item.price?.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</p>
        </div>
        <div className='flex gap-2 items-center pl-0.5'>
          <div className='w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-emerald-200'></div>
          <span className='text-emerald-500 text-xs'>In Stock</span>
        </div>
      </div>
      {/* Remove Button */}
      <X size={12} className='absolute top-1 right-1 text-grey-darker' />
    </div>
  );
}
