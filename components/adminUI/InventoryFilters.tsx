"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminProductFilters, FilterOptions } from "@/types/admin";

interface InventoryFiltersProps {
  filters: AdminProductFilters;
  onFiltersChange: (filters: AdminProductFilters) => void;
  filterOptions: FilterOptions;
}

export default function InventoryFilters({ filters, onFiltersChange, filterOptions }: InventoryFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync search input when filters prop changes
  useEffect(() => {
    setSearchInput(filters.search || "");
  }, [filters.search]);

  // Debounced filter change handler
  const debouncedFilterChange = useCallback(
    (newFilters: AdminProductFilters) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onFiltersChange(newFilters);
      }, 300);
    },
    [onFiltersChange]
  );

  // Immediate filter change handler (for dropdowns, not search)
  const updateFilter = useCallback(
    (key: keyof AdminProductFilters, value: any) => {
      const newFilters = { ...filters, [key]: value, page: 0 };
      onFiltersChange(newFilters);
    },
    [filters, onFiltersChange]
  );

  // Search handler with debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      const newFilters = { ...filters, search: value, page: 0 };
      debouncedFilterChange(newFilters);
    },
    [filters, debouncedFilterChange]
  );

  const clearFilters = () => {
    const clearedFilters: AdminProductFilters = {
      search: "",
      brand: undefined,
      category: undefined,
      type: undefined,
      stockStatus: "all",
      sort: "title",
      sortOrder: "asc",
      page: 0,
      limit: 25,
    };
    onFiltersChange(clearedFilters);
    setSearchInput("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.brand) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.stockStatus && filters.stockStatus !== "all") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className='space-y-4 p-4 bg-white border rounded-lg'>
      {/* Search and Clear */}
      <div className='flex items-center gap-4'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input placeholder='Search by title, SKU, or barcode...' value={searchInput} onChange={(e) => handleSearchChange(e.target.value)} className='pl-10' />
        </div>
        <Button variant='outline' onClick={clearFilters} className='flex items-center gap-2'>
          <X className='h-4 w-4' />
          Clear All
          {activeFiltersCount > 0 && (
            <Badge variant='secondary' className='ml-1'>
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filter Row */}
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
        {/* Brand Filter */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-1 block'>Brand</label>
          <Select value={filters.brand || "all"} onValueChange={(value) => updateFilter("brand", value === "all" ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder='All brands' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All brands</SelectItem>
              {filterOptions.brands.map((brand) => (
                <SelectItem key={brand._id} value={brand._id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Category Filter */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-1 block'>Category</label>
          <Select value={filters.category || "all"} onValueChange={(value) => updateFilter("category", value === "all" ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder='All categories' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All categories</SelectItem>
              {filterOptions.categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name} ({category.section})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-1 block'>Type</label>
          <Select value={filters.type || "all"} onValueChange={(value) => updateFilter("type", value === "all" ? undefined : value)}>
            <SelectTrigger>
              <SelectValue placeholder='All types' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All types</SelectItem>
              {filterOptions.types.map((type) => (
                <SelectItem key={type._id} value={type._id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Stock Status Filter */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-1 block'>Stock Status</label>
          <Select value={filters.stockStatus || "all"} onValueChange={(value) => updateFilter("stockStatus", value as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All status</SelectItem>
              <SelectItem value='in_stock'>In Stock ({">"}10)</SelectItem>
              <SelectItem value='low_stock'>Low Stock (1-10)</SelectItem>
              <SelectItem value='out_of_stock'>Out of Stock (0)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Options */}
        <div>
          <label className='text-sm font-medium text-gray-700 mb-1 block'>Sort By</label>
          <div className='flex gap-2'>
            <Select value={filters.sort || "title"} onValueChange={(value) => updateFilter("sort", value)}>
              <SelectTrigger className='flex-1'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='title'>Title</SelectItem>
                <SelectItem value='sku'>SKU</SelectItem>
                <SelectItem value='price'>Price</SelectItem>
                <SelectItem value='stock'>Stock</SelectItem>
                <SelectItem value='created'>Created</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.sortOrder || "asc"} onValueChange={(value) => updateFilter("sortOrder", value as "asc" | "desc")}>
              <SelectTrigger className='w-20'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='asc'>↑</SelectItem>
                <SelectItem value='desc'>↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className='flex flex-wrap gap-2'>
          {filters.search && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Search: &ldquo;{filters.search}&rdquo;
              <X
                className='h-3 w-3 cursor-pointer'
                onClick={() => {
                  setSearchInput("");
                  updateFilter("search", "");
                }}
              />
            </Badge>
          )}
          {filters.brand && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Brand: {filterOptions.brands.find((b) => b._id === filters.brand)?.name}
              <X className='h-3 w-3 cursor-pointer' onClick={() => updateFilter("brand", undefined)} />
            </Badge>
          )}
          {filters.category && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Category: {filterOptions.categories.find((c) => c._id === filters.category)?.name}
              <X className='h-3 w-3 cursor-pointer' onClick={() => updateFilter("category", undefined)} />
            </Badge>
          )}
          {filters.type && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Type: {filterOptions.types.find((t) => t._id === filters.type)?.name}
              <X className='h-3 w-3 cursor-pointer' onClick={() => updateFilter("type", undefined)} />
            </Badge>
          )}
          {filters.stockStatus && filters.stockStatus !== "all" && (
            <Badge variant='secondary' className='flex items-center gap-1'>
              Stock: {filters.stockStatus.replace("_", " ")}
              <X className='h-3 w-3 cursor-pointer' onClick={() => updateFilter("stockStatus", "all")} />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
