"use client";

import { useQueryState } from "nuqs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AlignJustify, BoxIcon, Heart, LogIn, LogOut, Menu, ShoppingCart, User, UserSearch, X } from "lucide-react";
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
import SearchInput, { SearchBar } from "./SearchInput";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { Button } from "@/components/ui/button";
import { CategoriesSlider } from "../sideBar/SectionsSlider";
import { categoriesData } from "../sideBar/categories";

export default function Navbar({ sections }: { categories: { id: string; name: string }[] }) {
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  const [parent] = useAutoAnimate({ duration: 100 });
  const isPhoneOrLarger = useMediaQuery("sm"); // 'md' is type-checked
  const isTabletOrLarger = useMediaQuery("md"); // 'md' is type-checked
  const isDesktop = useMediaQuery("lg");

  //Menus states
  const [whichSectionMenuOpen, setWhichSectionMenuOpen] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
          <div className='flex gap-6'>
            {!isTabletOrLarger && (
              <MobileSlider
                trigger={
                  <button>
                    <div className='absolute left-0 w-20 h-12'></div>
                    <div className='flex flex-col justify-center items-center '>
                      <AlignJustify className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100' />
                      <span className='text-xs mt-1 group-hover:text-primary'>Menu</span>
                    </div>
                  </button>
                }
              >
                <CategoriesSlider
                  categories={categoriesData}
                  onCategorySelect={(category) => {
                    console.log("Selected category:", category.name);
                  }}
                  onTypeSelect={(type, category) => {
                    console.log(`Selected ${type.name} from ${category.name}`);
                  }}
                />
              </MobileSlider>
            )}
            {/* Logo */}
            <span className='pt-2'>
              <Logo />
            </span>
          </div>

          {/* Search Bar */}
          {isDesktop && <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} isDesktop={isDesktop} />}

          {/* User related buttons */}
          <div className='flex items-center space-x-6'>
            {!isDesktop && (
              <>
                {/* Mobile search input button */}
                <div onClick={() => setIsSearchOpen(!isSearchOpen)}>
                  <SearchInput searchQuery={searchQuery} setSearchQuery={setSearchQuery} isDesktop={isDesktop} />
                </div>
                {isSearchOpen && (
                  <>
                    <div className='absolute bg-white w-[100vw] -right-6 top-16 pt-4 pb-6'>
                      <Container className=''>
                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} parent={parent} />
                      </Container>
                      <div
                        onClick={() => setIsSearchOpen(false)}
                        id='searchOverlay'
                        className='fixed h-full inset-x-0 inset-y-[184px] bg-black/50'
                        role='button'
                        aria-label='Close search'
                        aria-hidden='true'
                      ></div>
                    </div>
                  </>
                )}
              </>
            )}
            <UserButtonsSection
              isPhoneOrLarger={isPhoneOrLarger}
              providers={providers}
              session={session}
              profileImage={profileImage}
              isUserMenuOpen={isUserMenuOpen}
              setIsUserMenuOpen={setIsUserMenuOpen}
            />
          </div>
        </div>
        <div className='flex justify-center'>
          {/* Categories section */}
          {isTabletOrLarger && <CategoriesSection whichSectionMenuOpen={whichSectionMenuOpen} setWhichSectionMenuOpen={setWhichSectionMenuOpen} sections={sections} />}
        </div>
      </Container>
    </header>
  );
}

function UserButtonsSection({ providers, session, profileImage, isUserMenuOpen, setIsUserMenuOpen, isPhoneOrLarger }) {
  const [parent] = useAutoAnimate({ duration: 100 });
  const username = session?.user.name.split(" ").at(0) || "username";
  return (
    <>
      {isPhoneOrLarger && (
        <div className='flex flex-col items-center group cursor-pointer'>
          <Heart className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
          <span className='text-xs mt-1 group-hover:text-primary'>Wishlist</span>
        </div>
      )}

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
