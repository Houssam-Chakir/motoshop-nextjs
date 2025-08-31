"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { price } from "@/lib/price";

interface StatCardsProps {
  stats: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    lowStockItems: number;
    totalCustomers: number;
    newCustomers: number;
  };
}

export function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{price(stats.totalRevenue, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            <span 
              className={cn(
                "mr-1 font-medium",
                stats.revenueGrowth >= 0 ? "text-green-600" : "text-red-600"
              )}
            >
              {stats.revenueGrowth >= 0 ? "+" : ""}{stats.revenueGrowth.toFixed(1)}%
            </span>
            from last month
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Orders</CardTitle>
          <ShoppingCart className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrders}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center">
            {stats.pendingOrders > 0 ? (
              <>
                <span className="text-amber-600 font-medium">{stats.pendingOrders}</span>
                <span className="ml-1">pending orders</span>
              </>
            ) : (
              <span className="text-green-600">No pending orders</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Products</CardTitle>
          <Package className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalProducts}</div>
          <div className="text-xs text-muted-foreground mt-1 flex items-center">
            {stats.lowStockItems > 0 ? (
              <>
                <span className="text-amber-600 font-medium">{stats.lowStockItems}</span>
                <span className="ml-1">low stock alerts</span>
              </>
            ) : (
              <span className="text-green-600">All stocks are good</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Customers</CardTitle>
          <Users className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCustomers}</div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {stats.newCustomers > 0 ? (
              <>
                <span className="text-green-600 font-medium mr-1">+{stats.newCustomers}</span>
                new this month
              </>
            ) : (
              "No new customers this month"
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
