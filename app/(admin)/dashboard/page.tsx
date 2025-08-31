import { Button } from "@/components/ui/button";
import { Plus, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

// Import data fetching functions
import { getDashboardStats, getRecentActivity, getTopSellingProducts, getInventoryAlerts, getSalesChartData } from "@/actions/getDashboardData";

// Import UI components
import { StatCards } from "@/components/adminUI/StatCards";
import { RecentActivity } from "@/components/adminUI/RecentActivity";
import { TopSellingProducts } from "@/components/adminUI/TopSellingProducts";
import { InventoryAlerts } from "@/components/adminUI/InventoryAlerts";
import { SalesChart } from "@/components/adminUI/SalesChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Loading fallbacks
function StatCardsLoading() {
  return <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-36 rounded-lg bg-muted"></div>
    ))}
  </div>;
}

function ChartLoading() {
  return <div className="h-80 rounded-lg bg-muted animate-pulse"></div>;
}

function CardLoading() {
  return <div className="h-80 rounded-lg bg-muted animate-pulse"></div>;
}

export default async function DashboardHome() {
  // Fetch all necessary data in parallel
  const statsPromise = getDashboardStats();
  const recentActivityPromise = getRecentActivity(10);
  const topProductsPromise = getTopSellingProducts(5);
  const inventoryAlertsPromise = getInventoryAlerts();
  const salesChartDataPromise = getSalesChartData(30);
  
  // Await all promises at once for performance
  const [stats, recentActivity, topProducts, inventoryAlerts, salesChartData] = await Promise.all([
    statsPromise,
    recentActivityPromise,
    topProductsPromise,
    inventoryAlertsPromise,
    salesChartDataPromise
  ]);

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
      <Suspense fallback={<StatCardsLoading />}>
        <StatCards stats={stats} />
      </Suspense>

      {/* Sales Chart */}
      <Suspense fallback={<ChartLoading />}>
        <SalesChart data={salesChartData} />
      </Suspense>

      {/* Quick Actions & Alerts */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Recent Activity */}
        <Suspense fallback={<CardLoading />}>
          <RecentActivity activities={recentActivity as any} />
        </Suspense>

        {/* Inventory Alerts */}
        <Suspense fallback={<CardLoading />}>
          <InventoryAlerts 
            lowStock={inventoryAlerts.lowStock as any} 
            outOfStock={inventoryAlerts.outOfStock as any} 
          />
        </Suspense>
      </div>

      {/* Top Selling Products */}
      <Suspense fallback={<CardLoading />}>
        <TopSellingProducts products={topProducts} />
      </Suspense>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-3 lg:grid-cols-5'>
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
                <ArrowRight className='size-5' />
                <span>View Orders</span>
              </Link>
            </Button>

            <Button variant='outline' className='h-20 flex-col gap-2' asChild>
              <Link href='/dashboard/customers'>
                <ArrowRight className='size-5' />
                <span>Customers</span>
              </Link>
            </Button>

            <Button variant='outline' className='h-20 flex-col gap-2' asChild>
              <Link href='/dashboard/inventory'>
                <ArrowRight className='size-5' />
                <span>Inventory</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
