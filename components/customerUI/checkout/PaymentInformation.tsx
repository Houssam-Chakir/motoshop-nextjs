"use client";

import { PaymentForm } from "./PaymentForm";

export function PaymentInformation({ children }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePaymentSubmit = async (data: any) => {
    console.log("Processing payment:", data);
    // Add your payment processing logic here
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert("Payment processed successfully!");
  };

  const handlePaymentCancel = () => {
    console.log("Payment cancelled");
    // Add your cancel logic here
  };

  return (
    <div className='space-y-6 w-full md:border-r'>
      {children}
      <div className="md:pr-6">
        <h2 className='text-xl font-semibold mb-6 text-gray-900'>Payment information:</h2>
        <PaymentForm onSubmit={handlePaymentSubmit} onCancel={handlePaymentCancel} />
      </div>
    </div>
  );
}
