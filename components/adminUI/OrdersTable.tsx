"use client";

import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { OrderType } from "@/types/order";
import { formatDistanceToNow } from "date-fns";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Eye, MoreHorizontal, CheckCircle, XCircle, Clock, Truck } from "lucide-react";
import { toast } from "react-toastify";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OrderDetails } from "./OrderDetails";
import { OrderPagination } from "@/components/adminUI/OrderPagination";

interface OrdersTableProps {
  initialOrders: OrderType[];
}

export function OrdersTable({ initialOrders }: OrdersTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams = useSearchParams();
  
  const [orders, setOrders] = useState<OrderType[]>(initialOrders);
  const [filteredOrders, setFilteredOrders] = useState<OrderType[]>(initialOrders);
  // derive current page from live URL params to avoid SSR/CSR mismatch
  const initialPage = Number(currentSearchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState<number>(isNaN(initialPage) ? 1 : initialPage);
  const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const itemsPerPage = 10;

  // Filter and sort orders based on LIVE search params
  useEffect(() => {
    const qs = currentSearchParams;
    const status = qs.get("status") || "all";
    const payment = qs.get("payment") || "all";
    const search = qs.get("search") || "";
    const sort = qs.get("sort") || "date";
    const sortOrderParam = qs.get("sortOrder") || "desc";

    let result = [...orders];

    if (status !== "all") {
      result = result.filter(order => order.deliveryStatus === status);
    }
    if (payment !== "all") {
      result = result.filter(order => order.paymentStatus === payment);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(order => 
        order.trackingNumber.toLowerCase().includes(s) ||
        order.deliveryInformation.fullName.toLowerCase().includes(s) ||
        order.deliveryInformation.email.toLowerCase().includes(s) ||
        order.deliveryInformation.phoneNumber.toLowerCase().includes(s)
      );
    }

    const sortOrder = sortOrderParam === "desc" ? -1 : 1;
    result.sort((a, b) => {
      switch (sort) {
        case "date":
          return sortOrder * (new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime());
        case "amount":
          return sortOrder * (a.orderTotalPrice - b.orderTotalPrice);
        case "status":
          return sortOrder * a.deliveryStatus.localeCompare(b.deliveryStatus);
        default:
          return 0;
      }
    });

    setFilteredOrders(result);
  }, [orders, currentSearchParams]);

  // Keep currentPage in sync when URL 'page' changes
  useEffect(() => {
    const page = Number(currentSearchParams.get("page") || "1");
    setCurrentPage(isNaN(page) ? 1 : page);
  }, [currentSearchParams]);

  // Update URL with current filters and page
  const updateSearchParams = (params: Record<string, string>) => {
    const newParams = new URLSearchParams(currentSearchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    
    router.push(`${pathname}?${newParams.toString()}`);
  };

  // Handle status change
  const handleStatusChange = async (orderId: string | any, status: OrderType["deliveryStatus"]) => {
    setIsUpdating(orderId);
    
    try {
      const res = await fetch(`/api/admin/orders/${String(orderId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await res.json();
      
      if (result.success) {
        setOrders(orders.map((order) => 
          String(order._id) === String(orderId) ? { ...order, deliveryStatus: status } : order
        ));
        toast.success("Order status updated successfully");
      } else {
        toast.error(result.error || "Failed to update order status");
      }
    } catch {
      toast.error("An error occurred while updating the order");
    } finally {
      setIsUpdating(null);
    }
  };

  // View order details
  const viewOrderDetails = (order: OrderType) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateSearchParams({ page: page.toString() });
  };

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case "awaiting pickup":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Awaiting Pickup</Badge>;
      case "packaged":
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">Packaged</Badge>;
      case "shipped":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Shipped</Badge>;
      case "in city":
        return <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">In City</Badge>;
      case "in delivery":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">In Delivery</Badge>;
      case "delivered":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Delivered</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Payment status badge renderer
  const renderPaymentBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case "processing":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>;
      case "paid":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Paid</Badge>;
      case "failed":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>;
      case "refunded":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No orders found matching the current filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={String(order._id)}>
                  <TableCell className="font-medium">
                    #{order.trackingNumber.substring(4, 12)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{order.deliveryInformation.fullName}</p>
                      <p className="text-sm text-muted-foreground">{order.deliveryInformation.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{new Date(order.createdAt || "").toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.createdAt || ""), { addSuffix: true })}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {renderStatusBadge(order.deliveryStatus)}
                  </TableCell>
                  <TableCell>
                    {renderPaymentBadge(order.paymentStatus)}
                  </TableCell>
                  <TableCell>${order.orderTotalPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => viewOrderDetails(order)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" disabled={!!isUpdating}>
                            {isUpdating === order._id ? (
                              <div className="size-4 border-2 border-t-transparent border-blue-600 rounded-full animate-spin" />
                            ) : (
                              <MoreHorizontal className="size-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => viewOrderDetails(order)}>
                            <Eye className="mr-2 size-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleStatusChange(order._id, "processing")}>
                            <Clock className="mr-2 size-4" /> Processing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order._id, "packaged")}>
                            <CheckCircle className="mr-2 size-4" /> Packaged
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order._id, "shipped")}>
                            <Truck className="mr-2 size-4" /> Shipped
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order._id, "delivered")}>
                            <CheckCircle className="mr-2 size-4" /> Delivered
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(order._id, "cancelled")}>
                            <XCircle className="mr-2 size-4" /> Cancelled
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {filteredOrders.length > 0 && (
        <OrderPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
      
      {/* Order Details Sheet (Sidebar) */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent 
          side="right"
          className="w-full sm:max-w-3xl h-full overflow-y-auto bg-white dark:bg-neutral-900 border-l border-gray-200 dark:border-neutral-800 rounded-l-2xl shadow-2xl p-0"
        >
          <SheetHeader className="sticky top-0 z-10 bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-b border-gray-200 dark:border-neutral-800 px-6 py-4">
            <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Order Details</SheetTitle>
          </SheetHeader>
          <div className="px-6 py-6">
            {selectedOrder && <OrderDetails order={selectedOrder} />}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
