"use client";

import { useState } from "react";
import { Check, Package, CreditCard, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  {
    id: 1,
    title: "Delivery info",
    icon: Package,
  },
  {
    id: 2,
    title: "Payment",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "Confirmation",
    icon: CheckCircle,
  },
];

interface StepperCheckoutProps {
  checkoutStep: number;
  setCheckoutStep: (step: number) => void;
}

export default function StepperCheckout({ checkoutStep, setCheckoutStep }: StepperCheckoutProps) {
  console.log('checkoutStep: ', checkoutStep)
  const getStepState = (stepId: number) => {
    if (stepId < checkoutStep) return "completed";
    if (stepId === checkoutStep) return "active";
    return "inactive";
  };

  const getStepIcon = (step: (typeof steps)[0], state: string) => {
    if (state === "completed") {
      return <Check className='w-4 h-4 text-white' />;
    }

    const IconComponent = step.icon;
    return <IconComponent className={cn("w-4 h-4", state === "active" ? "text-white" : "text-gray-400")} />;
  };

  const handleStepClick = (stepId: number) => {
    // if(checkoutStep < stepId) return
    setCheckoutStep(stepId);
  };

  return (
    <div className='w-full p-4 border-b mb-6'>
      <div className='flex items-center justify-between'>
        {steps.map((step, index) => {
          const state = getStepState(step.id);

          return (
            <>
              <div key={step.id} className='flex flex-col items-center w-full'>
                {/* Step circle */}
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
                    state === "completed" && "bg-green-500 focus:ring-green-500",
                    state === "active" && "bg-blue-900 focus:ring-blue-900",
                    state === "inactive" && "bg-gray-200 focus:ring-gray-300"
                  )}
                >
                  {getStepIcon(step, state)}
                </button>

                {/* Step title */}
                <span className={cn("text-nowrap mt-3 text-sm font-medium transition-colors", state === "active" ? "text-gray-900" : "text-gray-500")}>{step.title}</span>
              </div>
              {/* Connecting line */}
              {index < steps.length - 1 && <div className={cn("w-[100%] h-0.5 -translate-y-4 z-0", state === "completed" ? "bg-green-500" : "bg-gray-200")} />}
            </>
          );
        })}
      </div>

      {/* Step content area */}
      {/* <div className='mt-8 p-6 bg-gray-50 rounded-lg'>

        <div className='flex justify-between mt-6'>
          <button
            onClick={() => setCheckoutStep(Math.max(1, checkoutStep - 1))}
            disabled={checkoutStep === 1}
            className='px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Previous
          </button>
          <button
            onClick={() => setCheckoutStep(Math.min(4, checkoutStep + 1))}
            disabled={checkoutStep === 4}
            className='px-4 py-2 text-sm font-medium text-white bg-blue-900 rounded-md hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {checkoutStep === 4 ? "Complete" : "Next"}
          </button>
        </div>
      </div> */}
    </div>
  );
}
