"use client";

import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const paymentSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name must be less than 50 characters"),
  cardNumber: z
    .string()
    .min(13, "Card number must be at least 13 digits")
    .max(19, "Card number must be less than 19 digits")
    .regex(/^[0-9\s]+$/, "Card number must contain only numbers and spaces"),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry must be in MM/YY format")
    .refine((val) => {
      const [month, year] = val.split("/");
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      const expYear = Number.parseInt(year);
      const expMonth = Number.parseInt(month);

      if (expYear > currentYear) return true;
      if (expYear === currentYear && expMonth >= currentMonth) return true;
      return false;
    }, "Card has expired"),
  cvc: z
    .string()
    .min(3, "CVC must be at least 3 digits")
    .max(4, "CVC must be at most 4 digits")
    .regex(/^[0-9]+$/, "CVC must contain only numbers"),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit?: (data: PaymentFormData) => Promise<void>;
  onCancel?: () => void;
}

export function PaymentForm({ onSubmit, onCancel }: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    mode: "onChange",
  });

  const handleFormSubmit = async (data: PaymentFormData) => {
    if (onSubmit) {
      await onSubmit(data);
    } else {
      // Default behavior
      console.log("Payment data:", data);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      alert("Payment processed successfully!");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      console.log("Payment cancelled");
    }
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(" ");
    } else {
      return v;
    }
  };

  // Format expiry with slash
  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, "");
    if (v.length >= 2) {
      return `${v.slice(0, 2)}/${v.slice(2, 4)}`;
    }
    return v;
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className='space-y-6'>
      <div className='custom-dashed p-4 pt-2 bg-grey space-y-4'>
        {/* Payment Method */}
        <div className='px-0 py-2 flex items-center justify-between border-b'>
          <span className='text-gray-900'>CMI</span>
          <div className='flex space-x-2'>
            <div className='bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold'>VISA</div>
            <div className='w-8 h-5 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full flex items-center justify-center'>
              <div className='w-3 h-3 bg-red-500 rounded-full'></div>
              <div className='w-3 h-3 bg-yellow-400 rounded-full -ml-1'></div>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div className='space-y-1'>
          <Label htmlFor='name' className='text-sm font-semibold text-gray-900'>
            Full name
          </Label>
          <Input
            id='name'
            placeholder='Name on card'
            className={`h-9 bg-white text-gray-900 placeholder:text-gray-400 ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
            {...register("name")}
          />
          {errors.name && <p className='text-sm text-red-600'>{errors.name.message}</p>}
        </div>

        {/* Card Number */}
        <div className='space-y-1'>
          <Label htmlFor='cardNumber' className='text-sm font-semibold text-gray-900'>
            Card number
          </Label>
          <div className='relative'>
            <Input
              id='cardNumber'
              placeholder='1234 1234 1234 1234'
              className={`h-9 bg-white text-gray-900 placeholder:text-gray-400 pr-20 ${errors.cardNumber ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("cardNumber", {
                onChange: (e) => {
                  e.target.value = formatCardNumber(e.target.value);
                },
              })}
              maxLength={19}
            />
            <div className='absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1'>
              <div className='bg-blue-600 text-white px-1.5 py-0.5 rounded text-xs font-bold'>VISA</div>
              <div className='w-6 h-4 bg-gradient-to-r from-red-500 to-yellow-400 rounded-full flex items-center justify-center'>
                <div className='w-2 h-2 bg-red-500 rounded-full'></div>
                <div className='w-2 h-2 bg-yellow-400 rounded-full -ml-0.5'></div>
              </div>
            </div>
          </div>
          {errors.cardNumber && <p className='text-sm text-red-600'>{errors.cardNumber.message}</p>}
        </div>

        {/* Expiry and CVC */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='space-y-1'>
            <Label htmlFor='expiry' className='text-sm font-semibold text-gray-900'>
              Expiry
            </Label>
            <Input
              id='expiry'
              placeholder='MM/YY'
              className={`h-9 bg-white text-gray-900 placeholder:text-gray-400 ${errors.expiry ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("expiry", {
                onChange: (e) => {
                  e.target.value = formatExpiry(e.target.value);
                },
              })}
              maxLength={5}
            />
            {errors.expiry && <p className='text-sm text-red-600'>{errors.expiry.message}</p>}
          </div>
          <div className='space-y-1'>
            <Label htmlFor='cvc' className='text-sm font-semibold text-gray-900'>
              CVC
            </Label>
            <Input
              id='cvc'
              placeholder='CVC'
              className={`h-9 bg-white text-gray-900 placeholder:text-gray-400 ${errors.cvc ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("cvc")}
              maxLength={4}
            />
            {errors.cvc && <p className='text-sm text-red-600'>{errors.cvc.message}</p>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='space-y-4 pt-6'>
        <Button type='submit' disabled={isSubmitting} className='w-full bg-blue hover:bg-blue/90 rounded-full py-5 cursor-pointer text-white disabled:opacity-50'>
          <CreditCard className='w-5 h-5 mr-2' />
          {isSubmitting ? "Processing..." : "Buy now"}
        </Button>
        <div className='text-center'>
          <Button type='button' variant='link' className='text-gray-600 hover:text-gray-900 p-0 h-auto' onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
