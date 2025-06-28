"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { ProductType } from "@/models/Product";
import { StockType, SizeQuantityType } from "@/models/Stock"; // Adjusted path, assuming @ is root
import { CldImage } from "next-cloudinary";
import { toast } from "react-toastify";
import { addItemToGuestCart } from "@/lib/guestCartStore";
import { addItemToCart } from "@/actions/cartActions";
import { useUserContext } from "@/contexts/UserContext";
import { SaleDocument } from "@/models/Sale";

interface ProductInfoProps {
  product: Omit<ProductType, "saleInfo"> & {
    saleInfo: SaleDocument | null;
    stock: StockType | null;
  };
  isLoggedIn?: boolean;
}

export default function ProductInfo({ product, isLoggedIn }: ProductInfoProps) {
  const { fetchCart } = useUserContext();
  console.log("Product in product info", product);
  const { _id, title, retailPrice, salePrice, saleInfo, images, brand, category, season, style, identifiers, quantity: stockQuantity, slug, stock } = product;

  const finalPrice = salePrice ? salePrice : retailPrice;
  const savedAmount = salePrice ? retailPrice - salePrice : 0;

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSizeQuantity, setSelectedSizeQuantity] = useState(0);

  const availableSizes = stock?.sizes?.filter((s) => s.quantity > 0).map((s) => s.size) || [];
  console.log(availableSizes);
  // const stockMap = new Map(stock?.sizes?.map(s => [s.size, s.quantity]));

  useEffect(() => {
    if (selectedSize && stock?.sizes) {
      const sizeInfo = stock.sizes.find((s) => s.size === selectedSize);
      const availableQuantity = sizeInfo?.quantity || 0;
      setSelectedSizeQuantity(availableQuantity);
      // Reset quantity to 1 if selected size changes and new stock is less than current quantity
      if (availableQuantity < quantity) {
        setQuantity(1);
      }
    } else {
      setSelectedSizeQuantity(0);
    }
  }, [selectedSize, stock, quantity]);

  useEffect(() => {
    if (images.length === 0) {
      setCurrentImageIndex(-1);
    } else if (currentImageIndex >= images.length || currentImageIndex < 0) {
      setCurrentImageIndex(0);
    }
  }, [images, currentImageIndex]);

  // Auto-select size if there's only one available
  useEffect(() => {
    if (stock?.sizes) {
      const availableSizes = stock.sizes.filter((s) => s.quantity > 0);
      if (availableSizes.length === 1) {
        setSelectedSize(availableSizes[0].size);
      }
    }
  }, [stock]);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + amount;

      // Don't allow quantity to go below 1
      if (newQuantity < 1) return 1;

      // If a size is selected and stock data is available
      if (selectedSize && stock?.sizes) {
        // Find the selected size in the stock data
        const sizeInfo = stock.sizes.find((s) => s.size === selectedSize);
        const maxQuantity = sizeInfo?.quantity || 0;

        // Don't allow quantity to exceed available stock for the selected size
        if (newQuantity > maxQuantity) {
          return maxQuantity > 0 ? maxQuantity : 1;
        }

        return newQuantity;
      }

      // If no size is selected or no stock data, don't allow adding to cart (quantity should be 1)
      return 1;
    });
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (!product?._id) return;

    if (isLoggedIn) {
      // add item to logged in user cart or create new cart for user
      const result = await addItemToCart({ productId: product._id, size: selectedSize, quantity: quantity });
      if (result.success) {
        toast.success(result.message);
        await fetchCart();
      } else {
        toast.error(result.message);
      }
    } else {
      // add item to guest cart
      const productWithStockStatus = {
        ...product,
        inStock: product.stock?.sizes?.some((s) => s.quantity > 0) ?? false,
      };
      console.log('Product added to guest cart', productWithStockStatus);
      const result = addItemToGuestCart(productWithStockStatus, selectedSize, quantity);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    }
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const currentImage = currentImageIndex >= 0 ? images[currentImageIndex]?.secure_url : "/placeholder-product.png";

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
      {/* Left side - Images */}
      <div className='space-y-4'>
        {/* Main image */}
        <div className='overflow-hidden relative h-96 bg-grey-light'>
          <CldImage
            src={currentImage}
            alt={product.title}
            fill
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
            className='object-contain transition-transform duration-500 ease-in-out group-hover:scale-105'
          />
          {images.length > 1 && (
            <>
              <Button variant='ghost' size='icon' className='absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white' onClick={prevImage}>
                <ChevronLeft className='w-5 h-5' />
              </Button>
              <Button variant='ghost' size='icon' className='absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white' onClick={nextImage}>
                <ChevronRight className='w-5 h-5' />
              </Button>
            </>
          )}
        </div>

        {/* Thumbnail images */}
        <div className='flex overflow-x-auto gap-2'>
          {images.map((img, index) => (
            <button
              key={index}
              className={`flex-shrink-0 w-16 h-16 bg-gray-50 rounded-xs overflow-hidden border-2 ${currentImageIndex === index ? "border-blue-500" : "border-transparent"}`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <CldImage src={img.secure_url || "/placeholder-product.png"} alt={`${title} - view ${index + 1}`} width={64} height={64} className='object-contain w-full h-full' />
            </button>
          ))}
        </div>
      </div>

      {/* Right side - Product details */}
      <div className='flex flex-col justify-between space-y-6'>
        <div className='space-y-6'>
          {/* Product title and category */}
          <div className='space-y-0'>
            <h1 className='mb text-[24px]/8 font-black tracking-wide uppercase line-clamp-2 text-2'>{title}</h1>
            <p className='text-grey-darker'>
              {identifiers?.brand || brand?.name} {style} {identifiers?.category || category?.name} - {season}
            </p>
          </div>
          <div className='space-y-6'>
            {/* Price and badges */}
            <div className='space-y-0'>
              <div className='flex gap-1 md:gap-2 lg:gap-3 items-center'>
                <span className='md:text-2xl text-3xl font-black tracking-wider text-blue-900'>{finalPrice?.toLocaleString("en-US")} MAD</span>
                {saleInfo && (
                  <>
                    <Badge className='text-white rounded-none bg-primary'>
                      {saleInfo.discountType === "percentage" ? `-${saleInfo.discountValue}%` : `${saleInfo.discountValue} MAD`}
                    </Badge>
                    <Badge className='text-white rounded-none bg-orange-600'>{saleInfo.name}</Badge>
                  </>
                )}
              </div>
              <p className='italic text-[13px] text-success-green'>
                <span className='line-through text-grey-darker'>{retailPrice?.toLocaleString("en-US")} MAD</span> saving {savedAmount?.toLocaleString("en-US")} MAD + Free shipping
              </p>
            </div>

            {/* Size selection */}
            <div className='p-4 space-y-4 border border-gray-300 border-dashed'>
              <div>
                <label className='block mb-3 text-sm font-medium text-gray-900'>
                  Size:<span className='text-red-500'>*</span>
                </label>
                <div className='flex flex-wrap gap-2'>
                  {/* Use availableSizes derived from stock prop */}
                  {product.stock && product.stock.sizes && product.stock.sizes.length > 0 ? (
                    product.stock.sizes.map((sizeInfo) => (
                      <button
                        key={sizeInfo.size}
                        className={`px-3 py-2 border rounded-full text-sm font-medium transition-colors ${
                          selectedSize === sizeInfo.size ? "border-blue-500 bg-blue-50 text-blue-700" : "border-grey-darker text-black hover:bg-grey"
                        } ${sizeInfo.quantity === 0 ? "opacity-50 cursor-not-allowed line-through" : ""}`}
                        onClick={() => {
                          if (sizeInfo.quantity > 0) {
                            setSelectedSize(sizeInfo.size);
                          } // Do not select if quantity is 0
                        }}
                        disabled={sizeInfo.quantity === 0} // Disable button if quantity is 0
                      >
                        {sizeInfo.size}
                      </button>
                    ))
                  ) : (
                    <p className='text-sm text-gray-500'>No size information available or product is out of stock.</p>
                  )}
                </div>
              </div>
              {/* Quantity */}
              {(product.stock?.sizes?.length ?? 0) > 0 && (
                <div>
                  <label className='block mb-3 text-sm font-medium text-gray-900'>Quantity:</label>
                  <div className={`flex gap-3 items-center rounded-full border w-fit *:border-none *:bg-white/0 transition-opacity ${!selectedSize ? "opacity-50" : ""}`}>
                    <Button className='rounded-l-full' variant='outline' size='icon' onClick={() => handleQuantityChange(-1)} disabled={!selectedSize || quantity <= 1}>
                      <Minus className='pl-2 w-6' />
                    </Button>
                    <span className='w-6 font-medium text-center'>{quantity}</span>
                    <Button
                      className='rounded-r-full'
                      variant='outline'
                      size='icon'
                      onClick={() => handleQuantityChange(1)}
                      disabled={!selectedSize || (selectedSizeQuantity > 0 && quantity >= selectedSizeQuantity)}
                    >
                      <Plus className='w-6 h-6' />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div>
          <div className='flex flex-col gap-1'>
            {/* Required options message or stock status */}
            {!selectedSize && stock && stock.sizes && stock.sizes.filter((s) => s.quantity > 0).length > 0 && (
              <p className='text-[13px] italic text-grey-darker'>Choose required(*) options first</p>
            )}
            {selectedSize && selectedSizeQuantity === 0 && stock?.sizes?.find((s) => s.size === selectedSize)?.quantity === 0 && (
              <p className='text-[13px] font-medium text-primary'>This size is out of stock.</p>
            )}
            {(!stock || !stock.sizes || stock.sizes.filter((s) => s.quantity > 0).length === 0) && (
              <p className='text-[13px] font-medium text-primary'>This product is currently out of stock.</p>
            )}

            {/* Action buttons */}
            <div className='flex gap-3'>
              <Button variant='outline' size='lg' className='flex-shrink-0 h-12 w-12 text-[16px] rounded-full border-grey-darker'>
                <Heart className='size-6' />
              </Button>
              <Button
                onClick={handleAddToCart}
                variant='outline'
                size='lg'
                className='flex-1 h-12 text-[16px] rounded-full border-grey-darker'
                disabled={!selectedSize || quantity > selectedSizeQuantity || selectedSizeQuantity === 0}
              >
                <Plus className='size-6' />
                Add to cart
              </Button>
              <Button
                className='flex-1 h-12 text-[16px] rounded-full bg-blue hover:bg-blue-800 '
                disabled={!selectedSize || quantity > selectedSizeQuantity || selectedSizeQuantity === 0}
              >
                <ShoppingCart className='size-6' />
                Buy now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
