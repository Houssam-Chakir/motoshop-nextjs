"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, ShoppingCart, AlertCircle } from "lucide-react";

interface ProductInfo {
  _id: string;
  title: string;
  images?: { secure_url: string; public_id: string }[];
  slug: string;
}

interface SizeInfo {
  size: string;
  quantity: number;
}

interface InventoryAlert {
  stockId: string;
  product: ProductInfo;
  sizes: SizeInfo[];
}

interface InventoryAlertsProps {
  lowStock: InventoryAlert[];
  outOfStock: InventoryAlert[];
}

export function InventoryAlerts({ lowStock, outOfStock }: InventoryAlertsProps) {
  const totalAlerts = lowStock.length + outOfStock.length;

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Inventory Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="rounded-full bg-green-100 p-3 mb-3">
              <ShoppingCart className="size-6 text-green-600" />
            </div>
            <h3 className="text-lg font-medium mb-1">All inventory levels are good</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have no low stock or out-of-stock products
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="size-5" />
          Inventory Alerts ({totalAlerts})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {outOfStock.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-red-600 font-medium mb-3">
              <AlertCircle className="size-4" />
              Out of Stock ({outOfStock.length})
            </h3>
            <div className="space-y-3">
              {outOfStock.slice(0, 3).map((item) => (
                <div key={item.stockId} className="flex items-center gap-3 border-l-4 border-red-500 pl-3 py-2">
                  <div className="relative size-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0].secure_url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center size-full">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.product.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.sizes.length} sizes out of stock
                    </p>
                  </div>
                  
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs font-medium text-blue-600 hover:underline" asChild>
                    <Link href={`/dashboard/inventory/product/${item.product.slug}`}>
                      Manage
                    </Link>
                  </Button>
                </div>
              ))}
              
              {outOfStock.length > 3 && (
                <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium text-blue-600 hover:underline mt-2" asChild>
                  <Link href="/dashboard/inventory?stockStatus=out">
                    View {outOfStock.length - 3} more out-of-stock items
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
        
        {lowStock.length > 0 && (
          <div>
            <h3 className="flex items-center gap-2 text-amber-600 font-medium mb-3">
              <AlertTriangle className="size-4" />
              Low Stock ({lowStock.length})
            </h3>
            <div className="space-y-3">
              {lowStock.slice(0, 3).map((item) => (
                <div key={item.stockId} className="flex items-center gap-3 border-l-4 border-amber-500 pl-3 py-2">
                  <div className="relative size-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.product.images && item.product.images.length > 0 ? (
                      <Image
                        src={item.product.images[0].secure_url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center size-full">
                        <Package className="size-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.product.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.sizes.map(s => `${s.size}: ${s.quantity}`).join(", ")}
                    </p>
                  </div>
                  
                  <Button variant="link" size="sm" className="h-auto p-0 text-xs font-medium text-blue-600 hover:underline" asChild>
                    <Link href={`/dashboard/inventory/product/${item.product.slug}`}>
                      Manage
                    </Link>
                  </Button>
                </div>
              ))}
              
              {lowStock.length > 3 && (
                <Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium text-blue-600 hover:underline mt-2" asChild>
                  <Link href="/dashboard/inventory?stockStatus=low">
                    View {lowStock.length - 3} more low-stock items
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
