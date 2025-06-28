"use client";

import ProductCard from "@/components/ProductCard";
import FiltersSidebar from "@/components/customerUI/productFilters/FiltersSidebar";
import { Filter } from "lucide-react";
import FiltersPage from "@/components/customerUI/productFilters/ProductFiltersContent";
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryState } from "nuqs";
import { Size } from "@/models/size";
import { BrandDocument } from "@/models/Brand";
import { Type } from "@/types/section";

interface SectionTypes {
  products: ProductCard[];
  sizes: string;
  brands: string;
  types: string;
}

export default function ProductsSection({ products, sizes, types, brands }: SectionTypes) {
  console.log("Sizes: ", sizes);
  console.log("brands: ", brands);
  console.log("types: ", types);
  const [sort, setSort] = useQueryState("sort", { defaultValue: "" });
  const [size, setSize] = useQueryState("size", parseAsArrayOf(parseAsString).withDefault([]));
  const [type, setType] = useQueryState("type", parseAsArrayOf(parseAsString).withDefault([]));
  const [brand, setBrand] = useQueryState("brand", parseAsArrayOf(parseAsString).withDefault([]));
  const [maxPrice, setMaxPrice] = useQueryState("max-price", parseAsInteger.withDefault(30000));
  const [minPrice, setMinPrice] = useQueryState("min-price", parseAsInteger.withDefault(0));
  return (
    <>
      <div className='flex justify-between items-center py-4'>
        <div className='text-[16px]'>
          Products <span className='rounded-full px-2 py-1 bg-grey-light text-gray-800'>{products.length}</span>
        </div>
        <FiltersSidebar
          trigger={
            <button className='flex items-center text-blue-600 font-medium cursor-pointer rounded-full py-2 px-4 hover:bg-blue-50 gap-1'>
              <Filter size={18} />
              Filters
            </button>
          }
        >
          <FiltersPage sizes={sizes} size={size} setSize={setSize} brands={brands} brand={brand}  setBrand={setBrand} types={types} type={type} setType={setType} setSort={setSort} />
        </FiltersSidebar>
      </div>
      <div className='grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-x-2 md:gap-y-16 sm:gap-y-8 gap-y-4'>
        {/* {products.map((product) => {
          return <ProductCardTest product={product} key={product.sku} />;
        })} */}
        {products.map((product) => {
          return <ProductCard product={product} key={product.sku} />;
        })}
      </div>
    </>
  );
}
