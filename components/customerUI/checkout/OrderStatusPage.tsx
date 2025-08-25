"use client";

import { CheckCircle, MailCheck, Receipt, XCircle } from "lucide-react";

const paymentMethodMap = {
  cmi: "CMI",
  delivery: "Pay on delivery",
  pickup: "Pickup from store",
} as const;
type PaymentMethod = keyof typeof paymentMethodMap;
type CheckoutData = { paymentMethod: "cmi" | "delivery" | "pickup" | null };
type OrderStatus = { status: string; order?: { trackingNumber?: string } };

export function OrderStatusSection({ children, checkoutData, orderStatus }: { children: React.ReactNode; checkoutData: CheckoutData; orderStatus: OrderStatus }) {
  console.log("checkoutData: ", checkoutData);
  const deliveryMethod = paymentMethodMap[checkoutData.paymentMethod as PaymentMethod] || "";

  const isSuccess = orderStatus.status === "success";

  const defaultTitle = isSuccess ? "Order Confirmed!" : "Order Failed!";
  const defaultSubtitle = isSuccess ? "" : "Please try again or contact customer support.";

  return (
    <div className='space-y-6 w-full md:border-r'>
      {children}
      <div className='md:pr-6'>
        <div className='mb-6'>
          <section className={`p-6 mb-2 ${isSuccess ? "bg-green-600" : "bg-red-600"}`}>
            <div className={`items-center justify-center gap-2 text-center text-white `}>
              <h2 className='flex gap-2 w-fit mx-auto font-bold text-2xl mb-1.5'>
                <span className='mt-1'>{isSuccess ? <CheckCircle size={24} /> : <XCircle size={24} />}</span> {defaultTitle}
              </h2>
              {orderStatus.status === "success" && (
                <p className='text-sm font-light opacity-90'>
                  Tracking Number: <span className='font-medium'>{orderStatus.order?.trackingNumber}</span>
                </p>
              )}
            </div>
            <div className='p-2'>
              <p className='text-sm text-white text-center'>{defaultSubtitle}</p>
            </div>
          </section>
          {orderStatus.status === "success" && (
            <p className='flex text-sm font-light gap-2'>
              <MailCheck size={18} /> Check your email for order information and tracking.
            </p>
          )}
        </div>

        <h2 className='text-xl font-semibold mb-4 text-gray-900'>Payment information:</h2>
        <DashedContainer>
          <h2 className='flex gap-2 items-center font-medium text-slate-900 border-b pb-4 border-grey-dark/50'>
            <Receipt />
            {deliveryMethod}
          </h2>
          <p className={`font-semibold text-xl ${checkoutData.paymentMethod === "cmi" ? "text-success-green" : "text-orange-400"}`}>
            Payment {checkoutData.paymentMethod === "cmi" ? "successful" : "pending"}
          </p>
        </DashedContainer>
        {/* <CheckoutButtons handleOrderSubmit={handleOrderSubmit} isSubmitting={isSubmitting} handleCancel={handlePaymentCancel} /> */}
      </div>
    </div>
  );
}

function DashedContainer({ children }: { children: React.ReactNode }) {
  return <div className='custom-dashed p-4 bg-grey space-y-4'>{children}</div>;
}
