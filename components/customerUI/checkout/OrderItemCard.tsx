import { GuestCartProductItem } from "@/lib/guestCartStore";
import { Minus, Plus, Trash } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const OrderItemCard = ({
  item,
  onRemove,
  onQuantityChange,
}: {
  item: GuestCartProductItem; // Changed to GuestCartProductItem
  onRemove: (productId: string, size: string) => void; // Adjusted params
  onQuantityChange: (productId: string, size: string, newQuantity: number) => void; // Adjusted params
}) => {
  const router = useRouter();

  const handleRemove = () => {
    onRemove(item.productId, item.size); // Use productId and size
  };

  const handleQuantityChange = (newQuantity: number) => {
    onQuantityChange(item.productId, item.size, newQuantity); // Use productId, size, and newQuantity
  };

  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Takes you to product page
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/product/${item.slug}`);
  };

  return (
    <div onClick={handleItemClick} className='relative flex text-start transition-all hover:border-gray-400 cursor-pointer'>
      <div className='shrink-0 aspect-square w-[100px] flex items-center justify-center bg-grey-light p-1 overflow-clip'>
        <Image className='object-contain w-full h-full' src={item.imageUrl ?? "/noProductImage.png"} alt={item.title ?? "Cart Item"} width={90} height={90} />
        {item.originalPrice !== item.unitPrice && (
          <div className={`bg-primary transition-all text-white absolute uppercase font-bold text-[12px] px-1.5 py-0.5 bottom-0 left-0`}>
            {/* calculate percentage of discount from original price to unitprice and remove numbers after comma*/}-
            {Math.floor(((item.originalPrice - item.unitPrice) / item.originalPrice) * 100)}%
          </div>
        )}
      </div>
      <div className='w-full flex flex-col justify-around px-2'>
        <div>
          <h4 className='text-sm font-medium line-clamp-1'>{item.title}</h4>
          <div className='flex text-xs text-gray-500 gap-1'>
            <span className='text-success-green font-medium'>{item.unitPrice?.toFixed(2)} MAD</span>
            <span>
              {item.originalPrice !== item.unitPrice && (
                <div className=' text-xs line-through text-gray-400 italic'>
                  {item.originalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MAD
                </div>
              )}
            </span>
          </div>
          <p className='text-xs text-gray-500'>Size: {item.size}</p>
        </div>
        <div className='flex flex-row-reverse pt-1 w-full items-center-safe justify-between'>
          <div className='flex items-center gap-2 mt-2 border rounded-full'>
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              className={`px-3 py-0  h-full hover:bg-grey-light rounded-l-full text-sm ${item.quantity === 1 ? "text-grey-dark" : ""}`}
              disabled={item.quantity === 1}
            >
              <Minus size={16} height={24} />
            </button>
            <span className='px-1'>{item.quantity}</span>
            <button onClick={() => handleQuantityChange(item.quantity + 1)} className='text-[14px] px-3 py-0  h-full hover:bg-grey-light rounded-r-full text-sm'>
              <Plus size={16} height={24} />
            </button>
          </div>
          <div className='-space-y-1 flex flex-col items-end'>
            <div className='flex gap-1 items-center'>
              <div className='font-bold text-blue text-[clamp(15px,1.5vw,16px)]'>
                {item.totalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
              <div className='text-[clamp(10px,1.5vw,14px)] text-blue'>
                <span className='font-bold text-[clamp(15px,1.5vw,16px)]'> MAD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button onClick={handleRemove} className='absolute top-0 right-0 flex px-1.5 items-center justify-center h-6 w-6 group hover:bg-red-50 rounded-full'>
        <Trash size={12} className='text-grey-darker group-hover:text-primary' />
      </button>
    </div>
  );
};

export default OrderItemCard
