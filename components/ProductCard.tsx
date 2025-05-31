"use client";

import { ReviewType } from "@/models/Review";
import { CldImage } from "next-cloudinary";

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
  return (
    <div className='bg-white w-full sm:max-w-[300px] md:max-w-[236px]'>
      {/* Product Image */}
      <div className='relative aspect-square w-full flex items-center justify-center bg-grey-light p-2'>
        <CldImage className='object-contain w-full h-full' width={236} height={236} src={product.images[0].public_id} alt='Description of my image' />
        {/* On sale tag */}
        <div className="bg-primary text-white absolute uppercase font-bold text-[9px] px-1 py-0.5 bottom-0 left-0">on sale!</div>
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
        <div className='font-bold text-[clamp(14px,1.5vw,16px)] text-blue'>
          {product.retailPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
        </div>
        <div className='font-medium text-[clamp(10px,1vw,10px)] text-primary-dark italic line-through'>
          {product.retailPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
