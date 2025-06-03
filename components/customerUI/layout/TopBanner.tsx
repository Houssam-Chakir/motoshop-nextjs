import Container from "@/components/layout/Container";
import { Mail, PhoneCall } from "lucide-react";

export default function TopBanner() {
  return (
    <div className='bg-black w-full h-[38px] text-white font-light text-sm flex items-center'>
      <Container className='flex gap-4 items-center'>
        <div className='flex items-center gap-1'>
          <span>
            <Mail size={16} />
          </span>
          <span>motoshop@email.com</span>
        </div>
        <div className='flex items-center gap-1'>
          <span>
            <PhoneCall size={16} />
          </span>
          <span>06 81 10 47 50</span>
        </div>
      </Container>
    </div>
  );
}
