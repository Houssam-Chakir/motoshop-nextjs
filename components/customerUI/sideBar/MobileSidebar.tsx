"use client";

import type * as React from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // Adjust the import path if necessary

interface MobileSliderProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
}

export function MobileSlider({ trigger, children, side = "left", className = "w-[320px] p-0" }: MobileSliderProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className={className}>
        <VisuallyHidden asChild>
          <SheetTitle>Main Navigation Menu</SheetTitle>
        </VisuallyHidden>
        {children}
      </SheetContent>
    </Sheet>
  );
}
