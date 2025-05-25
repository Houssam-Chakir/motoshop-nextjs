"use client"

import type * as React from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface MobileSliderProps {
  trigger: React.ReactNode
  children: React.ReactNode
  side?: "left" | "right" | "top" | "bottom"
  className?: string
}

export function MobileSlider({ trigger, children, side = "left", className = "w-[320px] p-0" }: MobileSliderProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side={side} className={className}>
        {children}
      </SheetContent>
    </Sheet>
  )
}
