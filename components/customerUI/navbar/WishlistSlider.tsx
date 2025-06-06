"use client";

import { useUserContext } from "@/contexts/UserContext";
import { Session } from "next-auth";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { Heart, Trash, X } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { WishlistItem as WishlistItemType } from "@/types/wishlist";
import { getGuestWishlist, removeItemFromGuestWishlist } from "@/lib/guestWishlistStore";
import { useState, useEffect } from "react";
import Image from "next/image";
import { SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { removeItemFromDbWishlistAction } from "@/actions/wishlistActions";
import { useAutoAnimate } from "@formkit/auto-animate/react";

export default function WishlistSlider({ session }: { session: Session | null }) {
  const [parent] = useAutoAnimate();

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
      showDefaultCloseButton={false} // Added this line
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
        {/* wishlist items from logged in users */}
        <div ref={parent} className='flex flex-col gap-2 p-2'>
          {wishlist &&
            wishlist.map((item) => {
              console.log(item);
              return <WishlistItem key={item.id} item={item} />;
            })}
          {/* wishlist items from guest users */}
          {guestWishlistItems.length > 0 &&
            guestWishlistItems.map((item) => {
              console.log(item);
              return <WishlistItem item={item} session={session} />;
            })}
          {wishlist.length === 0 && guestWishlistItems.length === 0 && (
            //Display empty svg
            <div className="p-8 pt-12 text-center text-grey-darker" >
              <img className="opacity-80" src='/empty.svg' alt='empty wishlist' />
              <p className="font-display pr-2">Wishlist is empty</p>
            </div>
          )}
        </div>
      </div>
    </MobileSlider>
  );
}

function WishlistItem({ item, session }: { item: WishlistItemType; session: Session | null }) {
  const router = useRouter();

  //Click handlers
  const handleItemClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    //Takes you to product page
    // If the click was on a button or its children, don't navigate
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    // Navigate to product page
    router.push(`/products/${item.slug}`);
  };
  //remove item from wishlist
  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    //remove item from wishlist
    if (session) {
      removeItemFromDbWishlistAction(item.id);
    } else {
      removeItemFromGuestWishlist(item.id);
    }
  };

  return (
    <div onClick={(e) => handleItemClick(e)} key={item.id} className='relative flex text-start gap-2 transition-all border-1 hover:shadow-sm cursor-pointer'>
      {/* Image */}
      <div className='shrink-0 aspect-square w-[100px] flex items-center justify-center bg-grey-light p-2 overflow-clip'>
        <Image className='object-contain w-full h-full' src={item.imageUrl ?? '/noProductImage.png'} alt={item.title ?? "Wishlist Item"} width={90} height={90} />
      </div>
      {/* Product Info */}
      <div className='shrink-1 flex flex-col justify-center'>
        <div className='pb-1.5'>
          <h3 className='font-medium text-[clamp(13px,1.5vw,14px)] line-clamp-1 w-full'>{item.title}</h3>
          <p className='text-[12px] text-grey-darker'>
            {item.identifiers?.brand} {item.identifiers?.category}
          </p>
        </div>
        <div className=' gap-2 items-center pl-0.5'>

          <span className='text-emerald-500 text-xs'>In Stock</span>
          <p className='font-bold text-[clamp(13px,1.5vw,14px)] text-blue'>{item.retailPrice?.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</p>
        </div>
      </div>
      {/* Remove Button */}
      <button onClick={handleRemoveItem} className='absolute top-0 right-0 flex items-center justify-center h-full w-[24px] hover:bg-primary group '>
        <Trash size={12} className='text-grey-darker group-hover:text-white' />
      </button>
    </div>
  );
}
