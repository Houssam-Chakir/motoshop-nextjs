// components/customerUI/navbar/CartSlider.tsx
"use client";

import OrderItemsSection from "./OrderItemsSection";
import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import StepperCheckout from "./StepperCheckout";
import DeliveryInformationForm from "./DeliveryInformationForm";
import { useState } from "react";

export default function CheckoutProcess() {
  // const pathname = usePathname();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    address: null,
    city: null,
    email: null,
    extraDirections: null,
    fullName: null,
    number: null,
    paymentMethod: null,
    saveAddress: false,
    cardInfo: {
      name: null,
      cardNumber: null,
      expiry: null,
      cvc: null,
    },
  });

  return (
    <main className='py-2 flex flex-col md:flex-row justify-between'>
      {/* <Breadcrumbs path={pathname} /> */}
      {checkoutStep === 1 && (
        <>
          <DeliveryInformationForm setCheckoutData={setCheckoutData}>
            <StepperCheckout checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} />
          </DeliveryInformationForm>
          <OrderItemsSection />
        </>
      )}
    </main>
  );
}

{
  /* <div className='flex flex-col gap-2'>
  <span className='text-xs text-grey-darker italic'>Shipping fee varies by address.</span>
  <Button onClick={handleCheckout} className='w-full bg-blue hover:bg-blue/90 rounded-full py-5 cursor-pointer text-white'>
    Proceed to Checkout
  </Button>
</div>; */
}
