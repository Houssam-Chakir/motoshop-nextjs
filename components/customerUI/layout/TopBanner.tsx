import Container from "@/components/layout/Container";
import { Mail, PhoneCall } from "lucide-react";

export default function TopBanner() {
  return (
    <div className='bg-black w-full h-[38px] text-white font-light text-sm flex items-center'>
      <Container className='flex gap-4 items-center'>
        <div className='flex gap-1'>
          <span>
            <Mail className='h-5' />
          </span>
          <span>motoshop@email.com</span>
        </div>
        <div className='flex gap-1'>
          <span>
            <PhoneCall className='h-5' />
          </span>
          <span>06 81 10 47 50</span>
        </div>
      </Container>
    </div>
  );
}
