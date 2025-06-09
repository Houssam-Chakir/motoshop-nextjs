"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { ProductType } from "@/models/Product";
import { StockType, SizeQuantityType } from "@/models/Stock"; // Adjusted path, assuming @ is root

interface ProductInfoProps {
  product: ProductType;
  stock?: StockType | null;
}

export default function ProductInfo({ product, stock }: ProductInfoProps) {
  console.log('product in product info', product);
  console.log('stock in product info', stock);
  const { _id, title, retailPrice, images, brand, category, season, style, description, specifications, /*inStock, stock as productStockId,*/ identifiers, productModel, wholesalePrice, slug } = product;

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSizeQuantity, setSelectedSizeQuantity] = useState(0);

  const availableSizes = stock?.sizes?.filter(s => s.quantity > 0).map(s => s.size) || [];
  // const stockMap = new Map(stock?.sizes?.map(s => [s.size, s.quantity]));

  useEffect(() => {
    if (selectedSize && stock) {
      const sizeInfo = stock.sizes.find(s => s.size === selectedSize);
      setSelectedSizeQuantity(sizeInfo?.quantity || 0);
      // Reset quantity to 1 if selected size changes and new stock is less than current quantity
      if ((sizeInfo?.quantity || 0) < quantity) {
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

  const handleQuantityChange = (amount: number) => {
    setQuantity((prevQuantity) => {
      const newQuantity = prevQuantity + amount;
      if (newQuantity < 1) return 1;
      // If a size is selected and has stock, cap by its quantity
      if (selectedSize && selectedSizeQuantity > 0 && newQuantity > selectedSizeQuantity) {
        return selectedSizeQuantity;
      }
      // If no size selected or selected size has no stock, user shouldn't be able to increment quantity beyond 1.
      // The buttons for quantity change are already conditionally rendered or disabled,
      // but this provides an additional safeguard.
      if ((!selectedSize || selectedSizeQuantity === 0) && newQuantity > 1) {
         return 1;
      }
      return newQuantity;
    });
  };

  const nextImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
      {/* Left side - Images */}
      <div className='space-y-4'>
        {/* Main image */}
        <div className='overflow-hidden relative h-96 bg-gray-50 rounded-lg'>
          <Image src={(currentImageIndex >= 0 && images[currentImageIndex]?.secure_url) || "/placeholder-product.png"} alt={title} fill className='object-contain w-full h-full' />
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
              className={`flex-shrink-0 w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border-2 ${currentImageIndex === index ? "border-blue-500" : "border-transparent"}`}
              onClick={() => setCurrentImageIndex(index)}
            >
              <Image src={img.secure_url || "/placeholder-product.png"} alt={`${title} - view ${index + 1}`} width={64} height={64} className='object-contain w-full h-full' />
            </button>
          ))}
        </div>
      </div>

      {/* Right side - Product details */}
      <div className='space-y-6'>
        {/* Product title and category */}
        <div>
          <h1 className='mb-2 text-2xl font-bold text-gray-900'>{title}</h1>
          <p className='text-gray-600'>
            {identifiers?.brand || brand?.name} • {identifiers?.category || category?.name}
          </p>
        </div>

        {/* Price and badges */}
        <div className='space-y-2'>
          <div className='flex gap-3 items-center'>
            <span className='text-3xl font-bold text-blue-900'>{retailPrice?.toLocaleString("en-US")} DH</span>
            <Badge className='text-white bg-red-500 hover:bg-red-600'>ON SALE!</Badge>
            <Badge className='text-white bg-orange-500 hover:bg-orange-600'>SUMMER SALE</Badge>
          </div>
          <p className='text-blue-600'>
            <span className='text-gray-500 line-through'>{retailPrice}</span> saving 1000.00 DH + Free shipping
          </p>
        </div>

        {/* Size selection */}
        <div className='p-4 space-y-4 rounded-lg border border-gray-300 border-dashed'>
          <div>
            <label className='block mb-3 text-sm font-medium text-gray-900'>
              Size:<span className='text-red-500'>*</span>
            </label>
            <div className='flex flex-wrap gap-2'>
              {/* Use availableSizes derived from stock prop */}
              {stock && stock.sizes && stock.sizes.length > 0 ? (
                stock.sizes.map((sizeInfo) => (
                  <button
                    key={sizeInfo.size}
                    className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors ${selectedSize === sizeInfo.size ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 text-gray-700 hover:border-gray-400"} ${sizeInfo.quantity === 0 ? "opacity-50 cursor-not-allowed line-through" : ""}`}
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
                <p className="text-sm text-gray-500">No size information available or product is out of stock.</p>
              )}
            </div>
          </div>

          {/* Quantity - only show if a size with positive stock is selected */}
          {selectedSize && selectedSizeQuantity > 0 && (
            <div>
              <label className='block mb-3 text-sm font-medium text-gray-900'>Quantity:</label>
              <div className='flex gap-3 items-center'>
                <Button variant='outline' size='icon' onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  <Minus className='w-4 h-4' />
                </Button>
                <span className='w-12 font-medium text-center'>{quantity}</span>
                <Button variant='outline' size='icon' onClick={() => handleQuantityChange(1)} disabled={quantity >= selectedSizeQuantity}>
                  <Plus className='w-4 h-4' />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Required options message or stock status */}
        {!selectedSize && stock && stock.sizes && stock.sizes.filter(s => s.quantity > 0).length > 0 && (
          <p className='text-sm italic text-gray-500'>Choose required(*) options first</p>
        )}
        {selectedSize && selectedSizeQuantity === 0 && stock?.sizes?.find(s => s.size === selectedSize)?.quantity === 0 && (
          <p className='text-sm font-medium text-red-500'>This size is out of stock.</p>
        )}
        {(!stock || !stock.sizes || stock.sizes.filter(s => s.quantity > 0).length === 0) && (
            <p className='text-sm font-medium text-red-500'>This product is currently out of stock.</p>
        )}

        {/* Description */}
        {description && (
          <div className='pt-4 border-t border-gray-200'>
            <h3 className='mb-2 text-lg font-medium text-gray-900'>Description</h3>
            <p className='text-gray-600'>{description}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className='flex gap-3'>
          <Button variant='outline' size='icon' className='flex-shrink-0'>
            <Heart className='w-5 h-5' />
          </Button>
          <Button variant='outline' className='flex-1' disabled={!selectedSize || quantity > selectedSizeQuantity || selectedSizeQuantity === 0}>
            <Plus className='mr-2 w-4 h-4' />
            Add to cart
          </Button>
          <Button className='flex-1 bg-blue-900 hover:bg-blue-800' disabled={!selectedSize || quantity > selectedSizeQuantity || selectedSizeQuantity === 0}>
            <ShoppingCart className='mr-2 w-4 h-4' />
            Buy now
          </Button>
        </div>
      </div>
    </div>
  );
}
