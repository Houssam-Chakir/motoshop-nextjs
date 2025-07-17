/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Loader2, Search, X } from "lucide-react";
import Container from "@/components/layout/Container";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isDesktop: boolean;
}
interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}
export interface SearchItem {
  id: string; // Unique identifier for the item (e.g., product ID)
  title?: string; // Title of the item, typically from database
  images: { secure_url: string }[];
  retailPrice?: number;
  identifiers?: { brand: string; categoryType: string; category: string };
  slug?: string;
  quantity: number;
  salePrice?: number;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchQuery, setSearchQuery, isDesktop = false }) => {
  return (
    <>
      {/* Mobile */}
      {!isDesktop && (
        <div className='flex flex-col items-center group cursor-pointer'>
          <Search className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-primary'>Search</span>
        </div>
      )}
      {/* Desktop */}
      {isDesktop && (
        <div className='max-w-[518px] w-full mx-4'>
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        </div>
      )}
    </>
  );
};

//f/ Search Bar Component ------------------------------------------------------------------------
export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  const [parent] = useAutoAnimate({ duration: 100 });
  const [searchResult, setSearchResult] = useState<SearchItem[] | null>(null);

  const handleResetSearchQuery = (e: React.MouseEvent) => {
    e.stopPropagation()
    if ((e.target as HTMLElement).closest("#SearchResults")) {
      return;
    }
    setSearchQuery("")
  }

  // Debounced search effect
  React.useEffect(() => {
    if (searchQuery === undefined) return;

    // Clear previous results immediately to show loading state
    setSearchResult(null);

    if (!searchQuery) {
      // If query is empty, clear results and return
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResult(data.productsDoc);
          console.log("Search results for", searchQuery, data);
        } else {
          console.log("Search request failed", res.status);
          setSearchResult([]); // Set to empty array on failure
        }
      } catch (err) {
        console.error("Search error", err);
        setSearchResult([]); // Set to empty array on error
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  //
  return (
    <div ref={parent} className=''>
      <Input
        type='text'
        placeholder='Search for products...'
        className='w-full pl-11 pr-4 h-[42px] text-black text-xs placeholder:text-black focus:placeholder:text-grey-darker placeholder:text-xs rounded-full bg-grey border-xs hover:border-grey-blue duration-100 transition-all shadow-none border-grey-light font-display'
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
        <svg className='h-5 w-5 text-primary-dark' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
          <path fillRule='evenodd' d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z' clipRule='evenodd' />
        </svg>
      </div>
      {searchQuery && (
        <button onClick={() => setSearchQuery("")} className='absolute cursor-pointer inset-y-0 right-0 pr-4 flex items-center pointer-events-auto'>
          <X />
        </button>
      )}
      {searchQuery && (
        <div onClick={(e) => handleResetSearchQuery(e)} className={`fixed mt-4 left-0 w-full h-full bg-black/50 shadow z-50`}>
          <div id="SearchResults" className='w-full h-[60%] bg-white'>
            <Container className='pt-4 flex flex-col items-center h-full overflow-y-auto inset-shadow-cyan-800'>
              {searchResult && searchResult.length === 0 && (
                <div className='p-8 pt-12 text-center text-gray-500'>
                  <img className='opacity-80 w-40 mx-auto pb-4' src='/empty.svg' alt='empty wishlist' />
                  <p className='font-semibold'>No Product Found</p>
                </div>
              )}
              {searchResult && searchResult.length > 0 && (
                <p className='max-w-[518px] pb-2 w-full text-grey-darker text-sm'>
                  {searchResult?.length || 0} Search result{searchResult?.length > 1 ? "s" : ""}:
                </p>
              )}
              <div className='max-w-[518px] w-full grid grid-cols-1 gap-4 justify-between'>
                {!searchResult && (
                  <div className='w-full flex justify-center py-6'>
                    <Loader2 className='h-20 w-20 animate-spin text-grey-medium' />
                  </div>
                )}
                {searchResult && searchResult.map((item) => <SearchItem key={item.id} item={item} />)}
              </div>
            </Container>
          </div>
        </div>
      )}
    </div>
  );
}

// Search Item section

function SearchItem({ item }: { item: SearchItem }) {
  const router = useRouter();

  const finalPrice = item.salePrice ? item.salePrice : item.retailPrice;

  // Click handlers
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Takes you to product page
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/products/${item.slug}`);
  };

  return (
    <div onClick={handleItemClick} key={item.id} className='relative h-fit flex text-start gap-2 transition-all  hover:border-gray-400 cursor-pointer'>
      {/* Image */}
      <div className='shrink-0 aspect-square w-[100px] flex items-center justify-center bg-grey-light p-2 overflow-clip'>
        <Image className='object-contain w-full h-full' src={item.images?.[0]?.secure_url ?? "/noProductImage.png"} alt={item.title ?? "Wishlist Item"} width={90} height={90} />
        {item.salePrice && item.retailPrice && (
          <div className={`bg-primary transition-all text-white absolute uppercase font-bold text-[12px] px-1.5 py-0.5 bottom-0 left-0`}>
            {/* calculate percentage of discount from original price to unitprice and remove numbers after comma*/}-
            {Math.floor(((item.retailPrice - item.salePrice) / item.retailPrice) * 100)}%
          </div>
        )}
      </div>
      {/* Product Info */}
      <div className='shrink-1 flex flex-col justify-aroun'>
        <div className='pb-1.5'>
          <h3 className='font-medium text-[clamp(13px,1.5vw,14px)] line-clamp-1 w-full'>{item.title}</h3>
          <p className='text-[12px] text-grey-darker'>
            {item.identifiers?.brand} {item.identifiers?.category}
          </p>
        </div>
        <div className='gap-2 items-center pl-0.5'>
          {item.quantity > 0 && <span className='text-emerald-500 text-xs'>In Stock</span>}
          {item.quantity === 0 || (!item.quantity && <span className='text-red-500 text-xs'>Out of Stock</span>)}
          <div className='flex gap-2 items-center'>
            <p className='font-bold text-[clamp(13px,1.5vw,14px)] text-blue'>{finalPrice?.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD</p>
            {item.salePrice && (
              <div className='flex gap-1 text-success-green items-center line-through italic'>
                <div className=' text-[clamp(13px,1.5vw,14px)] font-light'>
                  {item.retailPrice?.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MAD
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchInput;
