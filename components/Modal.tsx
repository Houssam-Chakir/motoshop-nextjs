// components/Modal.tsx
"use client";

import { useEffect, useState, ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); // Only mount on the client
    // Add/remove class to body to prevent scrolling when modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className='fixed inset-0 z-40 bg-black/60'
        aria-hidden='true'
      />

      {/* Modal Content */}
      <div
        onClick={(e) => e.stopPropagation()} // Prevent click-through
        className='fixed top-1/2 left-1/2 w-[80vw] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xs shadow-xl z-50'
        role='dialog'
        aria-modal='true'
        aria-labelledby='modal-title'
      >
        <div className='flex justify-between items-center mb-4'>
          {title && (
            <h2 id='modal-title' className='text-md text-grey-darker'>
              {title}
            </h2>
          )}
          <button onClick={onClose} className='p-1 rounded-full hover:bg-gray-200' aria-label='Close modal'>
            <X size={24} />
          </button>
        </div>
        {children}
      </div>
    </>,
    document.getElementById("modal-root") as HTMLElement
  );
};
