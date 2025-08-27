import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Plus, BarChart3, Activity, DollarSign } from "lucide-react";
import Link from "next/link";

export default async function DashboardHome() {
  // TODO: Replace with real data from your database
  const stats = {
    totalProducts: 847,
    totalOrders: 1205,
    totalCustomers: 892,
    totalRevenue: 45678,
    lowStockItems: 12,
    pendingOrders: 8,
    newCustomers: 24,
    conversionRate: 3.2,
  };

  return (
    <div className='space-y-8'>
      {/* Welcome Section */}
      <div className='flex items-start justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Welcome back!</h1>
          <p className='text-muted-foreground mt-2'>Here&apos;s what&apos;s happening with your motorcycle shop today.</p>
        </div>
        <div className='flex gap-3'>
          <Button asChild>
            <Link href='/dashboard/inventory/product/add'>
              <Plus className='size-4 mr-2' />
              Add Product
            </Link>
          </Button>
          <Button variant='outline' asChild>
            <Link href='/dashboard/analytics'>
              <BarChart3 className='size-4 mr-2' />
              View Analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
            <DollarSign className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>${stats.totalRevenue.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Orders</CardTitle>
            <ShoppingCart className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalOrders}</div>
            <p className='text-xs text-muted-foreground'>{stats.pendingOrders} pending orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Products</CardTitle>
            <Package className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalProducts}</div>
            <p className='text-xs text-muted-foreground'>{stats.lowStockItems} low stock alerts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Customers</CardTitle>
            <Users className='size-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalCustomers}</div>
            <p className='text-xs text-muted-foreground'>+{stats.newCustomers} new this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Alerts */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Activity className='size-5' />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your store</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div className='flex items-center gap-3'>
                <div className='size-8 rounded-full bg-green-100 flex items-center justify-center'>
                  <ShoppingCart className='size-4 text-green-600' />
                </div>
                <div>
                  <p className='font-medium'>New order received</p>
                  <p className='text-sm text-muted-foreground'>Order #1234 - $299.99</p>
                </div>
              </div>
              <Badge className='bg-gray-100 text-gray-800'>2 min ago</Badge>
            </div>

            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div className='flex items-center gap-3'>
                <div className='size-8 rounded-full bg-blue-100 flex items-center justify-center'>
                  <Package className='size-4 text-blue-600' />
                </div>
                <div>
                  <p className='font-medium'>Product added</p>
                  <p className='text-sm text-muted-foreground'>Honda CBR600RR Helmet</p>
                </div>
              </div>
              <Badge className='bg-gray-100 text-gray-800'>1 hour ago</Badge>
            </div>

            <div className='flex items-center justify-between p-4 border rounded-lg'>
              <div className='flex items-center gap-3'>
                <div className='size-8 rounded-full bg-purple-100 flex items-center justify-center'>
                  <Users className='size-4 text-purple-600' />
                </div>
                <div>
                  <p className='font-medium'>New customer registered</p>
                  <p className='text-sm text-muted-foreground'>john.doe@email.com</p>
                </div>
              </div>
              <Badge className='bg-gray-100 text-gray-800'>3 hours ago</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='size-5' />
              Alerts & Notifications
            </CardTitle>
            <CardDescription>Items that need your attention</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50'>
              <div className='flex items-center gap-3'>
                <AlertTriangle className='size-5 text-red-600' />
                <div>
                  <p className='font-medium text-red-900'>Low stock alert</p>
                  <p className='text-sm text-red-700'>{stats.lowStockItems} products below minimum stock</p>
                </div>
              </div>
              <Button variant='outline' size='sm' asChild>
                <Link href='/dashboard/inventory?stockStatus=low'>View</Link>
              </Button>
            </div>

            <div className='flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50'>
              <div className='flex items-center gap-3'>
                <ShoppingCart className='size-5 text-orange-600' />
                <div>
                  <p className='font-medium text-orange-900'>Pending orders</p>
                  <p className='text-sm text-orange-700'>{stats.pendingOrders} orders awaiting processing</p>
                </div>
              </div>
              <Button variant='outline' size='sm' asChild>
                <Link href='/dashboard/orders?status=pending'>Process</Link>
              </Button>
            </div>

            <div className='flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50'>
              <div className='flex items-center gap-3'>
                <TrendingUp className='size-5 text-blue-600' />
                <div>
                  <p className='font-medium text-blue-900'>Performance insight</p>
                  <p className='text-sm text-blue-700'>Conversion rate increased by 0.8%</p>
                </div>
              </div>
              <Button variant='outline' size='sm' asChild>
                <Link href='/dashboard/analytics'>Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-4'>
            <Button variant='outline' className='h-20 flex-col gap-2' asChild>
              <Link href='/dashboard/inventory/product/add'>
                <Plus className='size-5' />
                <span>Add Product</span>
              </Link>
            </Button>

            <Button variant='outline' className='h-20 flex-col gap-2' asChild>
              <Link href='/dashboard/inventory/categories/add'>
                <Plus className='size-5' />
                <span>Add Category</span>
              </Link>
            </Button>

            <Button variant='outline' className='h-20 flex-col gap-2' asChild>
              <Link href='/dashboard/orders'>
                <ShoppingCart className='size-5' />
                <span>View Orders</span>
              </Link>
            </Button>

            <Button variant='outline' className='h-20 flex-col gap-2' asChild>
              <Link href='/dashboard/customers'>
                <Users className='size-5' />
                <span>Manage Customers</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
