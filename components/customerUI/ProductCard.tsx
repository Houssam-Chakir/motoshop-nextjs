"use client";

import { ReviewType } from "@/models/Review";
import { CldImage } from "next-cloudinary";
import { Button } from "../ui/button";
import { Heart, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import useMediaQuery from "@/hooks/useMediaQuery";
import { useUserContext } from "@/contexts/UserContext";
import React, { useState, useEffect } from "react";
import { addItemToGuestWishlist, removeItemFromGuestWishlist, isItemInGuestWishlist } from "@/lib/guestWishlistStore";
import { getProductWithStock } from "@/actions/cartActions";
import { ProductType } from "@/models/Product";
import { StockType } from "@/models/Stock";
import { Modal } from "../Modal";
import ProductInfoSlider from "./ProductInfoSlider";
import ProductInfo from "./ProductInfo";
import { SaleDocument } from "@/models/Sale";

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
  salePrice: number;
  reviews: ReviewType[];
  season: string;
  sku: string;
  slug: string;
  specifications: Array<{ name: string; description: string }>;
  stock: string;
  quantity: number;
  style: string;
  title: string;
  type: string;
  updatedAt: string;
  wholesalePrice: number;
  saleInfo: SaleDocument;
  _id: string;
}

type ModalDataType = {
  product: ProductType;
  stock: StockType | null;
} | null;

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

  const finalePrice = product.salePrice ? product.salePrice : product.retailPrice;

  const isLoggedIn = !!profile;
  const [isGuestItemInWishlist, setIsGuestItemInWishlist] = useState(false);

  // State for the modal itself
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State for fetching data FOR the modal
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalData, setModalData] = useState<ModalDataType>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const handleOpenAddToCartModal = async () => {
    setIsModalOpen(true); // Open modal shell immediately
    setIsModalLoading(true); // Show loading state
    setModalError(null); // Clear previous errors

    try {
      // Call the server action to get fresh product and stock data
      const result = await getProductWithStock(product._id);

      if (result.success && result.data) {
        setModalData(result.data); // Set the fetched data
      } else {
        throw new Error(result.message || "Failed to fetch product details.");
      }
    } catch (error) {
      console.error(error);
      setModalError(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsModalLoading(false); // Stop loading state
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // It's good practice to clear data when modal closes
    setModalData(null);
    setModalError(null);
  };

  useEffect(() => {
    const updateGuestWishlistStatus = () => {
      if (!isLoggedIn && product?._id) {
        setIsGuestItemInWishlist(isItemInGuestWishlist(product._id));
      }
    };
    // Initial status check
    updateGuestWishlistStatus();
    // Listen for global guest wishlist changes
    window.addEventListener("guestWishlistChanged", updateGuestWishlistStatus);
    // Cleanup listener on component unmount or when dependencies change
    return () => {
      window.removeEventListener("guestWishlistChanged", updateGuestWishlistStatus);
    };
  }, [isLoggedIn, product?._id]);

  // Determine the final wishlist status for the UI
  const finalIsCurrentlyInWishlist = isLoggedIn ? isInWishlist(product._id) : isGuestItemInWishlist;

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click was on a button or its children, don't navigate
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    // Navigate to product page
    router.push(`/product/${product.slug}`);
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
        addItemToWishlist({
          id: product._id,
          title: product.title,
          imageUrl: product.images?.[0]?.secure_url,
          retailPrice: product.retailPrice,
          identifiers: product.identifiers,
          slug: product.slug,
          quantity: product.quantity,
          salePrice: product.salePrice ? product.salePrice : null,
        });
      }
    } else {
      // Guest user: interact with localStorage
      if (isGuestItemInWishlist) {
        console.log("[ProductCard] Guest: removing Item From Local Wishlist", product._id);
        removeItemFromGuestWishlist(product._id);
      } else {
        console.log("[ProductCard] Guest: adding Item to Local Wishlist", product._id);
        addItemToGuestWishlist({
          id: product._id,
          title: product.title,
          identifiers: product.identifiers,
          retailPrice: product.retailPrice,
          imageUrl: product.images[0].secure_url,
          slug: product.slug,
          quantity: product.quantity,
          salePrice: product.salePrice ? product.salePrice : product.retailPrice,
        });
      }
      // Update local state for guest after action
      setIsGuestItemInWishlist(isItemInGuestWishlist(product._id));
    }
    console.log("Wishlist action for SKU:", product.sku);
  };

  return (
    <div onClick={handleCardClick} className='bg-white w-full sm:max-w-[300px] md:max-w-[236px] group cursor-pointer'>
      {/* Modal -------------------------------------------------------------------------- */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={isModalLoading ? "Loading..." : "Overview"}>
        {/* Modal Content Logic */}
        {isModalLoading && (
          <div className='flex justify-center items-center h-48'>
            {/* Replace with your preferred spinner component */}
            <p>Loading product details...</p>
          </div>
        )}
        {modalError && (
          <div className='text-red-600'>
            <p>Error:</p>
            <p>{modalError}</p>
          </div>
        )}
        {!isModalLoading && modalData && (
          <div>
            <ProductInfo isLoggedIn={isLoggedIn} product={modalData.product} stock={modalData.stock} />
          </div>
        )}
      </Modal>
      {/* /Modal -------------------------------------------------------------------------- */}
      {/* Product Image */}
      <div className='flex relative justify-center items-center p-2 w-full overflow-clip aspect-square bg-grey-light'>
        {/* hover buttons */}
        {!isDesktop && (
          <ProductInfoSlider product={product} isLoggedIn={isLoggedIn}>
            <Button className='absolute py-4 top-3 right-3 text-black hover:bg-white bg-white/80 rounded-full w-[35px] h-[35px] shadow-md'>
              <Plus size={18} />
            </Button>
          </ProductInfoSlider>
        )}
        {isDesktop && (
          <>
            <Button
              onClick={handleOpenAddToCartModal}
              className='absolute bottom-5 py-2 w-full text-white rounded-none shadow-lg backdrop-blur-2xl translate-y-16 h-fit bg-blue-light hover:bg-blue shadow-black/30 group-hover:translate-y-5'
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
        {product.salePrice > 0 && (
          <div
            className={`bg-primary ${
              isDesktop ? "group-hover:-translate-y-9" : ""
            } transition-all text-white absolute uppercase font-bold text-[12px] px-1.5 py-0.5 bottom-0 left-0`}
          >
            {product.saleInfo.discountType === "percentage" ? `-${product.saleInfo.discountValue}%` : `-${product.saleInfo.discountValue} MAD`}
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className='flex flex-col py-1 leading-5'>
        <div className='font-medium text-[clamp(14px,1.5vw,16px)] line-clamp-1 w-full'>{product.title}</div>
        <div className='text-[clamp(11px,1.5vw,12px)] text-grey-darker'>
          {product.identifiers.brand} {product.identifiers.category}
        </div>
      </div>
      {/* Product Price */}
      <div className='flex gap-1 items-center'>
        <div className='flex gap-1 items-center'>
          <div className='font-bold text-blue text-[clamp(15px,1.5vw,16px)]'>{finalePrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div className='text-[clamp(10px,1.5vw,14px)] text-blue'>
            <span className='font-bold text-[clamp(15px,1.5vw,16px)]'> MAD</span>
          </div>
        </div>
        {product.saleInfo && (
          <div className='flex gap-1 text-success-green items-center line-through italic font-medium'>
            <div className=' text-[12px]'>{product.retailPrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
            <div className='text-[12px]'>
              <span className='text-[12px]'> MAD</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

//* WISHLIST BUTTON /////////////////////////////////////////////////////////////////////////////
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
