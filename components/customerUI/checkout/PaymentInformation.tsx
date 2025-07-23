"use client";

import { redirect } from "next/navigation";
import { PaymentForm } from "./PaymentForm";
import { BadgeAlert, CreditCard, MapPin, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PaymentInformation({ children, paymentMethod, handleCreateOrder, checkoutData }) {
  console.log("paymentMethod: ", paymentMethod);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePaymentSubmit = async (data: any) => {
    console.log("Processing payment:", data);
    console.log('checkout data: ', checkoutData)
    // Add your payment processing logic here
    await handleCreateOrder(data)

  };

  const handlePaymentCancel = () => {
    console.log("Payment cancelled");
    redirect("/");
  };

  return (
    <div className='space-y-6 w-full md:border-r'>
      {children}
      <div className='md:pr-6'>
        <h2 className='text-xl font-semibold mb-6 text-gray-900'>Payment information:</h2>
        {paymentMethod === "cmi" && <PaymentForm onSubmit={handlePaymentSubmit} onCancel={handlePaymentCancel} />}
        {paymentMethod === "delivery" && (
          <DashedContainer>
            <h2 className='flex gap-2 items-center font-medium text-slate-900'>
              <Receipt />
              Pay on delivery
            </h2>
            <p className='text-sm text-slate-700'>You will be paying the delivery guy the total amount specified in your reciept after confirming your order</p>
            <p className='text-sm text-slate-700'>
              <span>
                <BadgeAlert className='inline mb-0.5 mr-1' size={14} />
                Please make sure to have the amount of money in cash and ready once the package is close to be recieved
              </span>
            </p>
          </DashedContainer>
        )}
        {paymentMethod === "pickup" && (
          <DashedContainer>
            <h2 className='flex gap-2 items-center font-medium text-slate-900'>
              <MapPin />
              Pickup from store
            </h2>
            <p className='text-sm text-slate-700'>Your order items will be reserved for 3 days after order confirmation. We will contact you before canceling your order.</p>
            <p className='text-sm text-slate-700'>
              <span>
                <BadgeAlert className='inline mb-0.5 mr-1' size={14} />
                Please make sure you are able to do a pickup in the next 3 days before placing your order. Thank you.
              </span>
            </p>
          </DashedContainer>
        )}
      </div>
    </div>
  );
}

function DashedContainer({ children }) {
  return <div className='custom-dashed p-4 bg-grey space-y-4'>{children}</div>;
}

function CheckoutButtons() {
  return (
    <>
      {/* Action Buttons */}
      <div className='space-y-4 pt-6'>
        <Button disabled={isSubmitting} className='w-full bg-blue hover:bg-blue/90 rounded-full py-5 cursor-pointer text-white disabled:opacity-50'>
          <CreditCard className='w-5 h-5 mr-2' />
          {isSubmitting ? "Processing..." : "Buy now"}
        </Button>
        <div className='text-center'>
          <Button type='button' variant='link' className='text-gray-600 hover:text-gray-900 p-0 h-auto' onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </>
  );
}
