"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Filter, X, ArrowUpDown } from "lucide-react";

interface FilterState {
  sortBy: string;
  priceRange: [number, number];
  selectedBrands: string[];
  selectedSizes: string[];
  selectedStyle: string[];
}

interface FiltersPage {
  sort: string
  sizes: string[];
  brands: string[];
  size: string[];
  brand: string[];
  type: string[];
  style: string[];
  maxPrice: number;
  minPrice: number;
  setSize: (value: string[] | ((prev: string[]) => string[])) => void;
  setBrand: (value: string[] | ((prev: string[]) => string[])) => void;
  setStyle: (value: string[] | ((prev: string[]) => string[])) => void;
  setMaxPrice: (value: number) => void;
  setMinPrice: (value: number) => void;
  setSort: (value: string) => void;
}

export default function FiltersPage({
  sort,
  size,
  brand,
  style,
  sizes,
  brands,
  maxPrice,
  minPrice,
  setSize,
  setBrand,
  setSort,
  setStyle,
  setMaxPrice,
  setMinPrice,
}: FiltersPage) {
  const ridingStyles = ["Racing", "Adventure", "Versitile", "Touring", "Urban", "Enduro"];
  const [filters, setFilters] = useState<FilterState>({
    sortBy: sort,
    priceRange: [minPrice, maxPrice],
    selectedBrands: brand,
    selectedSizes: size,
    selectedStyle: style,
  });

  const handleSortChange = (value: string) => {
    setFilters({ ...filters, sortBy: value });
    setSort(value)
  };

  const handlePriceRangeChange = (value: [number, number]) => {
    setFilters({ ...filters, priceRange: value });
    setMaxPrice(value[1])
    setMinPrice(value[0])
  };

  const handleBrandChange = (brand: string, checked: boolean) => {
    const updatedBrands = checked ? [...filters.selectedBrands, brand] : filters.selectedBrands.filter((b) => b !== brand);
    setFilters({ ...filters, selectedBrands: updatedBrands });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setBrand((prev: string[]) => (prev = updatedBrands));
  };


  const handleStyleChange = (style: string, checked: boolean) => {
    const updatedStyle = checked ? [...filters.selectedStyle, style] : filters.selectedStyle.filter((s) => s !== style);
    setFilters({ ...filters, selectedStyle: updatedStyle });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setStyle((prev: string[]) => (prev = updatedStyle));
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    const updatedSizes = checked ? [...filters.selectedSizes, size] : filters.selectedSizes.filter((s) => s !== size);
    setFilters({ ...filters, selectedSizes: updatedSizes });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setSize((prev: string[]) => (prev = updatedSizes));
  };

  const clearAllFilters = () => {
    setFilters({
      sortBy: "featured",
      priceRange: [0, 30000],
      selectedBrands: [],
      selectedSizes: [],
      selectedStyle: [],
    });
    setSize([]);
    setBrand([]);
    setSort("");
  };

  const activeFiltersCount =
    filters.selectedBrands.length + filters.selectedSizes.length + (filters.priceRange[0] > 0 || filters.priceRange[1] < 300 ? 1 : 0);

  return (
    <div className={`relative overflow-scroll`}>
      {/* Header */}
      <div className='pb-6'>
        <div className='sticky flex items-center justify-between mb-4 border-b-1 px-2 py-3'>
          <div className='flex items-center gap-2'>
            <Filter className='h-5 w-5' />
            <h2 className='text-lg font-semibold'>Filters</h2>
            {activeFiltersCount > 0 && (
              <Badge variant='secondary' className='bg-grey-light rounded-full'>
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant='ghost' size='sm' className='rounded-full hover:bg-grey-light' onClick={clearAllFilters}>
              <X className='h-4 w-4 mr-1' />
              Clear All
            </Button>
          )}
        </div>
        <div className='flex flex-col p-2'>
          {/* Sort By */}
          <div className='space-y-2'>
            <Label className='text-sm font-medium'>Sort By</Label>
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className='w-full rounded-full shadow-none'>
                <ArrowUpDown className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent className='rounded-lg'>
                <SelectItem value='newest'>Featured</SelectItem>
                <SelectItem value='price-asc'>Price: Low to High</SelectItem>
                <SelectItem value='price-desc'>Price: High to Low</SelectItem>
                {/* <SelectItem value='rating'>Highest Rated</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className='flex-1 overflow-y-auto pt-6 space-y-6'>
          {/* Price Range Filter */}
          <Card className='border-none py-0 shadow-none h-fit text-black'>
            <CardContent className='p-4'>
              <h3 className='font-medium mb-4'>Price Range</h3>
              <div className='space-y-4'>
                <div className='px-2'>
                  <Slider value={filters.priceRange} onValueChange={handlePriceRangeChange} max={30000} min={0} step={5} className='w-full' minStepsBetweenThumbs={1} />
                </div>
                <div className='flex justify-between items-center'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>Min:</span>
                    <Badge variant='outline'>{filters.priceRange[0]} MAD</Badge>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm text-muted-foreground'>Max:</span>
                    <Badge variant='outline'>{filters.priceRange[1]} MAD</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <hr />

          {/* Size Filter */}
          <Card className='border-none py-0 shadow-none text-black'>
            <CardContent className='p-4'>
              <h3 className='font-medium mb-4'>Size</h3>
              <div className='grid grid-cols-3 gap-3'>
                {sizes.map((size) => (
                  <div key={size} className='flex items-center space-x-2'>
                    <Checkbox id={`size-${size}`} checked={filters.selectedSizes.includes(size)} onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)} />
                    <Label htmlFor={`size-${size}`} className='text-sm font-normal cursor-pointer'>
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <hr />

          {/* Type Filter */}
          <Card className='border-none py-0 shadow-none text-black'>
            <CardContent className='p-4'>
              <h3 className='font-medium mb-4'>Riding Style</h3>
              <div className='space-y-3'>
                {ridingStyles.map((style) => (
                  <div key={style} className='flex items-center space-x-2'>
                    <Checkbox id={`style-${style}`} checked={filters.selectedStyle.includes(style)} onCheckedChange={(checked) => handleStyleChange(style, checked as boolean)} />
                    <Label htmlFor={`style-${style}`} className='text-sm font-normal cursor-pointer'>
                      {style}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <hr />

          {/* Brand Filter */}
          <Card className='border-none py-0 shadow-none text-black'>
            <CardContent className='p-4'>
              <h3 className='font-medium mb-4'>Brand</h3>
              <div className='space-y-3 overflow-y-auto'>
                {brands.map((brand) => (
                  <div key={brand} className='flex items-center space-x-2'>
                    <Checkbox id={`brand-${brand}`} checked={filters.selectedBrands.includes(brand)} onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)} />
                    <Label htmlFor={`brand-${brand}`} className='text-sm font-normal cursor-pointer'>
                      {brand}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Filters Footer */}
        {activeFiltersCount > 0 && (
          <div className=' border-t pt-4 mt-6'>
            <div className='space-y-2'>
              <h4 className='text-sm font-medium'>Active Filters:</h4>
              <div className='flex flex-wrap gap-1'>
                {filters.selectedBrands.map((brand) => (
                  <Badge key={brand} variant='secondary' className='text-xs gap-1 bg-grey-light'>
                    {brand}
                    <X className='h-3 w-3 cursor-pointer' onClick={() => handleBrandChange(brand, false)} />
                  </Badge>
                ))}
                {filters.selectedSizes.map((size) => (
                  <Badge key={size} variant='secondary' className='text-xs gap-1 bg-grey-light'>
                    Size {size}
                    <X className='h-3 w-3 cursor-pointer' onClick={() => handleSizeChange(size, false)} />
                  </Badge>
                ))}
                {(filters.priceRange[0] > 0 || filters.priceRange[1] < 300) && (
                  <Badge variant='secondary' className='text-xs gap-1 bg-grey-light'>
                    ${filters.priceRange[0]} - ${filters.priceRange[1]}
                    <X className='h-3 w-3 cursor-pointer' onClick={() => handlePriceRangeChange([0, 300])} />
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
