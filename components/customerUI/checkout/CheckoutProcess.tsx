// components/customerUI/navbar/CartSlider.tsx
"use client";

import OrderItemsSection from "./OrderItemsSection";
import { usePathname } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import StepperCheckout from "./StepperCheckout";
import DeliveryInformationForm from "./DeliveryInformationForm";
import { useState, useEffect } from "react";
import { PaymentInformation } from "./PaymentInformation";
import { OrderItemsFinalList } from "./OrderItemsFinalList";

interface ICardInfo {
  name: string | null;
  cardNumber: string | null;
  expiry: string | null;
  cvc: string | null;
}

export interface CheckoutDataType {
  number: string | null;
  address: string | null;
  city: string | null;
  email: string | null;
  fullName: string | null;
  shippingFee?: number;
  paymentMethod: "cmi" | "delivery" | "pickup" | null;
  extraDirections?: string | null;
  saveAddress?: boolean | null;
  cardInfo: ICardInfo;
}

export default function CheckoutProcess() {
  // const pathname = usePathname();
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [checkoutData, setCheckoutData] = useState<CheckoutDataType>({
    address: null,
    city: null,
    email: null,
    extraDirections: null,
    fullName: null,
    number: null,
    paymentMethod: null,
    saveAddress: false,
    shippingFee: 10,
    cardInfo: {
      name: null,
      cardNumber: null,
      expiry: null,
      cvc: null,
    },
  });

  function getShippingFeeByCity(city: string | null): number {
    if (!city) return 0;
    switch (city.trim().toLowerCase()) {
      case "casablanca":
        return 20;
      case "rabat":
        return 30;
      case "marrakech":
        return 40;
      case "fes":
        return 50;
      case "tangier":
        return 55;
      case "agadir":
        return 45;
      default:
        return 22;
    }
  }

  function handleConfirmOrder(isPaymentCardValid) {
    // Check if checkout data is present
    // Check payment method
      // Check if payment card is valid
    // Create order
    // Redirect to order status page with order status

  }

  // Efficiently update shippingFee when city changes
  useEffect(() => {
    setCheckoutData((prev) => ({
      ...prev,
      shippingFee: getShippingFeeByCity(prev.city),
    }));
  }, [checkoutData.city]);

  const [finalCart, setFinalCart] = useState(null);
  console.log("finalCart: ", finalCart);
  console.log("checkoutData: ", checkoutData);

  return (
    <main className='py-2 flex flex-col md:flex-row justify-between'>
      {/* <Breadcrumbs path={pathname} /> */}
      {checkoutStep === 1 && (
        // First step: Delivery Information and Cart adjustment
        <>
          <DeliveryInformationForm setCheckoutStep={setCheckoutStep} setCheckoutData={setCheckoutData} checkoutData={checkoutData}>
            <StepperCheckout checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} />
          </DeliveryInformationForm>
          <OrderItemsSection shippingFee={checkoutData.shippingFee} setFinalCart={setFinalCart} />
        </>
      )}
      {checkoutStep === 2 && (
        <>
          <PaymentInformation paymentMethod={checkoutData.paymentMethod}>
            <StepperCheckout checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} />
          </PaymentInformation>
          <OrderItemsFinalList finalCart={finalCart} shippingFee={checkoutData.shippingFee} checkoutData={checkoutData} />
        </>
      )}
    </main>
  );
}
