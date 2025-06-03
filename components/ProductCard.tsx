"use client";

import { ReviewType } from "@/models/Review";
import { CldImage } from "next-cloudinary";
import { Button } from "./ui/button";
import { Heart, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useUserContext } from "@/contexts/UserContext";
import React, { useState, useEffect } from "react";
import {
  addItemToGuestWishlist,
  removeItemFromGuestWishlist,
  isItemInGuestWishlist,
} from "@/lib/guestWishlistStore";

interface ProductCard {
  barcode: string;
  brand: string;
  category: string;
  createdAt: string;
  description: string;
  identifiers: {
    brand: string;
    categoryType: string;
    category: string;
    _id: string;
  };
  images: Array<{ secure_url: string; public_id: string }>;
  likes: number;
  productModel: string;
  retailPrice: number;
  reviews: ReviewType[];
  season: string;
  sku: string;
  slug: string;
  specifications: Array<{ name: string; description: string }>;
  stock: string;
  style: string;
  title: string;
  type: string;
  updatedAt: string;
  wholesalePrice: number;
  _id: string;
  __v: number;
}

function ProductCard({ product }: { product: ProductCard }) {
  const router = useRouter();
  // const isPhoneOrLarger = useMediaQuery("sm"); // 'md' is type-checked
  // const isTabletOrLarger = useMediaQuery("md"); // 'md' is type-checked
  const isDesktop = useMediaQuery("lg");

  //userContext
  const {
    profile, // To check if user is logged in
    isInWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    isLoadingWishlist,
    isLoadingProfile,
  } = useUserContext();

  const isLoggedIn = !!profile;
  const [isGuestItemInWishlist, setIsGuestItemInWishlist] = useState(false);

  useEffect(() => {
    if (!isLoggedIn && product?._id) {
      setIsGuestItemInWishlist(isItemInGuestWishlist(product._id));
    }
    // If user logs in/out, or product changes, guest state should reset or re-evaluate
    // If user logs in, UserContext will clear guest wishlist, so this local state might become stale
    // until a re-render or if UserContext itself forces a re-render of ProductCard.
    // For now, this handles guest state based on current product and login status.
  }, [isLoggedIn, product?._id]);

  // Determine the final wishlist status for the UI
  const finalIsCurrentlyInWishlist = isLoggedIn ? isInWishlist(product._id) : isGuestItemInWishlist;

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click was on a button or its children, don't navigate
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    // Navigate to product page
    router.push(`/products/${product.slug}`);
  };

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    //Plus logic here
    console.log("Plus clicked", product.sku);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Add to cart logic here
    console.log("Add to cart:", product.sku);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!product?._id) return;

    if (isLoggedIn) {
      if (isInWishlist(product._id)) {
        console.log("[ProductCard] Logged in: removing Item From DB Wishlist", product._id);
        removeItemFromWishlist(product._id);
      } else {
        console.log("[ProductCard] Logged in: adding Item to DB Wishlist", product._id);
        addItemToWishlist(product._id);
      }
    } else {
      // Guest user: interact with localStorage
      if (isGuestItemInWishlist) {
        console.log("[ProductCard] Guest: removing Item From Local Wishlist", product._id);
        removeItemFromGuestWishlist(product._id);
      } else {
        console.log("[ProductCard] Guest: adding Item to Local Wishlist", product._id);
        addItemToGuestWishlist(product._id);
      }
      // Update local state for guest after action
      setIsGuestItemInWishlist(isItemInGuestWishlist(product._id));
    }
    console.log("Wishlist action for SKU:", product.sku);
  };

  return (
    <div onClick={handleCardClick} className='bg-white w-full sm:max-w-[300px] md:max-w-[236px] group cursor-pointer'>
      {/* Product Image */}
      <div className='relative aspect-square w-full flex items-center justify-center bg-grey-light p-2 overflow-clip'>
        {/* hover buttons */}
        {!isDesktop && (
          <Button onClick={handlePlusClick} className='absolute py-4 top-3 right-3 text-black hover:bg-white bg-white/80 rounded-full w-[35px] h-[35px] shadow-md'>
            <Plus size={18} />
          </Button>
        )}
        {isDesktop && (
          <>
            <Button
              onClick={handleAddToCart}
              className='absolute translate-y-16 py-2 h-fit bottom-5 text-white bg-blue-light backdrop-blur-2xl rounded-none w-full hover:bg-blue shadow-lg shadow-black/30 group-hover:translate-y-5'
            >
              <Plus size={20} />
              <span className='text-bold'>Add to cart</span>
            </Button>
            {/* -------- */}
            {/* Wishlist button now visible for both logged-in and guest users on desktop */}
            <WishlistButton
              handleWishlist={handleWishlist}
              isCurrentlyInWishlist={finalIsCurrentlyInWishlist}
              isLoadingWishlist={isLoggedIn ? isLoadingWishlist : false}
              isLoadingProfile={isLoggedIn ? isLoadingProfile : false}
            />
          </>
        )}
        {/* Image */}
        <CldImage className='object-contain w-full h-full' width={236} height={236} src={product.images[0].public_id} alt='Description of my image' />
        {/* On sale tag */}
        <div
          className={`bg-primary ${isDesktop ? "group-hover:-translate-y-9" : ""} transition-all text-white absolute uppercase font-bold text-[9px] px-1 py-0.5 bottom-0 left-0`}
        >
          on sale!
        </div>
      </div>
      {/* Product Info */}
      <div className='py-1 flex flex-col gap-0.5'>
        <div className='font-medium text-[clamp(14px,1.5vw,16px)] line-clamp-1 w-full'>{product.title}</div>
        <div className='text-[clamp(12px,1.5vw,14px)] text-grey-darker'>
          {product.identifiers.brand} {product.identifiers.category}
        </div>
      </div>
      {/* Product Price */}
      <div className='flex gap-1 items-center'>
        <div className='font-bold text-[clamp(15px,1.5vw,16px)] text-blue'>
          {product.retailPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
        </div>
        <div className='font-medium text-[clamp(10px,1vw,10px)] text-primary-dark italic line-through'>
          {product.retailPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
        </div>
      </div>
    </div>
  );
}

interface WishlistButtonProps {
  handleWishlist: (e: React.MouseEvent) => void;
  isCurrentlyInWishlist: boolean;
  isLoadingWishlist: boolean;
  isLoadingProfile: boolean;
}

const WishlistButton = React.memo(function WishlistButton({ handleWishlist, isCurrentlyInWishlist, isLoadingWishlist, isLoadingProfile }: WishlistButtonProps) {
  return (
    <Button
      onClick={handleWishlist}
      disabled={isLoadingProfile || isLoadingWishlist}
      className={`absolute -translate-y-16 py-4 top-3 right-3 ${
        isCurrentlyInWishlist ? "text-primary/50" : "text-black hover:text-primary"
      }  hover:bg-white bg-white rounded-full w-[35px] h-[35px] shadow-md group-hover:translate-y-0`}
    >
      <Heart size={18} fill={isCurrentlyInWishlist ? "#f72323" : "none"} />
    </Button>
  );
});

export default ProductCard;
