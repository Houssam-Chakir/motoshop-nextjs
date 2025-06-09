import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ModalContainerProps {
  children: React.ReactNode;
  title: string;
}

export default function ModalContainer({ children, title }: ModalContainerProps) {
  return (
    <div className='p-4 mx-auto max-w-7xl bg-white'>
      {/* Header */}
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-lg text-gray-600'>{title}</h2>
        <Button variant='ghost' size='icon'>
          <X className='w-5 h-5' />
        </Button>
      </div>
      {children}
    </div>
  );
}
