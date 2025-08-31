import { getOrderById } from "@/actions/fetchOrders";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PopulatedProduct } from "@/types/order";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import authOptions from "@/utils/authOptions";

interface OrderDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: OrderDetailPageProps) {
  return {
    title: `Order #${params.id} | MotoShop`,
    description: "View your order details and tracking information",
  };
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/orders");
  }

  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  const orderDate = new Date(order.orderedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const estimatedDelivery = order.estimatedDeliveryDate
    ? new Date(order.estimatedDeliveryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not available";

  return (
    <div className="container py-10 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/orders">
          <Button variant="ghost" size="sm">
            &larr; Back to Orders
          </Button>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between mb-6">
        <h1 className="text-3xl font-bold mb-2">Order #{order.trackingNumber}</h1>
        <div className="flex gap-4 items-center">
          <Badge
            variant="outline"
            className={getStatusColor(order.deliveryStatus)}
          >
            {order.deliveryStatus}
          </Badge>
          <Badge
            variant="outline"
            className={getPaymentStatusColor(order.paymentStatus)}
          >
            {order.paymentStatus}
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="divide-y">
              {order.products.map((item, idx) => (
                <div key={idx} className="py-4 flex gap-4">
                  <div className="flex-shrink-0 h-24 w-24 bg-gray-100 rounded overflow-hidden relative">
                    {item.productId && typeof item.productId === 'object' && 'images' in item.productId && item.productId.images?.[0] && (
                      <Image
                        src={item.productId.images[0]}
                        alt={typeof item.productId === 'object' && 'name' in item.productId ? String(item.productId.name) : ''}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <Link 
                        href={typeof item.productId === 'object' && 'slug' in item.productId ? `/product/${item.productId.slug}` : '#'}
                        className="font-medium hover:underline"
                      >
                        {typeof item.productId === 'object' && 'name' in item.productId ? String(item.productId.name) : 'Product'}
                      </Link>
                      <span className="font-medium">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Size: {item.size} • Qty: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-500">
                      Unit price: ${item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-4">
              <div className="flex justify-between py-2">
                <span>Subtotal</span>
                <span>${(order.orderTotalPrice - order.deliveryFee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Shipping</span>
                <span>${order.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold">
                <span>Total</span>
                <span>${order.orderTotalPrice.toFixed(2)}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 mt-6">
            <h2 className="text-lg font-semibold mb-4">Order Tracking</h2>
            <OrderTracker currentStatus={order.deliveryStatus} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Order Date</p>
                <p>{orderDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Tracking Number</p>
                <p>{order.trackingNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Estimated Delivery</p>
                <p>{estimatedDelivery}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Method</p>
                <p className="capitalize">{order.paymentMethod}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p>{order.deliveryInformation.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p>{order.deliveryInformation.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p>{order.deliveryInformation.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p>{order.deliveryInformation.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City</p>
                <p>{order.deliveryInformation.city}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Zipcode</p>
                <p>{order.deliveryInformation.zipcode}</p>
              </div>
              {order.deliveryInformation.extraDirections && (
                <div>
                  <p className="text-sm text-gray-500">Additional Information</p>
                  <p>{order.deliveryInformation.extraDirections}</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  const colors = {
    processing: "bg-blue-100 text-blue-800",
    "awaiting pickup": "bg-purple-100 text-purple-800",
    packaged: "bg-amber-100 text-amber-800",
    shipped: "bg-indigo-100 text-indigo-800",
    "in city": "bg-cyan-100 text-cyan-800", 
    "in delivery": "bg-orange-100 text-orange-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

function getPaymentStatusColor(status: string) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-purple-100 text-purple-800",
  };
  
  return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
}

function OrderTracker({ currentStatus }: { currentStatus: string }) {
  const steps = [
    { 
      id: "processing", 
      label: "Processing", 
      description: "Order is being prepared" 
    },
    { 
      id: "packaged", 
      label: "Packaged", 
      description: "Products packaged" 
    },
    { 
      id: "shipped", 
      label: "Shipped", 
      description: "Order has been shipped" 
    },
    { 
      id: "in city", 
      label: "In City", 
      description: "Order has arrived in your city" 
    },
    { 
      id: "in delivery", 
      label: "Out for Delivery", 
      description: "On its way to you" 
    },
    { 
      id: "delivered", 
      label: "Delivered", 
      description: "Successfully delivered" 
    }
  ];

  const statusIndex = {
    processing: 0,
    "awaiting pickup": 0,
    packaged: 1,
    shipped: 2,
    "in city": 3,
    "in delivery": 4,
    delivered: 5,
    cancelled: -1,
  };

  const currentIndex = statusIndex[currentStatus as keyof typeof statusIndex];
  
  // If the order is cancelled, show a special message
  if (currentStatus === "cancelled") {
    return (
      <div className="bg-red-50 text-red-800 p-4 rounded-md">
        <p className="font-medium">This order has been cancelled.</p>
        <p className="text-sm mt-1">Please contact customer support for more information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute left-4 inset-y-0 w-0.5 bg-gray-200"></div>
        {steps.map((step, index) => {
          const isComplete = currentIndex >= index;
          const isCurrent = currentIndex === index;
          
          return (
            <div key={step.id} className="relative flex items-start pb-8">
              <div className={`absolute left-4 -ml-px mt-1.5 h-full w-0.5 ${index === steps.length - 1 ? 'bg-transparent' : isComplete ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                isComplete ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 bg-white'
              }`}>
                {isComplete ? (
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-transparent"></span>
                )}
              </div>
              <div className="ml-4">
                <p className={`text-sm font-medium ${isCurrent ? 'text-blue-600' : isComplete ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
