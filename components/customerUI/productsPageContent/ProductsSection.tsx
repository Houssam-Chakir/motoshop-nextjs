"use client";

import ProductCard from "@/components/customerUI/ProductCard";
import FiltersSidebar from "@/components/customerUI/productFilters/FiltersSidebar";
import { Filter } from "lucide-react";
import FiltersPage from "@/components/customerUI/productFilters/ProductFiltersContent";
import { parseAsArrayOf, parseAsIndex, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import ProductsPagination from "../productsPagination";
import FilterPill from "../productFilters/FilterPill";
import Breadcrumbs from "@/components/Breadcrumbs";
import { usePathname } from "next/navigation";
import useMediaQuery from "@/hooks/useMediaQuery";

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}
interface SectionTypes {
  products: ProductCard[];
  sizes: string[];
  brands: string[];
  pagination: Pagination;
  refetchProducts: () => Promise<void>;
}

export default function ProductsSection({ products, sizes, brands, pagination, refetchProducts }: SectionTypes) {
  console.log('Products', products)
  // const isPhoneOrLarger = useMediaQuery("sm"); // 'md' is type-checked
  const isTabletOrLarger = useMediaQuery("md"); // 'md' is type-checked
  // const isDesktop = useMediaQuery("lg");

  const pathname = usePathname();

  const { currentPage, totalPages, totalProducts, hasNextPage, hasPrevPage, limit } = pagination;
  console.log("Pagination info: ", pagination);

  const [sort, setSort] = useQueryState("sort", { defaultValue: "" });
  const [size, setSize] = useQueryState("size", parseAsArrayOf(parseAsString).withDefault([]));
  const [brand, setBrand] = useQueryState("brand", parseAsArrayOf(parseAsString).withDefault([]));
  const [style, setStyle] = useQueryState("style", parseAsArrayOf(parseAsString).withDefault([]));
  const [maxPrice, setMaxPrice] = useQueryState("maxPrice", parseAsInteger.withDefault(30000));
  const [minPrice, setMinPrice] = useQueryState("minPrice", parseAsInteger.withDefault(0));
  const [page, setPage] = useQueryState("page", parseAsIndex.withDefault(currentPage));
  const [pagesLimit, setPagesLimit] = useQueryState("limit", parseAsInteger.withDefault(limit));

  const handleRemoveFilter = async (filter: string) => {
    switch (filter) {
      case "sort":
        await setSort("");
        break;
      case "price":
        await Promise.all([setMaxPrice(30000), setMinPrice(0)]);
        break;
      case "size":
        await setSize([]);
        break;
      case "brand":
        await setBrand([]);
        break;
      case "style":
        await setStyle([]);
        break;
      case "all":
        await Promise.all([setSize([]), setBrand([]), setSort(""), setStyle([]), setMaxPrice(30000), setMinPrice(0)]);
        break;
    }
    await refetchProducts();
  };

  return (
    <main className='h-fit flex flex-col justify-between relative'>
      <div className='py-4'>
        <Breadcrumbs path={pathname} />
      </div>
      <div className='flex flex-wrap md:flex-nowrap justify-between items-center py-4'>
        <div className='text-[16px] grow'>
          Products <span className='rounded-full px-2 py-1 bg-grey-light text-gray-800'>{totalProducts}</span>
        </div>
        {isTabletOrLarger && (
          <div className='px-2'>
            <FilterPill filters={{ sort, size, brand, style, maxPrice, minPrice }} handleRemoveFilter={handleRemoveFilter} />
          </div>
        )}
        <FiltersSidebar
          className='h-full border-none'
          trigger={
            <button className='flex items-center text-blue-600 font-medium cursor-pointer rounded-full py-2 px-4 hover:bg-blue-50 gap-1'>
              <Filter size={18} />
              Filters
            </button>
          }
        >
          <FiltersPage
            sort={sort}
            sizes={sizes}
            size={size}
            setSize={setSize}
            brands={brands}
            brand={brand}
            setBrand={setBrand}
            maxPrice={maxPrice}
            minPrice={minPrice}
            setMaxPrice={setMaxPrice}
            setMinPrice={setMinPrice}
            setSort={setSort}
            style={style}
            setStyle={setStyle}
            refetchProducts={refetchProducts}
          />
        </FiltersSidebar>
        {!isTabletOrLarger && (
          <div className='overflow-scroll w-full md:px-2'>
            <FilterPill filters={{ sort, size, brand, style, maxPrice, minPrice }} handleRemoveFilter={handleRemoveFilter} />
          </div>
        )}
      </div>
      <div className='grid grow xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-x-2 md:gap-y-16 sm:gap-y-8 gap-y-4'>
        {/* {products.map((product) => {
          return <ProductCardTest product={product} key={product.sku} />;
        })} */}
        {products.map((product) => {
          return <ProductCard product={product} key={product.title} />;
        })}
      </div>
      <ProductsPagination {...pagination} currentPage={page} setPage={setPage} refetchProducts={refetchProducts} />
    </main>
  );
}
