import { Suspense } from "react";
import CheckoutProcess from "@/components/customerUI/checkout/CheckoutProcess";

function CheckoutPage() {
  return (
    <section>
      <Suspense fallback={<div>Loading checkout...</div>}>
        <CheckoutProcess />
      </Suspense>
    </section>
  );
}

export default CheckoutPage;
