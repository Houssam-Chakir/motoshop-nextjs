import { getUserOrders } from "@/actions/fetchOrders";
import { OrderType, PopulatedProduct } from "@/types/order";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import authOptions from "@/utils/authOptions";

export const metadata = {
  title: "Your Orders | MotoShop",
  description: "View and track your orders",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  const orders = await getUserOrders();

  if (orders.length === 0) {
    return (
      <div className="py-10 px-4">
        <h1 className="text-2xl font-bold mb-4">Your Orders</h1>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <svg
            className="h-16 w-16 text-gray-400 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="text-lg font-medium mb-1">No orders found</h3>
          <p className="text-gray-500 mb-6">You don&apos;t have any orders yet. Let&apos;s fix that!</p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard key={String(order._id)} order={order} />
        ))}
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: OrderType }) {
  const deliveryStatusColors = {
    processing: "bg-amber-500",
    "awaiting pickup": "bg-sky-500",
    packaged: "bg-indigo-500",
    shipped: "bg-blue-500",
    "in city": "bg-purple-500",
    "in delivery": "bg-pink-500",
    delivered: "bg-green-500",
    cancelled: "bg-red-500",
  };

  // Payment status is shown on the detail page only

  return (
    <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Ordered on</p>
            <p className="font-medium">{new Date(order.orderedAt).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Order #</p>
            <p className="font-medium">{order.trackingNumber}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="font-medium">${order.orderTotalPrice.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <Badge variant="outline" className={deliveryStatusColors[order.deliveryStatus]}>
              {order.deliveryStatus}
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium mb-2">Items</p>
            <div className="space-y-4">
              {order.products.slice(0, 2).map((item, idx) => {
                const product = typeof item.productId === 'object' && item.productId ? item.productId as PopulatedProduct : null;
                return (
                  <div key={idx} className="flex items-center mr-2">
                    <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden relative">
                      {product && product.images && product.images.length > 0 && (
                        <Image
                          src={product.images[0]}
                          alt={product.name || ''}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="font-medium line-clamp-1">
                        {product ? product.name : 'Product'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm">${item.unitPrice.toFixed(2)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {order.products.length > 2 && (
            <p className="text-sm text-gray-500">
              +{order.products.length - 2} more items
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <div className="space-x-3">
            <Link href={`/orders/${order._id?.toString()}`} className="text-primary hover:underline">
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
