import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

export function OrderItemsFinalList({ finalCart, shippingFee, checkoutData }) {
  const orderTotal = finalCart.totalPrice + shippingFee;

  const customerInfo = [
    { label: "Full name:", value: checkoutData.fullName },
    { label: "Number:", value: checkoutData.number },
    { label: "Email:", value: checkoutData.email },
    { label: "City:", value: checkoutData.city },
    { label: "Address:", value: checkoutData.address },
    { label: "Extra:", value: checkoutData.extraDirections },
  ];

  return (
    <div className='w-full p-6'>
      <h2 className='pb-4'>
        <CardTitle className='text-xl font-semibold text-gray-900'>Order information</CardTitle>
      </h2>
      <CardContent className='custom-dashed p-4 pt-2 bg-grey space-y-4'>
        {/* Items Section */}
        <div>
          <h3 className='font-bold text-gray-900 mb-4'>Items</h3>
          <div className='space-y-3'>
            {finalCart.cartItems.map((item, index) => (
              <div key={index} className='flex justify-between items-start'>
                <span className='text-sm text-gray-700 flex-1'>
                  {item.quantity} {item.title}
                </span>
                <span className='font-bold text-gray-900 ml-4 text-right'>{item.totalPrice} DH</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Summary */}
        <div className='space-y-3 pt-4 border-t border-gray-200'>
          <div className='flex justify-between'>
            <span className='text-gray-700'>Sub-total:</span>
            <span className='font-bold text-gray-900'>{finalCart.totalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-700'>Sales:</span>
            <span className='font-bold text-green-600'>-{finalCart.totalDiscount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-700'>Shipping:</span>
            <span className='font-bold text-green-600'>{shippingFee > 0 ? "+" + shippingFee + " DH" : "Free"}</span>
          </div>

          <div className='border-t border-gray-200 pt-3'>
            <div className='flex justify-between text-lg'>
              <span className='font-bold text-gray-900'>Total:</span>
              <span className='font-bold text-blue'>{orderTotal.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DH</span>
            </div>
          </div>
        </div>
      </CardContent>
      {/* Customer Information */}
      <Table className='space-y-4 pt-6 border mt-6 border-gray-200'>
        <TableBody>
          {customerInfo.map((info, index) => (
            <TableRow key={index} className="*:border-border hover:bg-transparent [&>:not(:last-child)]:border-r">
              <TableCell className="bg-grey/50 py-2 font-medium text-nowrap">{info.label}</TableCell>
              <TableCell className='py-2 w-full'>{info.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
