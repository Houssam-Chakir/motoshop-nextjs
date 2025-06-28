"use client";

import type * as React from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Adjust the import path if necessary

interface FiltersSidebarProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
  showDefaultCloseButton?: boolean;
}

function filtersSidebar({
  trigger,
  children,
  side = "right",
  className = "w-[320px] p-0",
  showDefaultCloseButton = false, // Added prop here
}: FiltersSidebarProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className={className} showDefaultCloseButton={showDefaultCloseButton}>
        <VisuallyHidden asChild>
          <SheetTitle>Filters sidebar</SheetTitle>
        </VisuallyHidden>
        {children}
      </SheetContent>
    </Sheet>
  );
}

export default filtersSidebar;
