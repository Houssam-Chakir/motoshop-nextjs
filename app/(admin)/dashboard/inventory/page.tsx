import { Suspense } from "react";
import InventoryPageClient from "@/components/adminUI/InventoryPageClient";
import { AdminProductFilters } from "@/types/admin";
import { getAdminProducts, getAdminFilterOptions } from "@/actions/adminActions";

interface InventoryPageProps {
  searchParams: Promise<Record<string, string | string[]>>;
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
  const sp = await searchParams;
  // Parse filters from search params
  const filters: AdminProductFilters = {
    search: typeof sp.search === "string" && sp.search ? sp.search : undefined,
    brand: typeof sp.brand === "string" && sp.brand ? sp.brand : undefined,
    category: typeof sp.category === "string" && sp.category ? sp.category : undefined,
    type: typeof sp.type === "string" && sp.type ? sp.type : undefined,
    stockStatus: (typeof sp.stockStatus === "string" ? sp.stockStatus : "all") as AdminProductFilters["stockStatus"],
    sort: (typeof sp.sort === "string" ? sp.sort : "title") as AdminProductFilters["sort"],
    sortOrder: (typeof sp.sortOrder === "string" ? sp.sortOrder : "asc") as AdminProductFilters["sortOrder"],
    page: typeof sp.page === "string" ? parseInt(sp.page) : 0,
    limit: typeof sp.limit === "string" ? parseInt(sp.limit) : 25,
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
