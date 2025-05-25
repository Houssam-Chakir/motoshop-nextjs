"use client";

import { useQueryState } from "nuqs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { BoxIcon, Heart, LogIn, LogOut, ShoppingCart, User, UserSearch, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Container from "../../layout/Container";
import CategoriesSection from "./CategoriesSection";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Session } from "next-auth";
import GoogleSignupButton from "@/components/authentication/GoogleSignUpButton";
import useMediaQuery from "@/hooks/useMediaQuery";

export default function Navbar({ sections }: { categories: { id: string; name: string }[] }) {
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  const [parent] = useAutoAnimate({ duration: 100 });
  const isPhoneOrLarger = useMediaQuery("sm"); // 'md' is type-checked
  const isTabletOrLarger = useMediaQuery("md"); // 'md' is type-checked
  const isDesktop = useMediaQuery("lg");

  //Menus states
  const [whichSectionMenuOpen, setWhichSectionMenuOpen] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  // const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (whichSectionMenuOpen) setIsUserMenuOpen(false);
    if (isUserMenuOpen) {
      setWhichSectionMenuOpen(null);
      setIsUserMenuOpen(true);
    }
  }, [whichSectionMenuOpen, isUserMenuOpen]);

  const { data: session } = useSession();
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }> | null>(null);
  const profileImage = session?.user.image?.toString() as string;

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);
  return (
    <header className='w-full pt-4  bg-white shadow-xs relative'>
      <Container className=''>
        {/* Top section */}
        <div className='flex items-center justify-between pb-4'>
          {/* Logo */}
          <Logo />

          {/* Search Bar */}
          {isDesktop && (
            <div className='relative max-w-[518px] w-full mx-4'>
              <div ref={parent} className='relative'>
                <Input
                  type='text'
                  placeholder='Search for products...'
                  className='w-full pl-11 pr-4 h-[42px] text-black text-xs placeholder:text-black focus:placeholder:text-grey-darker placeholder:text-xs rounded-full bg-grey border-xs hover:border-grey-blue duration-100 transition-all shadow-none border-grey-light font-display'
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
          )}

          {/* User related buttons */}
          <UserButtonsSection providers={providers} session={session} profileImage={profileImage} isUserMenuOpen={isUserMenuOpen} setIsUserMenuOpen={setIsUserMenuOpen} />
        </div>
        <div className='flex justify-center'>
          {/* Categories section */}
          <CategoriesSection whichSectionMenuOpen={whichSectionMenuOpen} setWhichSectionMenuOpen={setWhichSectionMenuOpen} sections={sections} />
        </div>
      </Container>
    </header>
  );
}

function UserButtonsSection({ providers, session, profileImage, isUserMenuOpen, setIsUserMenuOpen }) {
  const [parent] = useAutoAnimate({ duration: 100 });
  const username = session?.user.name.split(" ").at(0) || "username";
  return (
    <>
      <div className='relative flex items-center space-x-6'>
        <div className='flex flex-col items-center group cursor-pointer'>
          <Heart className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-primary'>Wishlist</span>
        </div>

        <div className='flex flex-col items-center relative group cursor-pointer'>
          <div className='relative '>
            <ShoppingCart className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
            <span className='absolute -top-1.5 -right-2 bg-secondary-light opacity-80 group-hover:opacity-100 text-white text-sm font-bold rounded-full duration-100 group-hover:-translate-y-1 h-4 w-4 flex items-center justify-center'>
              0
            </span>
          </div>
          <span className='text-xs mt-1 group-hover:text-primary'>Cart</span>
        </div>
        {!session && (
          <div ref={parent}>
            <div onMouseEnter={() => setIsUserMenuOpen(!isUserMenuOpen)} className='flex flex-col items-center group cursor-pointer'>
              <User className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
              <span className='text-xs mt-1 group-hover:text-primary'>Guest</span>
            </div>
            {isUserMenuOpen && <UserMenu providers={providers} session={session} onMouseLeave={() => setIsUserMenuOpen(!isUserMenuOpen)} />}
          </div>
        )}
        {session && (
          <div ref={parent}>
            <button
              onMouseEnter={() => setIsUserMenuOpen(!isUserMenuOpen)}
              type='button'
              className=' flex flex-col items-center group cursor-pointer'
              aria-label='toggle profile dropdown'
            >
              <div className={` ${isUserMenuOpen ? "group-hover:-translate-y-1" : ""} duration-100 w-5 h-5 overflow-hidden border-2 border-gray-400 rounded-full`}>
                <Image
                  src={
                    profileImage
                      ? profileImage
                      : "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80"
                  }
                  className='object-cover w-full h-full '
                  alt='avatar'
                  width={0}
                  height={0}
                  sizes='100vw'
                />
              </div>
              <span className={`text-xs mt-1 ${isUserMenuOpen ? "text-primary-dark" : ""} group-hover:text-primary`}>{username}</span>
            </button>
            {isUserMenuOpen && <UserMenu providers={providers} session={session} onMouseLeave={() => setIsUserMenuOpen(!isUserMenuOpen)} />}
          </div>
        )}
      </div>
    </>
  );
}

function UserMenu({ providers, session, onMouseLeave }: { session: Session; onMouseLeave: () => void }) {
  return (
    <div onMouseLeave={onMouseLeave} className=' bg-white absolute w-fit min-w-42 right-0 top-14 border  shadow-xl'>
      <div className='absolute w-14 h-14 -top-14 right-0'></div>
      <div className='absolute rotate-45 right-5 -top-[7px] w-3 h-3 border-l-1 border-t-1 bg-white'></div>
      <h1 className=' text-sm p-3 uppercase text-center pb-3 font-bold border-b'>
        {session && "User menu"}
        {!session && "Sign Up"}
      </h1>
      <ul className='w-full py-4 text-sm *:text-nowrap *:px-6 *:py-6 *:flex *:gap-4 *:hover:bg-grey *:cursor-default *:items-center [&_*]:h-5'>
        {session && (
          <>
            <li>
              <UserSearch />
              <span>Profile</span>
            </li>
            <li>
              <BoxIcon />
              <span>Orders</span>
            </li>
            <li className='hover:text-primary' onClick={() => signOut()}>
              <LogOut />
              <span>Logout</span>
            </li>
          </>
        )}
        {!session && (
          <div className='hover:!bg-white !h-12 !py-0'>
            {providers &&
              Object.values(providers).map((provider, i) => {
                if (provider.id === "google") {
                  return <GoogleSignupButton onSignup={() => signIn(provider.id)} key={i} className='' />;
                }
              })}
            {/* <li className='hover:text-primary' onClick={() => signIn()}>
              <LogIn />
              <span>SignIn with</span>
            </li> */}
          </div>
        )}
      </ul>
    </div>
  );
}

function Logo() {
  return (
    <>
      <div className='relative flex items-center group md:w-[150px]'>
        <Link href='/' className='text-[17px] md:text-xl font-extrabold italic'>
          <span className='absolute text-link top-5 italic -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 duration-100 text-[10px] cursor-pointer'>
            Go to home page
          </span>
          <span className='text-primary'>MOTO</span>
          <span>SHOP</span>
        </Link>
      </div>
    </>
  );
}
