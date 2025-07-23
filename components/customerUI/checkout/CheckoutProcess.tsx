"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/orderActions";
import OrderItemsSection from "./OrderItemsSection";
import StepperCheckout from "./StepperCheckout";
import DeliveryInformationForm from "./DeliveryInformationForm";
import { PaymentInformation } from "./PaymentInformation";
import { OrderItemsFinalList } from "./OrderItemsFinalList";
import { useUserContext } from "@/contexts/UserContext";

interface CartItem {
  productId: string;
  size: string;
  quantity: number;
  price: number;
}

// Correctly define the structure of the finalCart object
interface FinalCart {
  cartItems: CartItem[];
  totalDiscount: number;
  totalPrice: number;
}

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
  const [checkoutStep, setCheckoutStep] = useState(1);
  // Initialize finalCart with the correct object structure
  const [finalCart, setFinalCart] = useState<FinalCart>({ cartItems: [], totalDiscount: 0, totalPrice: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const {profile} = useUserContext()
  const router = useRouter();

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

  async function handleCreateOrder(cardInfo) {
    if (isSubmitting) return;

    // 1. Validate user and cart
    if (!profile?.id) {
      alert("You must be logged in to place an order.");
      return;
    }
    // Correctly check the cartItems array inside the finalCart object
    if (finalCart.cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    // 2. Validate delivery and payment info
    const { address, city, email, fullName, number, paymentMethod, shippingFee, extraDirections } = checkoutData;
    if (!address || !city || !email || !fullName || !number) {
      alert("Please fill in all required delivery information.");
      return;
    }
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (paymentMethod === "cmi") {
      if (!cardInfo.name || !cardInfo.cardNumber || !cardInfo.expiry || !cardInfo.cvc) {
        alert("Please fill in all valid card details.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // 3. Structure the data for the server action
      // Correctly map over finalCart.cartItems
      const productsForOrder = finalCart.cartItems.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }));

      // Correctly calculate total quantity from finalCart.cartItems
      const totalQuantity = finalCart.cartItems.reduce((acc, item) => acc + item.quantity, 0);

      // Use the pre-calculated subtotal from finalCart.totalPrice
      const orderSubtotal = finalCart.totalPrice;
      const finalTotalPrice = orderSubtotal + (shippingFee || 0);

      const orderData = {
        userId: profile.id,
        products: productsForOrder,
        quantity: totalQuantity,
        deliveryFee: shippingFee || 0,
        orderTotalPrice: finalTotalPrice, // This is the value the server will validate against
        paymentMethod: paymentMethod,
        deliveryInformation: {
          fullName: fullName,
          phoneNumber: number,
          email: email,
          city: city,
          address: address,
          zipcode: 0, // FIXME: Zipcode is missing from the form. Add it to CheckoutDataType and the form.
          extraDirections: extraDirections || "",
        },
      };

      // 4. Call the server action
      const result = await createOrder(orderData);

      // 5. Handle the result
      if (result.status === "success") {
        alert("Order placed successfully! Redirecting...");
        // TODO: Clear the cart from local storage or state management
        router.push(`/order-status/${result.order.trackingNumber}`);
      } else {
        alert(`Order creation failed: ${result.message}`);
      }
    } catch (error) {
      console.error("An unexpected error occurred during order creation:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Efficiently update shippingFee when city changes
  useEffect(() => {
    setCheckoutData((prev) => ({
      ...prev,
      shippingFee: getShippingFeeByCity(prev.city),
    }));
  }, [checkoutData.city]);

  return (
    <main className='py-2 flex flex-col md:flex-row justify-between'>
      {checkoutStep === 1 && (
        <>
          <DeliveryInformationForm setCheckoutStep={setCheckoutStep} setCheckoutData={setCheckoutData} checkoutData={checkoutData}>
            <StepperCheckout checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} />
          </DeliveryInformationForm>
          <OrderItemsSection shippingFee={checkoutData.shippingFee} setFinalCart={setFinalCart} />
        </>
      )}
      {checkoutStep === 2 && (
        <>
          <PaymentInformation paymentMethod={checkoutData.paymentMethod} handleCreateOrder={handleCreateOrder} isSubmitting={isSubmitting} checkoutData={checkoutData}>
            <StepperCheckout checkoutStep={checkoutStep} setCheckoutStep={setCheckoutStep} />
          </PaymentInformation>
          <OrderItemsFinalList finalCart={finalCart} shippingFee={checkoutData.shippingFee} checkoutData={checkoutData} />
        </>
      )}
    </main>
  );
}
