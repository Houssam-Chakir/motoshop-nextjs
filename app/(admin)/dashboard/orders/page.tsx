import { Suspense } from 'react';
import { getAllOrders } from '@/actions/fetchOrders';
import { DashboardBreadcrumb } from '@/components/adminUI/DashboardBreadcrumb';
import { OrdersTable } from '@/components/adminUI/OrdersTable';
import { OrdersFilters } from '@/components/adminUI/OrdersFilters';
import { OrdersStats } from '@/components/adminUI/OrdersStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata = {
  title: 'Orders Management | Dashboard',
  description: 'Manage customer orders',
};

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    payment?: string;
    search?: string;
    sort?: string;
    sortOrder?: string;
    page?: string;
  };
}) {
  // Get filtered orders - we'll fetch them directly in the OrdersTable component
  // to allow for client-side filtering and sorting
  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      <ToastProvider />
      <div className="flex items-center justify-between">
        <div>
          <DashboardBreadcrumb />
          <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
          <p className="text-muted-foreground">
            View and manage all customer orders
          </p>
        </div>
      </div>

      {/* Order Stats Cards */}
      <Suspense fallback={<div className="h-28 bg-muted animate-pulse rounded-lg" />}>
        <OrdersStats orders={orders} />
      </Suspense>

      {/* Orders Table with Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Manage and process customer orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-12 bg-muted animate-pulse rounded-lg mb-4" />}>
            <OrdersFilters />
          </Suspense>
          
          <div className="mt-4">
            <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-lg" />}>
              <OrdersTable initialOrders={orders} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
