"use client";

import type * as React from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Adjust the import path if necessary

interface MobileSliderProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
  showDefaultCloseButton?: boolean;
}

export function MobileSlider({
  trigger,
  children,
  side = "left",
  className = "w-[350px] p-0",
  showDefaultCloseButton, // Added prop here
}: MobileSliderProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className={className} showDefaultCloseButton={showDefaultCloseButton}>
        <VisuallyHidden asChild>
          <SheetTitle>Main Navigation Menu</SheetTitle>
        </VisuallyHidden>
        {children}
      </SheetContent>
    </Sheet>
  );
}
