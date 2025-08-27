import { Suspense } from "react";
import InventoryPageClient from "@/components/adminUI/InventoryPageClient";
import { AdminProductFilters } from "@/types/admin";
import { getAdminProducts, getAdminFilterOptions } from "@/actions/adminActions";

interface InventoryPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

// Loading component
function InventoryLoading() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='h-8 w-64 bg-gray-200 rounded animate-pulse' />
          <div className='h-4 w-96 bg-gray-100 rounded animate-pulse mt-2' />
        </div>
        <div className='flex gap-3'>
          <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
          <div className='h-10 w-32 bg-gray-200 rounded animate-pulse' />
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className='bg-white p-4 border rounded-lg'>
            <div className='h-4 w-24 bg-gray-200 rounded animate-pulse' />
            <div className='h-8 w-16 bg-gray-200 rounded animate-pulse mt-2' />
          </div>
        ))}
      </div>

      <div className='bg-white border rounded-lg p-4'>
        <div className='h-64 w-full bg-gray-100 rounded animate-pulse' />
      </div>
    </div>
  );
}

const InventoryPage = async ({ searchParams }: InventoryPageProps) => {
  // Parse filters from search params
  const filters: AdminProductFilters = {
    search: typeof searchParams.search === "string" && searchParams.search ? searchParams.search : undefined,
    brand: typeof searchParams.brand === "string" && searchParams.brand ? searchParams.brand : undefined,
    category: typeof searchParams.category === "string" && searchParams.category ? searchParams.category : undefined,
    type: typeof searchParams.type === "string" && searchParams.type ? searchParams.type : undefined,
    stockStatus: (typeof searchParams.stockStatus === "string" ? searchParams.stockStatus : "all") as AdminProductFilters["stockStatus"],
    sort: (typeof searchParams.sort === "string" ? searchParams.sort : "title") as AdminProductFilters["sort"],
    sortOrder: (typeof searchParams.sortOrder === "string" ? searchParams.sortOrder : "asc") as AdminProductFilters["sortOrder"],
    page: typeof searchParams.page === "string" ? parseInt(searchParams.page) : 0,
    limit: typeof searchParams.limit === "string" ? parseInt(searchParams.limit) : 25,
  };

  // Fetch data
  const [productsData, filterOptions] = await Promise.all([getAdminProducts(filters), getAdminFilterOptions()]);

  return (
    <Suspense fallback={<InventoryLoading />}>
      <InventoryPageClient initialData={productsData} filterOptions={filterOptions} initialFilters={filters} />
    </Suspense>
  );
};

export default InventoryPage;
