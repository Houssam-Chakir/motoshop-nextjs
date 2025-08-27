"use client";

import { BarChart3, Home, Package, ShoppingCart, Users, Settings, ChevronDown, Search, Tag, FolderOpen, Plus, TrendingUp, Star, Truck, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

export function DashboardSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") return true;
    if (path !== "/dashboard" && pathname.startsWith(path)) return true;
    return false;
  };

  const isSubActive = (path: string) => pathname === path;

  return (
    <Sidebar className='border-r'>
      <SidebarHeader className='border-b bg-background/50'>
        <div className='p-4'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg'>
              <Package className='size-5' />
            </div>
            <div className='flex flex-col gap-0.5 leading-none'>
              <span className='font-bold text-lg'>MotoShop</span>
              <span className='text-xs text-muted-foreground font-medium'>Admin Dashboard</span>
            </div>
          </div>

          {/* Quick Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground size-4' />
            <input
              type='text'
              placeholder='Quick search...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className='px-2'>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2'>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/dashboard")} className='h-10'>
                  <Link href='/dashboard'>
                    <Home className='size-4' />
                    <span className='font-medium'>Overview</span>
                    <Badge className='ml-auto text-xs bg-blue-100 text-blue-800'>New</Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Inventory Section - Collapsible */}
              <Collapsible defaultOpen={pathname.includes("/dashboard/inventory")}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isActive("/dashboard/inventory")} className='h-10'>
                      <Package className='size-4' />
                      <span className='font-medium'>Inventory</span>
                      <ChevronDown className='ml-auto size-4 transition-transform ui-open:rotate-180' />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isSubActive("/dashboard/inventory")}>
                          <Link href='/dashboard/inventory'>
                            <FolderOpen className='size-4' />
                            <span>All Products</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isSubActive("/dashboard/inventory/product/add")}>
                          <Link href='/dashboard/inventory/product/add'>
                            <Plus className='size-4' />
                            <span>Add Product</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild isActive={isSubActive("/dashboard/inventory/categories")}>
                          <Link href='/dashboard/inventory/categories'>
                            <Tag className='size-4' />
                            <span>Categories</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business Operations */}
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2'>Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/orders'>
                    <ShoppingCart className='size-4' />
                    <span className='font-medium'>Orders</span>
                    <Badge className='ml-auto text-xs bg-red-500 text-white'>12</Badge>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/customers'>
                    <Users className='size-4' />
                    <span className='font-medium'>Customers</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/reviews'>
                    <Star className='size-4' />
                    <span className='font-medium'>Reviews</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/shipping'>
                    <Truck className='size-4' />
                    <span className='font-medium'>Shipping</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Analytics & Reports */}
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2'>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/analytics'>
                    <BarChart3 className='size-4' />
                    <span className='font-medium'>Sales Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/reports'>
                    <FileText className='size-4' />
                    <span className='font-medium'>Reports</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/insights'>
                    <TrendingUp className='size-4' />
                    <span className='font-medium'>Insights</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2'>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className='h-10'>
                  <Link href='/dashboard/settings'>
                    <Settings className='size-4' />
                    <span className='font-medium'>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='border-t bg-background/50'>
        <div className='p-4'>
          {/* Footer Info */}
          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>© 2025 MotoShop</span>
            <Badge className='text-xs bg-gray-100 text-gray-600 border border-gray-200'>v2.1.0</Badge>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
