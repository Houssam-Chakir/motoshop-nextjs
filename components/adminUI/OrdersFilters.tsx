"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, Search, X } from "lucide-react";

export function OrdersFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const status = searchParams.get("status") || "all";
  const payment = searchParams.get("payment") || "all";
  const sort = searchParams.get("sort") || "date";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  
  const setParam = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value && value !== "all") {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    
    if (name !== "page" && params.has("page")) {
      params.delete("page"); // Reset pagination when filters change
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("search", search);
  };
  
  const clearFilters = () => {
    router.push(pathname);
    setSearch("");
  };
  
  const hasActiveFilters = status !== "all" || payment !== "all" || !!search;
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order ID, email, customer name..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
        
        <div className="flex items-center gap-2">
          <Select
            value={status}
            onValueChange={(value) => setParam("status", value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="awaiting pickup">Awaiting Pickup</SelectItem>
              <SelectItem value="packaged">Packaged</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="in city">In City</SelectItem>
              <SelectItem value="in delivery">In Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={payment}
            onValueChange={(value) => setParam("payment", value)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sort === "date"}
                onCheckedChange={() => setParam("sort", "date")}
              >
                Date
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sort === "amount"}
                onCheckedChange={() => setParam("sort", "amount")}
              >
                Amount
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sort === "status"}
                onCheckedChange={() => setParam("sort", "status")}
              >
                Status
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sortOrder === "asc"}
                onCheckedChange={() => setParam("sortOrder", sortOrder === "asc" ? "desc" : "asc")}
              >
                Ascending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOrder === "desc"}
                onCheckedChange={() => setParam("sortOrder", sortOrder === "desc" ? "asc" : "desc")}
              >
                Descending
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              title="Clear filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span>Active filters:</span>
          <div className="flex gap-2 ml-2">
            {status !== "all" && (
              <div className="bg-secondary px-2 py-1 rounded-md flex items-center">
                Status: {status}
                <button onClick={() => setParam("status", "all")} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {payment !== "all" && (
              <div className="bg-secondary px-2 py-1 rounded-md flex items-center">
                Payment: {payment}
                <button onClick={() => setParam("payment", "all")} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {!!search && (
              <div className="bg-secondary px-2 py-1 rounded-md flex items-center">
                Search: {search}
                <button onClick={() => { setSearch(""); setParam("search", ""); }} className="ml-1 hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
