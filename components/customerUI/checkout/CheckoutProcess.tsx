// components/customerUI/navbar/CartSlider.tsx
"use client";

import OrderItemsSection from "./OrderItemsSection";
import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import StepperCheckout from "./StepperCheckout";

export default function CheckoutProcess() {
  const pathname = usePathname();

  return (
    <main className='py-4'>
      <Breadcrumbs path={pathname} />
      <div className="max-w-1/2">
        <StepperCheckout />
        <OrderItemsSection />
      </div>
    </main>
  );
}
