import { Button } from "@/components/ui/button";
import { Heart, Plus } from "lucide-react";
import ProductInfoSlider from "../ProductInfoSlider";
import { useUserContext } from "@/contexts/UserContext";

interface ProductCTAsProps {
  stock: {
    sizes?: { size: string; quantity: number }[];
    // Add other stock properties if needed
  } | null;
  selectedSize: string | null;
  selectedSizeQuantity: number;
  isLoggedIn: boolean;
  finalIsCurrentlyInWishlist: boolean;
  handleAddToCart: () => void;
  handleWishlist: () => void;
}

export default function ProductMobileCTAs({
  isLoggedIn,
  product,
  stock,
  selectedSize,
  selectedSizeQuantity,
  handleAddToCart,
  handleWishlist,
  finalIsCurrentlyInWishlist,
}: ProductCTAsProps) {
  return (
    <div className='fixed bottom-0 left-0 w-full bg-white/70 backdrop-blur-md z-50 px-4 pt-2 pb-4 border-t-1'>
      <div className='flex flex-col gap-1'>
        {/* Required options message or stock status */}
        <p className='text-[13px] italic text-grey-darker'>Select required options</p>
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
          <ProductInfoSlider product={product} displayAll={false} isLoggedIn={isLoggedIn} handleWishlist={handleWishlist} finalIsCurrentlyInWishlist={finalIsCurrentlyInWishlist}>
            <Button variant='outline' size='lg' className='flex-1 w-full h-12 text-[16px] text-blue rounded-full border-blue bg-white'>
              <Plus className='size-6' />
              Select an option
            </Button>
          </ProductInfoSlider>
        </div>
      </div>
    </div>
  );
}
