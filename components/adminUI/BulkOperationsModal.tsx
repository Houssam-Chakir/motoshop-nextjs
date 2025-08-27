"use client";

import { useState } from "react";
import { Package, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminProduct } from "@/types/admin";

interface BulkOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProducts: AdminProduct[];
  operation: "stock_update" | "delete" | null;
  onConfirm: (operation: "stock_update" | "delete", data?: any) => void;
}

export default function BulkOperationsModal({ isOpen, onClose, selectedProducts, operation, onConfirm }: BulkOperationsModalProps) {
  const [stockUpdates, setStockUpdates] = useState<Record<string, Record<string, number>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStockUpdate = (productId: string, size: string, quantity: number) => {
    setStockUpdates((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [size]: quantity,
      },
    }));
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      if (operation === "stock_update") {
        await onConfirm(operation, stockUpdates);
      } else if (operation === "delete") {
        await onConfirm(operation);
      }
      onClose();
    } catch (error) {
      console.error("Bulk operation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStockUpdateContent = () => (
    <div className='space-y-6'>
      <div className='text-sm text-gray-600'>Update stock quantities for the selected products. Leave fields empty to keep current values.</div>

      <div className='max-h-96 overflow-y-auto space-y-4'>
        {selectedProducts.map((product) => (
          <div key={product._id} className='border rounded-lg p-4 space-y-3'>
            <div className='flex items-start gap-3'>
              <div className='w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center'>
                <Package className='h-6 w-6 text-gray-400' />
              </div>
              <div className='flex-1'>
                <h4 className='font-medium text-gray-900 line-clamp-1'>{product.title}</h4>
                <p className='text-sm text-gray-500'>{product.sku}</p>
              </div>
              <Badge variant='secondary' className='text-xs'>
                Current: {product.totalStock}
              </Badge>
            </div>

            {product.stock?.sizes && product.stock.sizes.length > 0 ? (
              <div className='grid grid-cols-2 gap-3'>
                {product.stock.sizes.map((sizeInfo) => (
                  <div key={sizeInfo.size} className='flex items-center gap-2'>
                    <Label className='text-xs font-medium w-8'>{sizeInfo.size}:</Label>
                    <Input
                      type='number'
                      min='0'
                      placeholder={sizeInfo.quantity.toString()}
                      value={stockUpdates[product._id]?.[sizeInfo.size] || ""}
                      onChange={(e) => handleStockUpdate(product._id, sizeInfo.size, parseInt(e.target.value) || 0)}
                      className='h-8 text-sm'
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-sm text-gray-500 italic'>No size information available</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderDeleteContent = () => (
    <div className='space-y-4'>
      <div className='flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg'>
        <AlertTriangle className='h-5 w-5 text-red-600' />
        <div>
          <p className='text-sm font-medium text-red-900'>This action cannot be undone</p>
          <p className='text-sm text-red-700'>
            You are about to permanently delete {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""}.
          </p>
        </div>
      </div>

      <div className='max-h-64 overflow-y-auto space-y-2'>
        {selectedProducts.map((product) => (
          <div key={product._id} className='flex items-center gap-3 p-3 border rounded-lg'>
            <div className='w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center'>
              <Package className='h-5 w-5 text-gray-400' />
            </div>
            <div className='flex-1'>
              <p className='font-medium text-gray-900 line-clamp-1'>{product.title}</p>
              <p className='text-sm text-gray-500'>{product.sku}</p>
            </div>
            <Badge variant='secondary' className='text-xs'>
              {product.totalStock} in stock
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );

  if (!operation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-2xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {operation === "stock_update" ? (
              <>
                <Package className='h-5 w-5' />
                Update Stock Quantities
              </>
            ) : (
              <>
                <Trash2 className='h-5 w-5 text-red-600' />
                Delete Products
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {operation === "stock_update"
              ? `Update stock for ${selectedProducts.length} selected product${selectedProducts.length > 1 ? "s" : ""}.`
              : `You are about to delete ${selectedProducts.length} product${selectedProducts.length > 1 ? "s" : ""}.`}
          </DialogDescription>
        </DialogHeader>

        <div className='py-4'>{operation === "stock_update" ? renderStockUpdateContent() : renderDeleteContent()}</div>

        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant={operation === "delete" ? "destructive" : "default"} onClick={handleConfirm} disabled={isSubmitting} className='flex items-center gap-2'>
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin' />
                Processing...
              </>
            ) : operation === "stock_update" ? (
              <>
                <Package className='h-4 w-4' />
                Update Stock
              </>
            ) : (
              <>
                <Trash2 className='h-4 w-4' />
                Delete Products
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
