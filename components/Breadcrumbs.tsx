import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";

const capitalize = (s: string) => {
  const text = s.replace(/-/g, " ");
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export default function Breadcrumbs({ path }: { path: string }) {
  // Filter out empty strings from the path
  const pathSegments = path.split("/").filter((crumb) => crumb);

  // Don't render anything if there's no path
  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className=''>
      <BreadcrumbList>
        {/* Home Crumb */}
        <BreadcrumbItem className='text-xs'>
          <BreadcrumbLink asChild>
            <Link href='/'>Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Path Crumbs */}
        {pathSegments.map((segment, index) => {
          const href = "/" + pathSegments.slice(0, index + 1).join("/");
          const isLast = index === pathSegments.length - 1;

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator className={`text-xs opacity-50 ${isLast ? 'opacity-0' : ''} md:opacity-100`} />
              <BreadcrumbItem className='text-xs'>
                {isLast ? (
                  <BreadcrumbPage className='max-w-0 sm:max-w-12 md:max-w-64 truncate cursor-default text-xs'>{capitalize(segment)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href}>{capitalize(segment)}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
