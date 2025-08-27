"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export function DashboardBreadcrumb() {
  const pathname = usePathname();

  // Split the pathname and filter out empty segments
  const segments = pathname.split("/").filter(Boolean);

  // Create breadcrumb items
  const breadcrumbItems = [];

  // Always add Dashboard as the first item
  breadcrumbItems.push({
    href: "/dashboard",
    label: "Dashboard",
    isLast: false,
  });

  // Build breadcrumb trail
  let currentPath = "";
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;

    // Skip 'dashboard' as we already added it
    if (segment === "dashboard") continue;

    const isLast = i === segments.length - 1;
    let label = segment;

    // Transform segment names to user-friendly labels
    switch (segment) {
      case "inventory":
        label = "Inventory";
        break;
      case "product":
        label = "Products";
        break;
      case "categories":
        label = "Categories";
        break;
      case "add":
        label = "Add New";
        break;
      case "edit":
        label = "Edit";
        break;
      case "orders":
        label = "Orders";
        break;
      case "customers":
        label = "Customers";
        break;
      case "analytics":
        label = "Analytics";
        break;
      case "reports":
        label = "Reports";
        break;
      case "settings":
        label = "Settings";
        break;
      default:
        // For dynamic segments like IDs, check if it's a valid ID format
        if (segment.match(/^[a-f\d]{24}$/i)) {
          label = "Details";
        } else {
          // Capitalize first letter for other segments
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
        }
    }

    breadcrumbItems.push({
      href: currentPath,
      label,
      isLast,
    });
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href='/dashboard' className='flex items-center gap-1'>
              <Home className='size-4' />
              <span>Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbItems.slice(1).map((item) => (
          <div key={item.href} className='flex items-center gap-2'>
            <BreadcrumbSeparator>
              <ChevronRight className='size-4' />
            </BreadcrumbSeparator>

            <BreadcrumbItem>
              {item.isLast ? (
                <BreadcrumbPage className='font-medium'>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href} className='hover:text-foreground'>
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
