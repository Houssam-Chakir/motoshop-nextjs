"use client";

import { useMemo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { OrderType } from '@/types/order';
import { CircleCheck, Clock, CircleDollarSign, CircleAlert, Truck, CircleX } from 'lucide-react';

interface OrdersStatsProps {
  orders: OrderType[];
}

export function OrdersStats({ orders }: OrdersStatsProps) {
  const stats = useMemo(() => {
    // Calculate stats from orders
    const totalOrders = orders.length;
    
    // Order status counts
    const processing = orders.filter(order => order.deliveryStatus === 'processing').length;
    const shipped = orders.filter(order => ['shipped', 'in city', 'in delivery'].includes(order.deliveryStatus)).length;
    const delivered = orders.filter(order => order.deliveryStatus === 'delivered').length;
    const cancelled = orders.filter(order => order.deliveryStatus === 'cancelled').length;
    
    // Revenue calculations
    const totalRevenue = orders.reduce((sum, order) => sum + order.orderTotalPrice, 0);
    const paidRevenue = orders
      .filter(order => order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.orderTotalPrice, 0);

    return {
      totalOrders,
      processing,
      shipped,
      delivered,
      cancelled,
      totalRevenue: totalRevenue.toFixed(2),
      paidRevenue: paidRevenue.toFixed(2),
    };
  }, [orders]);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total Orders"
        value={stats.totalOrders.toString()}
        description="All time orders"
        icon={<CircleDollarSign className="size-4" />}
      />
      
      <StatsCard 
        title="Processing"
        value={stats.processing.toString()}
        description="Orders being processed"
        icon={<Clock className="size-4" />}
        className="bg-blue-50 border-blue-100"
      />
      
      <StatsCard 
        title="Shipping"
        value={stats.shipped.toString()}
        description="Orders in transit"
        icon={<Truck className="size-4" />}
        className="bg-amber-50 border-amber-100"
      />
      
      <StatsCard 
        title="Delivered"
        value={stats.delivered.toString()}
        description="Successfully delivered"
        icon={<CircleCheck className="size-4" />}
        className="bg-green-50 border-green-100"
      />
      
      <StatsCard 
        title="Cancelled"
        value={stats.cancelled.toString()}
        description="Cancelled orders"
        icon={<CircleX className="size-4" />}
        className="bg-red-50 border-red-100"
      />
      
      <StatsCard 
        title="Total Revenue"
        value={`$${stats.totalRevenue}`}
        description="All time revenue"
        icon={<CircleDollarSign className="size-4" />}
        className="bg-purple-50 border-purple-100"
      />
      
      <StatsCard 
        title="Paid Revenue"
        value={`$${stats.paidRevenue}`}
        description="Confirmed payments"
        icon={<CircleCheck className="size-4" />}
        className="bg-emerald-50 border-emerald-100"
      />
      
      <StatsCard 
        title="Conversion Rate"
        value={`${stats.totalOrders ? Math.round((stats.delivered / stats.totalOrders) * 100) : 0}%`}
        description="Delivery success rate"
        icon={<CircleAlert className="size-4" />}
        className="bg-indigo-50 border-indigo-100"
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

function StatsCard({ title, value, description, icon, className = "" }: StatsCardProps) {
  return (
    <Card className={`border ${className}`}>
      <CardContent className="p-4 flex items-center">
        <div className="rounded-full bg-primary/10 p-2 mr-3">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
