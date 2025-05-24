import { User } from "lucide-react";

const UserAvatar = () => {
  return (
    <div className='flex flex-col items-center group cursor-pointer'>
      <User className='h-6 w-6 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
      <span className='text-xs mt-1 group-hover:text-primary'>Guest</span>
    </div>
  );
};

export default UserAvatar;
