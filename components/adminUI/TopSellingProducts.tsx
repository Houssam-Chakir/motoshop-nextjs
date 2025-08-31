"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Package } from "lucide-react";
import { price } from "@/lib/price";

interface TopProduct {
  _id: string;
  name: string;
  totalSold: number;
  totalRevenue: number;
  image?: { secure_url: string };
  slug: string;
}

interface TopSellingProductsProps {
  products: TopProduct[];
}

export function TopSellingProducts({ products }: TopSellingProductsProps) {
  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5" />
            Top Selling Products
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Package className="size-10 text-muted-foreground mb-3" />
            <p className="mb-2 font-medium">No product data available</p>
            <p className="text-sm text-muted-foreground mb-4">
              Products will appear here once sales start coming in
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/inventory/product/add">Add Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="size-5" />
          Top Selling Products
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/analytics/products">
            View All
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {products.map((product) => (
            <div key={product._id} className="flex items-center gap-4">
              <div className="flex-shrink-0 relative rounded-md overflow-hidden border bg-muted size-16">
                {product.image ? (
                  <Image
                    src={product.image.secure_url}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center size-full">
                    <Package className="size-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                  <Link 
                    href={`/dashboard/inventory/product/${product.slug}`}
                    className="hover:underline"
                  >
                    {product.name}
                  </Link>
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs font-normal">
                    {product.totalSold} sold
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {price(product.totalRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/dashboard/inventory/product/${product.slug}`}>
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
