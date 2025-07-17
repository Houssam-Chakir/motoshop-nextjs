import { BadgeDollarSign, PackagePlus, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductInfo {
  brand?: { name?: string };
  identifiers?: { brand?: string; categoryType?: string };
  type?: { name?: string };
  season?: string;
  style?: string;
  title?: string;
  saleInfo?: { discountType: string; discountValue: number; name: string } | null;
  finalPrice?: number;
  savedAmount?: number;
  retailPrice?: number;
  productQuantity?: number;
}

export default function ProductTitlePriceMobile({ productInfo }: { productInfo: ProductInfo }) {
  const { brand, identifiers, type, season, style, title, saleInfo, finalPrice, savedAmount, retailPrice, productQuantity } = productInfo;
  return (
    <div className='space-y-0 pb-4 flex flex-wrap items-center justify-between'>
      <div>
        <h1 className='[font-size:clamp(20px,4vw,24px)] font-black tracking-wide uppercase line-clamp-2 text-2'>{title}</h1>
        <p className='text-grey-darker font-light'>
          <span className='font-medium'>{brand?.name || identifiers?.brand}</span> {type?.name || identifiers?.categoryType} - {season} {style?.toLocaleLowerCase() ?? ""}
        </p>
      </div>
      <div className='py-2'>
        <div className='space-y-0'>
          <div className='flex gap-1 md:gap-2 lg:gap-3 items-center'>
            <span className='pt-1 [font-size:clamp(20px,4vw,24px)] font-black tracking-wider text-blue-900'>{finalPrice?.toLocaleString("en-US")} MAD</span>
            {!saleInfo && (
              <Badge className='text-emerald-50 rounded-none bg-emerald-600 mt-1'>
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
      </div>
    </div>
  );
}
