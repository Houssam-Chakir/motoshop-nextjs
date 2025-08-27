"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Plus, Package } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import InventoryFilters from "./InventoryFilters";
import InventoryTable from "./InventoryTable";
import InventoryPagination from "./InventoryPagination";
import BulkOperationsModal from "./BulkOperationsModal";
import { AdminProduct, AdminProductFilters, AdminProductsResponse, FilterOptions } from "@/types/admin";
import { bulkUpdateStock, bulkDeleteProducts, deleteProduct } from "@/actions/adminActions";

interface InventoryPageClientProps {
  initialData: AdminProductsResponse;
  filterOptions: FilterOptions;
  initialFilters: AdminProductFilters;
}

export default function InventoryPageClient({ initialData, filterOptions, initialFilters }: InventoryPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [products, setProducts] = useState<AdminProduct[]>(initialData.products);
  const [pagination, setPagination] = useState(initialData.pagination);
  const [filters, setFilters] = useState<AdminProductFilters>(initialFilters);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<"stock_update" | "delete" | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Sync local state with new props when data changes
  useEffect(() => {
    setProducts(initialData.products);
    setPagination(initialData.pagination);
    setFilters(initialFilters);
    // Clear selections when data changes
    setSelectedProductIds([]);
  }, [initialData, initialFilters]);

  // Get selected products for bulk operations
  const selectedProducts = products.filter((p) => selectedProductIds.includes(p._id));

  // Handle filter changes
  const handleFiltersChange = useCallback(
    (newFilters: AdminProductFilters) => {
      setFilters(newFilters);

      // Build URL with search params
      const searchParams = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== "" && value !== "all") {
          searchParams.set(key, value.toString());
        }
      });

      const newUrl = `/dashboard/inventory?${searchParams.toString()}`;

      // Navigate with new filters
      startTransition(() => {
        router.push(newUrl);
      });
    },
    [router]
  );

  // Handle page changes
  const handlePageChange = useCallback(
    (page: number) => {
      handleFiltersChange({ ...filters, page });
    },
    [filters, handleFiltersChange]
  );

  // Handle limit changes
  const handleLimitChange = useCallback(
    (limit: number) => {
      handleFiltersChange({ ...filters, limit, page: 0 });
    },
    [filters, handleFiltersChange]
  );

  // Handle product edit
  const handleEdit = useCallback(
    (productId: string) => {
      router.push(`/dashboard/inventory/product/edit/${productId}`);
    },
    [router]
  );

  // Handle single product delete
  const handleDelete = useCallback(
    async (productId: string) => {
      if (!confirm("Are you sure you want to delete this product?")) return;

      try {
        await deleteProduct(productId);
        toast.success("Product deleted successfully");

        // Refresh data
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        toast.error("Failed to delete product");
        console.error("Delete error:", error);
      }
    },
    [router]
  );

  // Handle bulk delete
  const handleBulkDelete = useCallback((productIds: string[]) => {
    setSelectedProductIds(productIds);
    setBulkOperation("delete");
    setBulkModalOpen(true);
  }, []);

  // Handle bulk stock update
  const handleBulkStockUpdate = useCallback((productIds: string[]) => {
    setSelectedProductIds(productIds);
    setBulkOperation("stock_update");
    setBulkModalOpen(true);
  }, []);

  // Handle bulk operation confirmation
  const handleBulkOperationConfirm = useCallback(
    async (operation: "stock_update" | "delete", data?: any) => {
      try {
        if (operation === "stock_update") {
          await bulkUpdateStock(data);
          toast.success(`Stock updated for ${selectedProductIds.length} products`);
        } else if (operation === "delete") {
          await bulkDeleteProducts(selectedProductIds);
          toast.success(`Deleted ${selectedProductIds.length} products`);
        }

        // Reset selection and close modal
        setSelectedProductIds([]);
        setBulkModalOpen(false);
        setBulkOperation(null);

        // Refresh data
        startTransition(() => {
          router.refresh();
        });
      } catch (error) {
        toast.error(`Failed to ${operation === "delete" ? "delete" : "update"} products`);
        console.error("Bulk operation error:", error);
      }
    },
    [selectedProductIds, router]
  );

  // Calculate statistics
  const stats = {
    total: pagination.totalProducts,
    inStock: products.filter((p) => p.stockStatus === "in_stock").length,
    lowStock: products.filter((p) => p.stockStatus === "low_stock").length,
    outOfStock: products.filter((p) => p.stockStatus === "out_of_stock").length,
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Inventory Management</h1>
          <p className='text-gray-600'>Manage your products, stock levels, and pricing</p>
        </div>
        <div className='flex items-center gap-3'>
          <Link href='/dashboard/inventory/categories/add'>
            <Button variant='outline' className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Add Category
            </Button>
          </Link>
          <Link href='/dashboard/inventory/product/add'>
            <Button className='flex items-center gap-2'>
              <Plus className='h-4 w-4' />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 border rounded-lg'>
          <div className='flex items-center gap-2'>
            <Package className='h-5 w-5 text-blue-600' />
            <span className='text-sm font-medium text-gray-600'>Total Products</span>
          </div>
          <p className='text-2xl font-bold text-gray-900 mt-1'>{stats.total}</p>
        </div>
        <div className='bg-white p-4 border rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-green-500 rounded-full' />
            <span className='text-sm font-medium text-gray-600'>In Stock</span>
          </div>
          <p className='text-2xl font-bold text-green-600 mt-1'>{stats.inStock}</p>
        </div>
        <div className='bg-white p-4 border rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-yellow-500 rounded-full' />
            <span className='text-sm font-medium text-gray-600'>Low Stock</span>
          </div>
          <p className='text-2xl font-bold text-yellow-600 mt-1'>{stats.lowStock}</p>
        </div>
        <div className='bg-white p-4 border rounded-lg'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-red-500 rounded-full' />
            <span className='text-sm font-medium text-gray-600'>Out of Stock</span>
          </div>
          <p className='text-2xl font-bold text-red-600 mt-1'>{stats.outOfStock}</p>
        </div>
      </div>

      {/* Filters */}
      <InventoryFilters filters={filters} onFiltersChange={handleFiltersChange} filterOptions={filterOptions} />

      {/* Loading Overlay */}
      {isPending && (
        <div className='fixed inset-0 bg-black/20 z-50 flex items-center justify-center'>
          <div className='bg-white p-4 rounded-lg shadow-lg flex items-center gap-3'>
            <div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='bg-white border rounded-lg'>
        <InventoryTable products={products} onEdit={handleEdit} onDelete={handleDelete} onBulkDelete={handleBulkDelete} onBulkStockUpdate={handleBulkStockUpdate} />

        {/* Pagination */}
        <InventoryPagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalProducts={pagination.totalProducts}
          limit={pagination.limit}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
        />
      </div>

      {/* Bulk Operations Modal */}
      <BulkOperationsModal
        isOpen={bulkModalOpen}
        onClose={() => {
          setBulkModalOpen(false);
          setBulkOperation(null);
          setSelectedProductIds([]);
        }}
        selectedProducts={selectedProducts}
        operation={bulkOperation}
        onConfirm={handleBulkOperationConfirm}
      />
    </div>
  );
}
