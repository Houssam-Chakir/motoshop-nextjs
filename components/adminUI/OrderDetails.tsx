"use client";

import { useState } from "react";
import { OrderType } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "react-toastify";
import { AlertTriangle, CheckCircle2, CircleDollarSign, Loader2, MapPin, Package, Phone, ShoppingBag, Truck, User, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

interface OrderDetailsProps {
  order: OrderType;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(order);

  const handleStatusUpdate = async (status: OrderType["deliveryStatus"]) => {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${String(currentOrder._id)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();

      if (result.success) {
        setCurrentOrder({
          ...currentOrder,
          deliveryStatus: status,
        });
        toast.success("Order status updated successfully");
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch {
      toast.error("An error occurred while updating order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (status: OrderType["paymentStatus"]) => {
    setIsUpdating(true);

    try {
      const res = await fetch(`/api/admin/orders/${String(currentOrder._id)}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();

      if (result.success) {
        setCurrentOrder({
          ...currentOrder,
          paymentStatus: status,
        });
        toast.success("Payment status updated successfully");
      } else {
        toast.error(result.error || "Failed to update payment status");
      }
    } catch {
      toast.error("An error occurred while updating payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
            Processing
          </Badge>
        );
      case "awaiting pickup":
        return (
          <Badge variant='outline' className='bg-purple-50 text-purple-700 border-purple-200'>
            Awaiting Pickup
          </Badge>
        );
      case "packaged":
        return (
          <Badge variant='outline' className='bg-indigo-50 text-indigo-700 border-indigo-200'>
            Packaged
          </Badge>
        );
      case "shipped":
        return (
          <Badge variant='outline' className='bg-amber-50 text-amber-700 border-amber-200'>
            Shipped
          </Badge>
        );
      case "in city":
        return (
          <Badge variant='outline' className='bg-cyan-50 text-cyan-700 border-cyan-200'>
            In City
          </Badge>
        );
      case "in delivery":
        return (
          <Badge variant='outline' className='bg-orange-50 text-orange-700 border-orange-200'>
            In Delivery
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
            Delivered
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  const renderPaymentBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant='outline' className='bg-yellow-50 text-yellow-700 border-yellow-200'>
            Pending
          </Badge>
        );
      case "processing":
        return (
          <Badge variant='outline' className='bg-blue-50 text-blue-700 border-blue-200'>
            Processing
          </Badge>
        );
      case "paid":
        return (
          <Badge variant='outline' className='bg-green-50 text-green-700 border-green-200'>
            Paid
          </Badge>
        );
      case "failed":
        return (
          <Badge variant='outline' className='bg-red-50 text-red-700 border-red-200'>
            Failed
          </Badge>
        );
      case "refunded":
        return (
          <Badge variant='outline' className='bg-purple-50 text-purple-700 border-purple-200'>
            Refunded
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  return (
    <div className='space-y-6'>
      {/* Order Header */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-bold'>Order #{currentOrder.trackingNumber}</h2>
          <p className='text-sm text-muted-foreground'>
            Placed on {new Date(currentOrder.createdAt || "").toLocaleDateString()} ({formatDistanceToNow(new Date(currentOrder.createdAt || ""), { addSuffix: true })})
          </p>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <div className='flex items-center gap-2'>
            <span className='text-sm font-medium'>Status:</span>
            {renderStatusBadge(currentOrder.deliveryStatus)}
          </div>
          <div className='flex items-center gap-2 ml-4'>
            <span className='text-sm font-medium'>Payment:</span>
            {renderPaymentBadge(currentOrder.paymentStatus)}
          </div>
        </div>
      </div>

      <Separator />

      {/* Order Information */}
      <Tabs defaultValue='details'>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='details'>Order Details</TabsTrigger>
          <TabsTrigger value='customer'>Customer</TabsTrigger>
          <TabsTrigger value='actions'>Actions</TabsTrigger>
        </TabsList>

        {/* Order Details Tab */}
        <TabsContent value='details' className='space-y-4 pt-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base flex items-center'>
                  <ShoppingBag className='mr-2 size-4' />
                  Products
                </CardTitle>
                <CardDescription>Items in this order</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {currentOrder.products.map((product, index) => (
                    <div key={`${product.productId}-${index}`} className='flex items-center gap-3 pb-3 border-b last:border-0'>
                      <div className='size-16 bg-secondary rounded-md relative overflow-hidden'>
                        {(() => {
                          const raw =
                            product.productId && typeof product.productId === "object" && "images" in product.productId ? (product.productId as any).images?.[0] : undefined;
                          const src = typeof raw === "string" ? raw : "";
                          const isAbsolute = /^https?:\/\//.test(src);
                          const isLocal = src.startsWith("/");
                          const safeSrc = isAbsolute || isLocal ? src : "/empty.svg";
                          const alt =
                            product.productId && typeof product.productId === "object" && "name" in product.productId ? String((product.productId as any).name) : "Product";
                          return safeSrc ? (
                            <Image src={safeSrc} alt={alt} fill sizes='64px' className='object-cover' />
                          ) : (
                            <Package className='size-8 absolute inset-0 m-auto text-muted-foreground' />
                          );
                        })()}
                      </div>
                      <div className='flex-1'>
                        <p className='font-medium'>{typeof product.productId === "object" && "name" in product.productId ? product.productId.name : "Product"}</p>
                        <div className='flex items-center justify-between mt-1'>
                          <div className='text-sm text-muted-foreground'>
                            <span>Size: {product.size}</span>
                            <span className='mx-2'>•</span>
                            <span>Qty: {product.quantity}</span>
                          </div>
                          <div className='font-semibold'>${product.totalPrice.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base flex items-center'>
                  <CircleDollarSign className='mr-2 size-4' />
                  Order Summary
                </CardTitle>
                <CardDescription>Payment and pricing details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm'>Subtotal</span>
                    <span className='font-medium'>${(currentOrder.orderTotalPrice - currentOrder.deliveryFee).toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-sm'>Shipping</span>
                    <span className='font-medium'>${currentOrder.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between items-center font-semibold border-t pt-2 mt-2'>
                    <span>Total</span>
                    <span>${currentOrder.orderTotalPrice.toFixed(2)}</span>
                  </div>

                  <div className='pt-4'>
                    <div className='flex items-center mb-2'>
                      <span className='text-sm font-medium mr-2'>Payment Method:</span>
                      <Badge variant='outline'>
                        {currentOrder.paymentMethod === "cmi" ? "Credit Card" : currentOrder.paymentMethod === "delivery" ? "Cash on Delivery" : "Pickup"}
                      </Badge>
                    </div>
                    <div className='flex items-center'>
                      <span className='text-sm font-medium mr-2'>Payment Status:</span>
                      {renderPaymentBadge(currentOrder.paymentStatus)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base flex items-center'>
                  <Truck className='mr-2 size-4' />
                  Delivery Information
                </CardTitle>
                <CardDescription>Shipping details</CardDescription>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div>
                  <div className='flex items-center'>
                    <User className='size-4 mr-2 text-muted-foreground' />
                    <span className='font-medium'>{currentOrder.deliveryInformation.fullName}</span>
                  </div>
                </div>
                <div>
                  <div className='flex items-center'>
                    <Phone className='size-4 mr-2 text-muted-foreground' />
                    <span>{currentOrder.deliveryInformation.phoneNumber}</span>
                  </div>
                </div>
                <div>
                  <div className='flex'>
                    <MapPin className='size-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5' />
                    <span>
                      {currentOrder.deliveryInformation.address}, {currentOrder.deliveryInformation.city}, {currentOrder.deliveryInformation.zipcode}
                      {currentOrder.deliveryInformation.extraDirections && <p className='text-sm text-muted-foreground mt-1'>{currentOrder.deliveryInformation.extraDirections}</p>}
                    </span>
                  </div>
                </div>
                <div>
                  <div className='flex items-center mt-3'>
                    <span className='text-sm font-medium mr-2'>Delivery Status:</span>
                    {renderStatusBadge(currentOrder.deliveryStatus)}
                  </div>
                  {currentOrder.estimatedDeliveryDate && (
                    <div className='flex items-center mt-2'>
                      <Calendar className='size-4 mr-2 text-muted-foreground' />
                      <span className='text-sm'>Est. delivery: {new Date(currentOrder.estimatedDeliveryDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-base flex items-center'>
                  <Clock className='mr-2 size-4' />
                  Timeline
                </CardTitle>
                <CardDescription>Order history</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {/* This would ideally be pulled from order history/events in a real app */}
                  <div className='flex gap-3 items-start'>
                    <div className='size-2 rounded-full bg-green-500 mt-2'></div>
                    <div>
                      <p className='font-medium'>Order Placed</p>
                      <p className='text-sm text-muted-foreground'>{new Date(currentOrder.createdAt || "").toLocaleString()}</p>
                    </div>
                  </div>

                  <div className='flex gap-3 items-start'>
                    <div
                      className={`size-2 rounded-full mt-2 ${
                        ["processing", "awaiting pickup", "packaged", "shipped", "in city", "in delivery", "delivered"].includes(currentOrder.deliveryStatus)
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                    ></div>
                    <div>
                      <p className='font-medium'>Processing</p>
                      <p className='text-sm text-muted-foreground'>{currentOrder.deliveryStatus === "processing" ? "In progress" : "Complete"}</p>
                    </div>
                  </div>

                  <div className='flex gap-3 items-start'>
                    <div
                      className={`size-2 rounded-full mt-2 ${
                        ["packaged", "shipped", "in city", "in delivery", "delivered"].includes(currentOrder.deliveryStatus) ? "bg-green-500" : "bg-muted"
                      }`}
                    ></div>
                    <div>
                      <p className='font-medium'>Packaged</p>
                      <p className='text-sm text-muted-foreground'>
                        {currentOrder.deliveryStatus === "packaged"
                          ? "In progress"
                          : ["shipped", "in city", "in delivery", "delivered"].includes(currentOrder.deliveryStatus)
                          ? "Complete"
                          : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-3 items-start'>
                    <div
                      className={`size-2 rounded-full mt-2 ${
                        ["shipped", "in city", "in delivery", "delivered"].includes(currentOrder.deliveryStatus) ? "bg-green-500" : "bg-muted"
                      }`}
                    ></div>
                    <div>
                      <p className='font-medium'>Shipped</p>
                      <p className='text-sm text-muted-foreground'>
                        {currentOrder.deliveryStatus === "shipped"
                          ? "In progress"
                          : ["in city", "in delivery", "delivered"].includes(currentOrder.deliveryStatus)
                          ? "Complete"
                          : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-3 items-start'>
                    <div className={`size-2 rounded-full mt-2 ${["delivered"].includes(currentOrder.deliveryStatus) ? "bg-green-500" : "bg-muted"}`}></div>
                    <div>
                      <p className='font-medium'>Delivered</p>
                      <p className='text-sm text-muted-foreground'>{currentOrder.deliveryStatus === "delivered" ? "Complete" : "Pending"}</p>
                    </div>
                  </div>

                  {currentOrder.deliveryStatus === "cancelled" && (
                    <div className='flex gap-3 items-start'>
                      <div className='size-2 rounded-full bg-red-500 mt-2'></div>
                      <div>
                        <p className='font-medium'>Cancelled</p>
                        <p className='text-sm text-muted-foreground'>Order has been cancelled</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customer Tab */}
        <TabsContent value='customer' className='pt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Details about the customer who placed this order</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <h3 className='font-medium mb-2'>Contact Details</h3>
                  <div className='space-y-2'>
                    <div className='flex items-center'>
                      <User className='size-4 mr-2 text-muted-foreground' />
                      <span>{currentOrder.deliveryInformation.fullName}</span>
                    </div>
                    <div className='flex items-center'>
                      <Phone className='size-4 mr-2 text-muted-foreground' />
                      <span>{currentOrder.deliveryInformation.phoneNumber}</span>
                    </div>
                    <div className='flex items-center'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='16'
                        height='16'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        className='size-4 mr-2 text-muted-foreground'
                      >
                        <rect width='20' height='16' x='2' y='4' rx='2' />
                        <path d='m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' />
                      </svg>
                      <span>{currentOrder.deliveryInformation.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className='font-medium mb-2'>Shipping Address</h3>
                  <div className='flex'>
                    <MapPin className='size-4 mr-2 text-muted-foreground flex-shrink-0 mt-0.5' />
                    <div>
                      <p>{currentOrder.deliveryInformation.address}</p>
                      <p>
                        {currentOrder.deliveryInformation.city}, {currentOrder.deliveryInformation.zipcode}
                      </p>
                      {currentOrder.deliveryInformation.extraDirections && <p className='text-sm text-muted-foreground mt-1'>{currentOrder.deliveryInformation.extraDirections}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* In a real application, you might show additional customer info here,
                  such as past orders, account history, etc. */}
              <div>
                <h3 className='font-medium mb-2'>Order Notes</h3>
                <p className='text-sm text-muted-foreground'>No special notes for this order.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value='actions' className='pt-4'>
          <Card>
            <CardHeader>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Update order status and manage fulfillment</CardDescription>
            </CardHeader>
            <CardContent className='space-y-6'>
              {/* Update Delivery Status */}
              <div>
                <h3 className='font-medium mb-3'>Update Delivery Status</h3>
                <div className='grid grid-cols-2 sm:grid-cols-4 gap-2'>
                  <Button
                    variant={currentOrder.deliveryStatus === "processing" ? "default" : "outline"}
                    onClick={() => handleStatusUpdate("processing")}
                    disabled={isUpdating}
                    size='sm'
                  >
                    <Clock className='mr-2 size-4' />
                    Processing
                  </Button>

                  <Button
                    variant={currentOrder.deliveryStatus === "packaged" ? "default" : "outline"}
                    onClick={() => handleStatusUpdate("packaged")}
                    disabled={isUpdating}
                    size='sm'
                  >
                    <Package className='mr-2 size-4' />
                    Packaged
                  </Button>

                  <Button variant={currentOrder.deliveryStatus === "shipped" ? "default" : "outline"} onClick={() => handleStatusUpdate("shipped")} disabled={isUpdating} size='sm'>
                    <Truck className='mr-2 size-4' />
                    Shipped
                  </Button>

                  <Button
                    variant={currentOrder.deliveryStatus === "in delivery" ? "default" : "outline"}
                    onClick={() => handleStatusUpdate("in delivery")}
                    disabled={isUpdating}
                    size='sm'
                  >
                    <Truck className='mr-2 size-4' />
                    In Delivery
                  </Button>

                  <Button
                    variant={currentOrder.deliveryStatus === "delivered" ? "default" : "outline"}
                    onClick={() => handleStatusUpdate("delivered")}
                    disabled={isUpdating}
                    className='bg-green-600 hover:bg-green-700 text-white'
                    size='sm'
                  >
                    <CheckCircle2 className='mr-2 size-4' />
                    Delivered
                  </Button>

                  <Button
                    variant={currentOrder.deliveryStatus === "cancelled" ? "default" : "outline"}
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={isUpdating}
                    className='bg-red-600 hover:bg-red-700 text-white'
                    size='sm'
                  >
                    <AlertTriangle className='mr-2 size-4' />
                    Cancelled
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Update Payment Status */}
              <div>
                <h3 className='font-medium mb-3'>Update Payment Status</h3>
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-2'>
                  <Button
                    variant={currentOrder.paymentStatus === "pending" ? "default" : "outline"}
                    onClick={() => handlePaymentStatusUpdate("pending")}
                    disabled={isUpdating}
                    size='sm'
                  >
                    <Clock className='mr-2 size-4' />
                    Pending
                  </Button>

                  <Button
                    variant={currentOrder.paymentStatus === "paid" ? "default" : "outline"}
                    onClick={() => handlePaymentStatusUpdate("paid")}
                    disabled={isUpdating}
                    className='bg-green-600 hover:bg-green-700 text-white'
                    size='sm'
                  >
                    <CheckCircle2 className='mr-2 size-4' />
                    Paid
                  </Button>

                  <Button
                    variant={currentOrder.paymentStatus === "refunded" ? "default" : "outline"}
                    onClick={() => handlePaymentStatusUpdate("refunded")}
                    disabled={isUpdating}
                    size='sm'
                  >
                    <CircleDollarSign className='mr-2 size-4' />
                    Refunded
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {isUpdating && (
                <div className='flex items-center justify-center py-2'>
                  <Loader2 className='size-4 animate-spin mr-2' />
                  <span className='text-sm'>Updating order...</span>
                </div>
              )}

              <Separator />

              {/* Additional Actions */}
              <div>
                <h3 className='font-medium mb-3'>Additional Actions</h3>
                <div className='flex flex-wrap gap-2'>
                  <Button variant='outline' size='sm'>
                    Print Invoice
                  </Button>
                  <Button variant='outline' size='sm'>
                    Send Tracking Info
                  </Button>
                  <Button variant='outline' size='sm'>
                    Contact Customer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
