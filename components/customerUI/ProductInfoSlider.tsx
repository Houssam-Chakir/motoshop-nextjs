'use client';

import React, { useState } from "react";
import { MobileSlider } from "@/components/customerUI/sideBar/MobileSidebar";
import { getProductWithStock } from "@/actions/cartActions";
import { ProductType } from "@/models/Product";
import { StockType } from "@/models/Stock";
import ProductInfoMobile from "./ProductInfoMobile";

interface ProductInfoSliderProps {
  children: React.ReactNode;
  product: ProductType;
  isLoggedIn: boolean;
}

type SliderDataType = {
  product: ProductType;
  stock: StockType | null;
} | null;

export default function ProductInfoSlider({ children, product, isLoggedIn }: ProductInfoSliderProps) {
  const [isSliderOpen, setIsSliderOpen] = useState(false);
  const [isSliderLoading, setIsSliderLoading] = useState(false);
  const [sliderData, setSliderData] = useState<SliderDataType>(null);
  const [sliderError, setSliderError] = useState<string | null>(null);

  const handleTriggerClick = async () => {
    setIsSliderOpen(true);
    setIsSliderLoading(true);
    setSliderError(null);

    try {
      const result = await getProductWithStock(product._id);
      if (result.success && result.data) {
        setSliderData(result.data);
      } else {
        throw new Error(result.message || "Failed to fetch product details.");
      }
    } catch (error) {
      console.error(error);
      setSliderError(error instanceof Error ? error.message : "An error occurred.");
    } finally {
      setIsSliderLoading(false);
    }
  };

  return (
    <MobileSlider
      side='bottom'
      isOpen={isSliderOpen}
      setIsOpen={setIsSliderOpen}
      className="w-full h-[95vh]"
      trigger={<div onClick={handleTriggerClick}>{children}</div>}
    >
      <div className="w-full">
        {isSliderLoading && (
          <div className='flex justify-center items-center h-48'>
            <p>Loading product details...</p>
          </div>
        )}
        {sliderError && (
          <div className='text-red-600'>
            <p>Error:</p>
            <p>{sliderError}</p>
          </div>
        )}
        {!isSliderLoading && sliderData && (
          <ProductInfoMobile isLoggedIn={isLoggedIn} product={sliderData.product} stock={sliderData.stock} />
        )}
      </div>
    </MobileSlider>
  );
}
