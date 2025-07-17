"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, BadgeDollarSign, Tag, PackageCheck, RefreshCcw, Timer, PackagePlus } from "lucide-react";
import type { ProductType } from "@/models/Product";
import type { StockType } from "@/models/Stock";
import { CldImage } from "next-cloudinary";
import { toast } from "react-toastify";
import { addItemToGuestCart } from "@/lib/guestCartStore";
import { addItemToCart } from "@/actions/cartActions";
import { useUserContext } from "@/contexts/UserContext";
import type { SaleDocument } from "@/models/Sale";
import Breadcrumbs from "@/components/Breadcrumbs";
import useMediaQuery from "@/hooks/useMediaQuery";
import ProductMobileCTAs from "./ProductCTAsMobile";
import ProductTitlePriceMobile from "./ProductInfoMobile";
import { addItemToGuestWishlist, isItemInGuestWishlist, removeItemFromGuestWishlist } from "@/lib/guestWishlistStore";
import { handleWishlistProcess } from "@/utils/handleWishlist";

function toKebabCase(str: string) {
  return str
    .toLowerCase()
    .replace(/\s+/g, " ") // collapse multiple spaces
    .trim()
    .replace(/ /g, "-");
}

interface ProductInfoProps {
  product: Omit<ProductType, "saleInfo"> & {
    saleInfo: SaleDocument | null;
    stock: StockType;
  };
}

export default function ProductDetailsSection({ product }: ProductInfoProps) {
  const isDesktop = useMediaQuery("lg");
  const {
    profile, // To check if user is logged in
    isInWishlist,
    addItemToWishlist,
    removeItemFromWishlist,
    fetchCart,
  } = useUserContext();
  const isLoggedIn = !!profile;
  const [isGuestItemInWishlist, setIsGuestItemInWishlist] = useState(false);
  const finalIsCurrentlyInWishlist = isLoggedIn ? isInWishlist(product._id) : isGuestItemInWishlist;

  const {
    _id,
    title,
    retailPrice,
    salePrice,
    saleInfo,
    images,
    brand,
    type,
    category,
    season,
    style,
    identifiers,
    slug,
    stock,
    quantity: productQuantity,
    specifications,
  } = product;
  console.log("product: ", product);

  const categoryPathname = category?.name ? toKebabCase(category.name) : "unknown-category";
  const typePathname = type?.name ? toKebabCase(type.name) : "unknown-type";
  const pathSegments = ["products", categoryPathname, typePathname, slug];
  const pathname = pathSegments.join("/");

  const finalPrice = salePrice ? salePrice : retailPrice;
  const savedAmount = salePrice ? retailPrice - salePrice : 0;

  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSizeQuantity, setSelectedSizeQuantity] = useState(0);

  const handleWishlist = (e: React.MouseEvent) => {
    const wishlistProduct = {
      id: product._id,
      title: product.title,
      identifiers: product.identifiers,
      retailPrice: product.retailPrice,
      imageUrl: product.images[0].secure_url,
      slug: product.slug!,
      quantity: product.quantity!,
      salePrice: product.salePrice ? product.salePrice : null,
    };
    const params = { wishlistProduct, isLoggedIn, isInWishlist, removeItemFromWishlist, addItemToWishlist, isGuestItemInWishlist, setIsGuestItemInWishlist };
    e.stopPropagation(); // Prevent card click

    if (!product?._id) return;
    handleWishlistProcess(params);

    console.log("Wishlist action for SKU:", product.sku);
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

  useEffect(() => {
    if (selectedSize && stock?.sizes) {
      const sizeInfo = stock.sizes.find((s) => s.size === selectedSize);
      const availableQuantity = sizeInfo?.quantity || 0;
      setSelectedSizeQuantity(availableQuantity);

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

      if (newQuantity < 1) return 1;

      if (selectedSize && stock?.sizes) {
        const sizeInfo = stock.sizes.find((s) => s.size === selectedSize);
        const maxQuantity = sizeInfo?.quantity || 0;

        if (newQuantity > maxQuantity) {
          return maxQuantity > 0 ? maxQuantity : 1;
        }
        return newQuantity;
      }

      return 1;
    });
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product?._id) return;

    if (profile) {
      const result = await addItemToCart({ productId: product._id, size: selectedSize, quantity: quantity });
      if (result.success) {
        toast.success(result.message);
        await fetchCart();
      } else {
        toast.error(result.message);
      }
    } else {
      const productWithStockStatus = {
        ...product,
        inStock: stock?.sizes?.some((s) => s.quantity > 0) ?? false,
      };
      console.log("Product added to guest cart", productWithStockStatus);
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
    <>
      <div className='py-4'>
        <Breadcrumbs path={pathname} />
      </div>
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
        {/* Left side - Images (scrollable) */}
        <div className='space-y-2'>
          {/* Main image */}
          <div className='grid gap-1 w-full'>
            <div className='overflow-hidden relative grow h-96 bg-grey-light'>
              <CldImage
                src={currentImage}
                alt={product.title}
                fill
                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                className='object-contain transition-transform duration-500 ease-in-out group-hover:scale-105'
              />
              {images.length > 1 && (
                <>
                  <Button variant='ghost' size='icon' className='rounded-full absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white' onClick={prevImage}>
                    <ChevronLeft className='w-5 h-5' />
                  </Button>
                  <Button variant='ghost' size='icon' className='rounded-full absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white' onClick={nextImage}>
                    <ChevronRight className='w-5 h-5' />
                  </Button>
                </>
              )}
            </div>
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

          {!isDesktop && (
            <ProductTitlePriceMobile productInfo={{ brand, identifiers, type, season, style, title, saleInfo, finalPrice, savedAmount, retailPrice, productQuantity }} />
          )}

          {/* Additional content that should scroll with images */}
          <div className='space-y-6 pt-2'>
            {/* Description section */}
            <div className='space-y-2'>
              <h2 className='text-xl font-medium'>Description:</h2>
              <div className='font-light text-sm'>
                <p>Experience ultimate safety and comfort with our Premium Sport Touring Motorcycle Helmet. Designed for adventure and long rides, this helmet features:</p>
                <ul className='list-disc pl-6 space-y-1 font-light text-sm'>
                  <li>Aerodynamic Shell: Lightweight, impact-resistant composite material for maximum protection.</li>
                  <li>Integrated Sun Visor: Easily adjustable for varying light conditions.</li>
                  <li>Ventilation System: Multi-point airflow for enhanced breathability.</li>
                  <li>Comfort Lining: Removable, washable, and hypoallergenic interior for a snug fit.</li>
                  <li>Advanced Safety Certification: Meets DOT and ECE standards for guaranteed protection.</li>
                </ul>
                <p>Choose from multiple sizes and colors to match your style and ensure a perfect fit.</p>
              </div>
            </div>
            {/* Specs table */}
            {specifications && (
              <div className='relative overflow-x-auto pt-2'>
                <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
                  <thead className='text-xs text-gray-700 uppercase bg-grey-light dark:bg-gray-700 dark:text-gray-400'>
                    <tr>
                      <th scope='col' className='px-6 py-3'>
                        Specification
                      </th>
                      <th scope='col' className='px-6 py-3'>
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {specifications.map((spec, i) => {
                      return (
                        <tr key={i} className='bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200'>
                          <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white'>
                            {spec.name}
                          </th>
                          <td className='px-6 py-4'>{spec.description}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {!isDesktop && (
              <div className='flex flex-col gap-2 pb-32'>
                <p className='flex items-center gap-2 text-xs text-slate-900'>
                  <PackageCheck size={16} className='text-success-green' /> <span className='font-bold'>Free shipping</span> for orders total over 500DH
                </p>
                <p className='flex items-center gap-2 text-xs text-slate-900'>
                  <Timer size={16} className='text-success-green' /> <span className='font-bold'>Fast shipping</span> across Morocco
                </p>
                <p className='flex items-center gap-2 text-xs text-slate-900'>
                  <RefreshCcw size={16} className='text-success-green' /> <span className='font-bold'>Product returns</span> after delivery
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Product details (sticky) */}
        {isDesktop && (
          <div className='lg:sticky lg:top-35 lg:self-start'>
            <div className='flex flex-col justify-between space-y-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto'>
              <div className='space-y-2'>
                {/* Product title and category */}
                <div className='space-y-0'>
                  <h1 className='[font-size:clamp(20px,4vw,24px)] font-black tracking-wide uppercase line-clamp-2 text-2'>{title}</h1>
                  <p className='text-grey-darker font-light'>
                    <span className='font-medium'>{brand?.name || identifiers?.brand}</span> {type?.name || identifiers?.categoryType} - {season} {style.toLocaleLowerCase()}
                  </p>
                </div>

                <div className='space-y-3'>
                  {/* Price and badges */}
                  <div className='space-y-0'>
                    <div className='flex gap-1 md:gap-2 lg:gap-3 items-center pb-1'>
                      <span className='pt-1 md:text-2xl text-3xl font-black tracking-wider text-blue-900'>{finalPrice?.toLocaleString("en-US")} MAD</span>
                      {!saleInfo && (
                        <Badge className='text-emerald-50 rounded-none bg-emerald-600'>
                          <BadgeDollarSign /> BEST PRICES
                        </Badge>
                      )}

                      {saleInfo && (
                        <div>
                          <Badge className='text-white rounded-none bg-primary'>
                            {saleInfo.discountType === "percentage" ? `-${saleInfo.discountValue}%` : `${saleInfo.discountValue} MAD`} <Tag />
                          </Badge>
                          <Badge className='text-white rounded-none bg-orange-600'>{saleInfo.name}</Badge>
                        </div>
                      )}
                    </div>
                    {saleInfo && (
                      <p className='flex gap-1 items-center italic text-[13px] text-success-green'>
                        <BadgeDollarSign size={14} /> <span className='line-through text-grey-darker'>{retailPrice?.toLocaleString("en-US")} MAD</span> saving{" "}
                        {savedAmount?.toLocaleString("en-US")} MAD
                      </p>
                    )}
                    {productQuantity && productQuantity > 5 && (
                      <p className='flex items-center gap-1 italic text-[13px] text-success-green'>
                        <PackagePlus size={14} /> Product in stock! ( {productQuantity} )
                      </p>
                    )}
                    {productQuantity && productQuantity < 5 && (
                      <p className='flex items-center gap-1 italic text-[13px] text-orange-600'>
                        <PackagePlus size={14} /> Only {productQuantity} piece{productQuantity > 1 ? "s" : ""} left in stock!
                      </p>
                    )}
                  </div>

                  {/* Size selection */}
                  <div className='p-4 space-y-4 custom-dashed'>
                    <div>
                      <label className='block mb-3 text-sm font-medium text-gray-900'>
                        Size:<span className='text-red-500'>*</span>
                      </label>
                      <div className='flex flex-wrap gap-2'>
                        {stock && stock.sizes && stock.sizes.length > 0 ? (
                          stock.sizes.map((sizeInfo) => (
                            <button
                              key={sizeInfo.size}
                              className={`px-3 py-2 border rounded-full text-sm font-medium transition-colors ${
                                selectedSize === sizeInfo.size ? "border-blue-500 bg-blue-50 text-blue-700" : "border-grey-darker text-black hover:bg-grey"
                              } ${sizeInfo.quantity === 0 ? "opacity-50 cursor-not-allowed line-through" : ""}`}
                              onClick={() => {
                                if (sizeInfo.quantity > 0) {
                                  setSelectedSize(sizeInfo.size);
                                }
                              }}
                              disabled={sizeInfo.quantity === 0}
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
                    {(stock?.sizes?.length ?? 0) > 0 && (
                      <div>
                        <label className='block mb-3 text-sm font-medium text-gray-900'>Quantity:</label>
                        <div className={`flex gap-3 items-center rounded-full border w-fit *:border-none *:bg-white/0 transition-opacity ${!selectedSize ? "opacity-50" : ""}`}>
                          <Button
                            className='rounded-l-full bg-transparent'
                            variant='outline'
                            size='icon'
                            onClick={() => handleQuantityChange(-1)}
                            disabled={!selectedSize || quantity <= 1}
                          >
                            <Minus className='pl-2 w-6' />
                          </Button>
                          <span className='w-6 font-medium text-center'>{quantity}</span>
                          <Button
                            className='rounded-r-full bg-transparent'
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

              {/* Bottom section DESKTOP */}
              <div>
                <div className='flex flex-col gap-1'>
                  {/* Required options message or stock status */}
                  {!selectedSize && stock && stock.sizes && stock.sizes.filter((s) => s.quantity > 0).length > 0 && (
                    <p className='text-[13px] italic text-grey-darker'>
                      Choose required(<span className='text-primary'>*</span>) options first
                    </p>
                  )}
                  {selectedSize && selectedSizeQuantity === 0 && stock?.sizes?.find((s) => s.size === selectedSize)?.quantity === 0 && (
                    <p className='text-[13px] font-medium text-primary'>This size is out of stock.</p>
                  )}
                  {(!stock || !stock.sizes || stock.sizes.filter((s) => s.quantity > 0).length === 0) && (
                    <p className='text-[13px] font-medium text-primary'>This product is currently out of stock.</p>
                  )}

                  {/* Action buttons */}
                  <div className='flex gap-3'>
                    <Button
                      onClick={handleWishlist}
                      variant='outline'
                      size='lg'
                      className={`flex-shrink-0 h-12 w-12 text-[16px] ${
                        finalIsCurrentlyInWishlist ? "text-primary/50" : "text-black"
                      } hover:text-primary rounded-full border-grey-darker bg-transparent`}
                    >
                      <Heart className='size-6' fill={finalIsCurrentlyInWishlist ? "#f72323" : "none"} />
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      variant='outline'
                      size='lg'
                      className='flex-1 h-12 text-[16px] rounded-full border-grey-darker bg-transparent'
                      disabled={!selectedSize || quantity > selectedSizeQuantity || selectedSizeQuantity === 0}
                    >
                      <Plus className='size-6' />
                      Add to cart
                    </Button>
                    <Button
                      className='flex-1 h-12 text-[16px] rounded-full bg-blue hover:bg-blue-800'
                      disabled={!selectedSize || quantity > selectedSizeQuantity || selectedSizeQuantity === 0}
                    >
                      <ShoppingCart className='size-6' />
                      Buy now
                    </Button>
                  </div>
                  <div className='flex flex-col gap-2 py-4'>
                    <p className='flex items-center gap-2 text-xs text-slate-900'>
                      <PackageCheck size={16} className='text-success-green' /> <span className='font-bold'>Free shipping</span> for orders total over 500DH
                    </p>
                    <p className='flex items-center gap-2 text-xs text-slate-900'>
                      <Timer size={16} className='text-success-green' /> <span className='font-bold'>Fast shipping</span> across Morocco
                    </p>
                    <p className='flex items-center gap-2 text-xs text-slate-900'>
                      <RefreshCcw size={16} className='text-success-green' /> <span className='font-bold'>Product returns</span> after delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* //f/ Bottom section MOBILE */}
      {!isDesktop && (
        <ProductMobileCTAs
          product={product}
          stock={stock}
          selectedSize={selectedSize}
          selectedSizeQuantity={selectedSizeQuantity}
          handleAddToCart={handleAddToCart}
          handleWishlist={handleWishlist}
          finalIsCurrentlyInWishlist={finalIsCurrentlyInWishlist}
        />
      )}
    </>
  );
}
