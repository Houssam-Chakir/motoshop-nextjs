"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Eye, AlertTriangle, CheckCircle, XCircle, MoreHorizontal, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AdminProduct } from "@/types/admin";

interface InventoryTableProps {
  products: AdminProduct[];
  onEdit: (productId: string) => void;
  onDelete: (productId: string) => void;
  onBulkDelete: (productIds: string[]) => void;
  onBulkStockUpdate: (productIds: string[]) => void;
}

interface StockStatusConfig {
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  label: string;
}

const stockStatusConfig: Record<string, StockStatusConfig> = {
  in_stock: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100",
    label: "In Stock",
  },
  low_stock: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    label: "Low Stock",
  },
  out_of_stock: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100",
    label: "Out of Stock",
  },
};

export default function InventoryTable({ products, onEdit, onDelete, onBulkDelete, onBulkStockUpdate }: InventoryTableProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(new Set(products.map((p) => p._id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleSelectProduct = (productId: string, checked: boolean) => {
    const newSelected = new Set(selectedProducts);
    if (checked) {
      newSelected.add(productId);
    } else {
      newSelected.delete(productId);
    }
    setSelectedProducts(newSelected);
  };

  const selectedCount = selectedProducts.size;
  const allSelected = selectedCount === products.length && products.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < products.length;

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} MAD`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStockDisplay = (product: AdminProduct) => {
    const config = stockStatusConfig[product.stockStatus];
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-2 py-1 rounded-full ${config.bgColor}`}>
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{product.totalStock}</span>
      </div>
    );
  };

  return (
    <div className='space-y-4'>
      {/* Bulk Actions */}
      {selectedCount > 0 && (
        <div className='flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg'>
          <div className='flex items-center gap-4'>
            <span className='text-sm font-medium text-blue-900'>
              {selectedCount} product{selectedCount > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' onClick={() => onBulkStockUpdate(Array.from(selectedProducts))} className='flex items-center gap-2'>
              <Package className='h-4 w-4' />
              Update Stock
            </Button>
            <Button variant='destructive' size='sm' onClick={() => onBulkDelete(Array.from(selectedProducts))} className='flex items-center gap-2'>
              <Trash2 className='h-4 w-4' />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className='w-12'>
                <Checkbox
                  checked={allSelected}
                  ref={(el) => {
                    if (el) (el as any).indeterminate = someSelected;
                  }}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className='w-16'>Image</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className='w-16'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className='text-center py-8 text-gray-500'>
                  No products found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const isSelected = selectedProducts.has(product._id);
                const config = stockStatusConfig[product.stockStatus];

                return (
                  <TableRow key={product._id} className={isSelected ? "bg-blue-50" : ""}>
                    <TableCell>
                      <Checkbox checked={isSelected} onCheckedChange={(checked) => handleSelectProduct(product._id, checked as boolean)} />
                    </TableCell>

                    <TableCell>
                      <div className='w-12 h-12 relative bg-gray-100 rounded-md overflow-hidden'>
                        {product.images[0]?.secure_url ? (
                          <Image src={product.images[0].secure_url} alt={product.title} fill className='object-cover' />
                        ) : (
                          <div className='w-full h-full flex items-center justify-center'>
                            <Package className='h-6 w-6 text-gray-400' />
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className='space-y-1'>
                        <p className='font-medium text-gray-900 line-clamp-2'>{product.title}</p>
                        <p className='text-xs text-gray-500'>{product.barcode}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <code className='text-xs bg-gray-100 px-2 py-1 rounded'>{product.sku}</code>
                    </TableCell>

                    <TableCell>
                      <span className='text-sm text-gray-900'>{product.brand?.name || "Unknown"}</span>
                    </TableCell>

                    <TableCell>
                      <div className='space-y-1'>
                        <p className='text-sm font-medium text-gray-900'>{product.category?.name || "Unknown"}</p>
                        <p className='text-xs text-gray-500'>{product.type?.name || "Unknown"}</p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className='flex items-center gap-2'>
                        {product.salePrice ? (
                          <>
                            <span className='text-sm font-bold text-blue-600'>{formatCurrency(product.salePrice)}</span>
                            <span className='text-xs text-gray-500 line-through'>{formatCurrency(product.retailPrice)}</span>
                          </>
                        ) : (
                          <span className='text-sm font-medium text-gray-900'>{formatCurrency(product.retailPrice)}</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>{getStockDisplay(product)}</TableCell>

                    <TableCell>
                      <Badge
                        variant={product.stockStatus === "in_stock" ? "default" : "destructive"}
                        className={`text-xs ${
                          product.stockStatus === "in_stock"
                            ? "bg-green-100 text-green-800"
                            : product.stockStatus === "low_stock"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {config.label}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <span className='text-sm text-gray-600'>{formatDate(product.createdAt)}</span>
                    </TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='sm'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem asChild>
                            <Link href={`/product/${product.slug}`} className='flex items-center gap-2'>
                              <Eye className='h-4 w-4' />
                              View Product
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(product._id)} className='flex items-center gap-2'>
                            <Edit className='h-4 w-4' />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(product._id)} className='flex items-center gap-2 text-red-600'>
                            <Trash2 className='h-4 w-4' />
                            Delete Product
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
