"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, PackageCheck, Timer, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReactNode } from "react";
import { CheckoutDataType } from "./CheckoutProcess";

// Zod schema for form validation
const deliveryFormSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(50, "Full name must be less than 50 characters"),
  number: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email("Please enter a valid email address"),
  city: z.string().min(1, "Please select a city"),
  address: z.string().min(5, "Address must be at least 5 characters").max(200, "Address must be less than 200 characters"),
  extraDirections: z.string().max(500, "Extra directions must be less than 500 characters").optional(),
  saveAddress: z.boolean().optional(),
  paymentMethod: z.enum(["cmi", "delivery", "pickup"], {
    required_error: "Please select a payment method",
  }),
});

type DeliveryFormData = z.infer<typeof deliveryFormSchema>;

interface DeliveryInformationType {
  children?: ReactNode;
  setCheckoutData: (updater: (prev: CheckoutDataType) => CheckoutDataType) => void;
}

export default function DeliveryInformationForm({ children, setCheckoutData }: DeliveryInformationType) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<DeliveryFormData>({
    resolver: zodResolver(deliveryFormSchema),
    defaultValues: {
      paymentMethod: "cmi",
      saveAddress: false,
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const selectedPayment = watch("paymentMethod");

  const onSubmit = async (data: DeliveryFormData) => {
    setIsSubmitting(true);
    try {
      setCheckoutData((prev) => ({
        ...prev,
        address: data.address,
        city: data.city,
        email: data.email,
        extraDirections: data.extraDirections,
        fullName: data.fullName,
        number: data.number,
        paymentMethod: data.paymentMethod,
        saveAddress: data.saveAddress,
      }));
      // Handle successful submission
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='border-r w-full'>
      {children}
      <div className='mx-auto bg-white px-6'>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Delivery Information Section */}
          <div className='mb-8'>
            <h2 className='text-xl font-semibold mb-6 text-gray-900'>Delivery information:</h2>

            <div className='space-y-4'>
              <div>
                <Label htmlFor='fullName' className='text-sm font-medium text-gray-900 mb-2 block'>
                  Full name
                </Label>
                <Input
                  id='fullName'
                  {...register("fullName")}
                  placeholder='Ex: Houssam Chakir'
                  className={`w-full h-12 px-4 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 ${errors.fullName ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.fullName && <p className='text-red-500 text-sm mt-1'>{errors.fullName.message}</p>}
              </div>

              <div>
                <Label htmlFor='number' className='text-sm font-medium text-gray-900 mb-2 block'>
                  number
                </Label>
                <Input
                  id='number'
                  {...register("number")}
                  placeholder='Ex: 0685245987'
                  className={`w-full h-12 px-4 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 ${errors.number ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.number && <p className='text-red-500 text-sm mt-1'>{errors.number.message}</p>}
              </div>

              <div>
                <Label htmlFor='email' className='text-sm font-medium text-gray-900 mb-2 block'>
                  Email
                </Label>
                <Input
                  id='email'
                  type='email'
                  {...register("email")}
                  placeholder='Ex: houssamchakir@gmail.com'
                  className={`w-full h-12 px-4 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 ${errors.email ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor='city' className='text-sm font-medium text-gray-900 mb-2 block'>
                  City
                </Label>
                <Controller
                  name='city'
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className={`w-full h-12 px-4 border rounded-lg bg-white text-gray-900 ${errors.city ? "border-red-500" : "border-gray-300"}`}>
                        <SelectValue placeholder='Select an option' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='casablanca'>Casablanca</SelectItem>
                        <SelectItem value='rabat'>Rabat</SelectItem>
                        <SelectItem value='marrakech'>Marrakech</SelectItem>
                        <SelectItem value='fes'>Fes</SelectItem>
                        <SelectItem value='tangier'>Tangier</SelectItem>
                        <SelectItem value='agadir'>Agadir</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.city && <p className='text-red-500 text-sm mt-1'>{errors.city.message}</p>}
              </div>

              <div>
                <Label htmlFor='address' className='text-sm font-medium text-gray-900 mb-2 block'>
                  Address
                </Label>
                <Input
                  id='address'
                  {...register("address")}
                  placeholder='Ex: Casablanca, Maarif, Twin center'
                  className={`w-full h-12 px-4 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 ${errors.address ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.address && <p className='text-red-500 text-sm mt-1'>{errors.address.message}</p>}
              </div>

              <div>
                <Label htmlFor='extraDirections' className='text-sm font-medium text-gray-900 mb-2 block'>
                  Extra directions
                </Label>
                <Textarea
                  id='extraDirections'
                  {...register("extraDirections")}
                  placeholder='Ex: The tower on the left if facing it from gas station'
                  className={`w-full min-h-[48px] px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder:text-gray-400 resize-none ${
                    errors.extraDirections ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={2}
                />
                {errors.extraDirections && <p className='text-red-500 text-sm mt-1'>{errors.extraDirections.message}</p>}
              </div>

              <div className='flex items-center space-x-2 mt-4'>
                <Controller
                  name='saveAddress'
                  control={control}
                  render={({ field }) => <Checkbox id='saveAddress' checked={field.value} onCheckedChange={field.onChange} className='border-gray-300' />}
                />
                <Label htmlFor='saveAddress' className='text-sm text-gray-700'>
                  Save address information to your account
                </Label>
              </div>
            </div>
          </div>

          {/* Payment Method Section */}
          <div className='mb-8'>
            <h2 className='text-xl font-semibold mb-2 text-gray-900'>Payment method</h2>
            <p className='text-sm text-gray-600 mb-6'>You will not be charged until you confirm your order on the next page</p>

            <div className='custom-dashed rounded-lg p-4 bg-gray-50'>
              <Controller
                name='paymentMethod'
                control={control}
                render={({ field }) => (
                  <div className='space-y-3'>
                    <div
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${field.value === "cmi" ? "bg-white shadow-sm" : "hover:bg-gray-100"}`}
                      onClick={() => field.onChange("cmi")}
                    >
                      <div className='flex items-center space-x-3'>
                        <div className={`w-4 h-4 rounded-full border-2 ${field.value === "cmi" ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                          {field.value === "cmi" && <div className='w-2 h-2 bg-white rounded-full mx-auto mt-0.5'></div>}
                        </div>
                        <span className='font-medium text-gray-900'>CMI</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <div className='w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold'>VISA</div>
                        <div className='w-8 h-5 bg-red-500 rounded text-white text-xs flex items-center justify-center font-bold'>MC</div>
                      </div>
                    </div>

                    <div
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${field.value === "delivery" ? "bg-white shadow-sm" : "hover:bg-gray-100"}`}
                      onClick={() => field.onChange("delivery")}
                    >
                      <div className='flex items-center space-x-3'>
                        <div className={`w-4 h-4 rounded-full border-2 ${field.value === "delivery" ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                          {field.value === "delivery" && <div className='w-2 h-2 bg-white rounded-full mx-auto mt-0.5'></div>}
                        </div>
                        <span className='font-medium text-gray-900'>Pay on Delivery</span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center p-3 rounded-lg cursor-pointer ${field.value === "pickup" ? "bg-white shadow-sm" : "hover:bg-gray-100"}`}
                      onClick={() => field.onChange("pickup")}
                    >
                      <div className='flex items-center space-x-3'>
                        <div className={`w-4 h-4 rounded-full border-2 ${field.value === "pickup" ? "border-blue-600 bg-blue-600" : "border-gray-300"}`}>
                          {field.value === "pickup" && <div className='w-2 h-2 bg-white rounded-full mx-auto mt-0.5'></div>}
                        </div>
                        <span className='font-medium text-gray-900'>Pick up from store</span>
                      </div>
                    </div>
                  </div>
                )}
              />
            </div>
            {errors.paymentMethod && <p className='text-red-500 text-sm mt-2'>{errors.paymentMethod.message}</p>}
          </div>

          {/* Benefits Section */}
          <div className='flex flex-col gap-2 pb-6'>
            <p className='flex items-center gap-2 text-xs text-slate-900'>
              <PackageCheck size={16} className='text-success-green' /> <span className='font-bold'>Free shipping</span> for orders total over 500DH
            </p>
            <p className='flex items-center gap-2 text-xs text-slate-900'>
              <Timer size={16} className='text-success-green' /> <span className='font-bold'>Fast shipping</span> across Morocco
            </p>
            <p className='flex items-center gap-2 text-xs text-slate-900'>
              <RefreshCcw size={16} className='text-success-green' /> <span className='font-bold'>Product returns</span> after delivery
            </p>
          </div>

          {/* Action Buttons */}
          <div className='space-y-2 pb-6'>
            <Button type='submit' disabled={isSubmitting} className='w-full bg-blue hover:bg-blue/90 rounded-full py-5 cursor-pointer text-white disabled:opacity-50'>
              <span>{isSubmitting ? "Processing..." : "Go to Payment"}</span>
              {!isSubmitting && <ArrowRight className='w-5 h-5' />}
            </Button>
            <div className='text-center'>
              <button type='button' className='text-grey-darker underline hover:text-blue-800 text-sm font-medium'>
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
