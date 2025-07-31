import CheckoutProcess from "@/components/customerUI/checkout/CheckoutProcess";
import { getSession } from "@/utils/getSessionUser";

function CheckoutPage() {

  return (
    <section>
      <CheckoutProcess />
    </section>
  );
}

export default CheckoutPage;
