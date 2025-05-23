"use client";

import { useQueryState } from "nuqs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { Heart, ShoppingCart, User, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Container from "../../layout/Container";
import CategoriesSection from "./CategoriesSection";
import { CategoryType } from "@/models/Category";

export default function Navbar({ sections }: { categories: { id: string; name: string }[] }) {
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  const [parent] = useAutoAnimate({ duration: 100 });

  return (
    <header className='w-full pt-4  bg-white shadow-xs relative'>
      <Container className=''>
        {/* Top section */}
        <div className='flex items-center justify-between pb-4'>
          {/* Logo */}
          <Logo />

          {/* Search Bar */}
          <div className='relative max-w-[518px] w-full mx-4'>
            <div ref={parent} className='relative'>
              <Input
                type='text'
                placeholder='Search for products...'
                className='w-full pl-11 pr-4 h-[42px] text-black text-xs placeholder:text-black focus:placeholder:text-grey-darker placeholder:text-xs rounded-full bg-grey border-xs hover:border-grey-dark duration-100 transition-all shadow-none border-grey-light font-display'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
                <svg className='h-5 w-5 text-primary-dark' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className='absolute cursor-pointer inset-y-0 right-0 pr-4 flex items-center pointer-events-auto'>
                  <X />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Icons */}
          <UserButtonsSection />
        </div>
        <div className='flex justify-center'>
          {/* Categories section */}
          <CategoriesSection sections={sections} />
        </div>
      </Container>
    </header>
  );
}

function UserButtonsSection() {
  return (
    <>
      <div className='flex items-center space-x-6'>
        <div className='flex flex-col items-center group cursor-pointer'>
          <Heart className='h-6 w-6 text-gray-700 group-hover:text-blue duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-blue'>Wishlist</span>
        </div>

        <div className='flex flex-col items-center relative group cursor-pointer'>
          <div className='relative '>
            <ShoppingCart className='h-6 w-6 text-gray-700 group-hover:text-blue duration-100 group-hover:-translate-y-1' />
            <span className='absolute -top-2 -right-2 bg-secondary-light opacity-80 group-hover:opacity-100 text-white text-sm font-bold rounded-full duration-100 group-hover:-translate-y-1.5 h-5 w-5 flex items-center justify-center'>
              0
            </span>
          </div>
          <span className='text-xs mt-1 group-hover:text-blue'>Cart</span>
        </div>

        <div className='flex flex-col items-center group cursor-pointer'>
          <User className='h-6 w-6 text-gray-700 group-hover:text-blue duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-blue'>Guest</span>
        </div>
      </div>
    </>
  );
}

function Logo() {
  return (
    <>
      <div className='relative flex items-center group md:w-[150px]'>
        <Link href='/' className='text-xl font-extrabold italic'>
          <span className='absolute text-link top-5 italic -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-100 text-[10px] cursor-pointer'>
            Go to home page
          </span>
          <span className='text-primary-dark'>MOTO</span>
          <span>SHOP</span>
        </Link>
      </div>
    </>
  );
}
