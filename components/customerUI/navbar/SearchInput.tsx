import { Input } from "@/components/ui/input";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  isDesktop: boolean;
}
interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ searchQuery, setSearchQuery, isDesktop = false }) => {

  if (!isDesktop) {
    return (
      <>
        <div className='flex flex-col items-center group cursor-pointer'>
          <Search className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-primary'>Search</span>
        </div>
      </>
    );
  }

  if (isDesktop) {
    return (
      <div className='relative max-w-[518px] w-full mx-4'>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      </div>
    );
  }
};

//f/ Search Bar Component
export function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  const [parent] = useAutoAnimate({ duration: 100 });
  return (
    <div ref={parent} className='relative'>
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
    </div>
  );
}

export default SearchInput;
