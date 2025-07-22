import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function OrderItemsFinalList({finalCart, shippingFee}) {

  const orderTotal = finalCart.totalPrice + shippingFee

  const customerInfo = [
    { label: "Full name:", value: "Houssam Chakir" },
    { label: "Number:", value: "0689752148" },
    { label: "Email:", value: "houssamchakir@gmail.com" },
    { label: "City:", value: "Casablanca" },
    { label: "Address:", value: "Maarif, zerktouni, Res Fish, Imm17, App42" },
    { label: "Extra:", value: "The red building" },
  ];

  return (
    <div className='w-full p-6'>
      <CardHeader className='pb-4'>
        <CardTitle className='text-xl font-semibold mb-6 text-gray-900'>Order information</CardTitle>
      </CardHeader>
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
            <span className='font-bold text-green-600'>{shippingFee > 0 ? '+' + shippingFee + ' DH' : 'Free'}</span>
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
        <div className='space-y-4 pt-6 border-t border-gray-200'>
          {customerInfo.map((info, index) => (
            <div key={index} className='flex'>
              <span className='text-gray-700 font-medium w-20 flex-shrink-0'>{info.label}</span>
              <span className='text-gray-900 ml-4'>{info.value}</span>
            </div>
          ))}
        </div>
    </div>
  );
}
