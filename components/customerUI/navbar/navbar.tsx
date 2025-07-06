"use client";

import { useQueryState } from "nuqs";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import { AlignJustify, BoxIcon, Heart, LogOut, ShoppingCart, Store, User, UserSearch } from "lucide-react";
import Link from "next/link";
import Container from "../../layout/Container";
import CategoriesSection from "./CategoriesSection";
import { getProviders, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Session } from "next-auth";
import GoogleSignupButton from "@/components/authentication/GoogleSignUpButton";
import useMediaQuery from "@/hooks/useMediaQuery";
import SearchInput, { SearchBar } from "./SearchInput";
import { MobileSlider } from "../sideBar/MobileSidebar";
import { CategoriesSlider } from "../sideBar/CategoriesSlider";
import { Section } from "@/types/section";
import { useSessionContext } from "@/contexts/SessionContext";
import { useUserContext } from "@/contexts/UserContext";
import WishlistSlider from "./WishlistSlider";
import CartSlider from "./CartSlider";
import { useSections } from "@/contexts/SectionsContext";

// -- Navbar -------------------------------------------
export default function Navbar() {
  const { sections } = useSections();
  const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "" });
  // const isPhoneOrLarger = useMediaQuery("sm"); // 'md' is type-checked
  // const isTabletOrLarger = useMediaQuery("md"); // 'md' is type-checked
  const isDesktop = useMediaQuery("lg");

  //Menus states
  const [whichSectionMenuOpen, setWhichSectionMenuOpen] = useState<number | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (whichSectionMenuOpen) setIsUserMenuOpen(false);
    if (isUserMenuOpen) {
      setWhichSectionMenuOpen(null);
      setIsUserMenuOpen(true);
    }
  }, [whichSectionMenuOpen, isUserMenuOpen]);

  const { session } = useSessionContext();
  // const { profile } = useUserContext();
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }> | null>(null);
  const profileImage = session?.user?.image?.toString() as string;
  // const userRole = profile?.role as String;

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);
  return (
    <header className='w-full pt-4 bg-white shadow-xs z-30 sticky top-0'>
      <Container className=''>
        {/* Top section */}
        <div className='flex items-center justify-between pb-4'>
          <div className='flex gap-6'>
            {/* Mobile Side Bar */}
            {!isDesktop && (
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
                  providers={providers}
                  session={session}
                  sections={sections}
                  onCategorySelect={(section: Section) => {
                    console.log("Selected category:", section.section);
                  }}
                  onTypeSelect={(type, section: Section) => {
                    console.log(`Selected ${type.name} from ${section.section}`);
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
                        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
              isDesktop={isDesktop}
              providers={providers}
              session={session!}
              profileImage={profileImage}
              isUserMenuOpen={isUserMenuOpen}
              setIsUserMenuOpen={setIsUserMenuOpen}
            />
          </div>
        </div>
        <div className='flex justify-center'>
          {/* Categories section */}
          {isDesktop && <CategoriesSection whichSectionMenuOpen={whichSectionMenuOpen} setWhichSectionMenuOpen={setWhichSectionMenuOpen} sections={sections} />}
        </div>
      </Container>
    </header>
  );
}

///
//f/ NAVBAR COMPONENTS ------------------------------------------------------------------
///
// -- User Buttons Section -------------------------------------------
function UserButtonsSection({
  providers,
  session,
  profileImage,
  isUserMenuOpen,
  isDesktop,
}: {
  providers: Record<string, { id: string; name: string }> | null;
  session: Session;
  profileImage: string;
  isUserMenuOpen: boolean;
  setIsUserMenuOpen: (value: boolean) => void;
  isDesktop: boolean;
}) {
  const username = session?.user?.name?.split(" ").at(0) || "username";
  return (
    <>
      <WishlistSlider session={session} />
      <CartSlider session={session} />
      {isDesktop && <UserMenuSlider session={session} providers={providers} profileImage={profileImage} username={username} isUserMenuOpen={isUserMenuOpen} />}
    </>
  );
}

// -- User Menu -------------------------------------------
function UserMenu({ providers, session }: { session: Session | null; providers: Record<string, { id: string; name: string }> }) {
   // const { wishlist } = useUserContext(); // Get wishlist from context
  const { profile } = useUserContext();

  const userRole = profile?.role;
  return (
    <>
      {session && (
        <div className='flex flex-col h-full min-h-0'>
          {/* Profile Info & Counts Section */}
          <div className='p-4 border-b shrink-0'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-full overflow-hidden border border-gray-300 bg-gray-100'>
                <Image
                  src={session.user?.image || "/default-avatar.png"} // Ensure you have a fallback avatar
                  alt={session.user?.name || "User Avatar"}
                  width={48}
                  height={48}
                  className='object-cover w-full h-full'
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/default-avatar.png";
                  }} // Fallback for broken image links
                />
              </div>
              <div>
                <p className='font-semibold text-sm truncate'>{session.user?.name || "User Name"}</p>
                <p className='text-xs text-gray-500 truncate'>{session.user?.email || "user@example.com"}</p>
                <p className='text-xs text-gray-500 truncate'>{userRole}</p>
              </div>
            </div>
          </div>
          {/* Main Action Buttons List */}
          <ul className='flex-grow w-full flex flex-col gap-1.5 px-2 py-3 text-md overflow-y-auto'>
            {/* Section 1: Profile, Orders */}
            <li className='flex items-center gap-3 px-4 py-2.5 rounded-xs hover:bg-grey-light cursor-pointer'>
              <UserSearch size={22} className='text-gray-600 shrink-0' />
              <span className='text-sm text-gray-700'>Profile</span>
            </li>
            <li className='flex items-center gap-3 px-4 py-2.5 rounded-xs hover:bg-grey-light cursor-pointer'>
              <BoxIcon size={22} className='text-gray-600 shrink-0' />
              <span className='text-sm text-gray-700'>Orders</span>
            </li>

            <hr className='my-1.5 border-gray-200' />

            {/* Section 2: Wishlist, Cart */}
            <li className='flex items-center gap-3 px-4 py-2.5 rounded-xs hover:bg-grey-light cursor-pointer'>
              <Heart size={22} className='text-gray-600 shrink-0' />
              <span className='text-sm text-gray-700'>Wishlist</span>
            </li>
            <li className='flex items-center gap-3 px-4 py-2.5 rounded-xs hover:bg-grey-light cursor-pointer'>
              <ShoppingCart size={22} className='text-gray-600 shrink-0' />
              <span className='text-sm text-gray-700'>Cart</span>
            </li>

            <hr className='my-1.5 border-gray-200' />

            {userRole === "admin" && (
              <li className='hover:bg-grey-light cursor-pointer'>
                <Link className='flex items-center gap-3 px-4 py-2.5 rounded-xs' href='/dashboard/inventory'>
                  <Store size={22} className='text-gray-600 shrink-0' />
                  <span className='text-sm text-gray-700'>Store dashboard</span>
                </Link>
              </li>
            )}
          </ul>
          {/* Logout Button Section (at the bottom) */}
          <div className='mt-auto p-2 border-t shrink-0'>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className='w-full flex items-center justify-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-primary hover:text-white rounded-xs transition-colors duration-150'
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Guest View (Sign Up) */}
      {!session && (
        <div className='flex flex-col h-full min-h-0'>
          <div className='p-4 pb-6 border-b shrink-0'>
            {providers &&
              Object.values(providers).map((provider) => {
                if (provider.id === "google") {
                  return (
                    <>
                      <h2 className='text-lg p-3 uppercase text-center pb-3 font-bold shrink-0'>Sign Up</h2>
                      <GoogleSignupButton
                        onSignup={async () => {
                          await signIn(provider.id, { callbackUrl: "/" });
                        }}
                        key={provider.id}
                        className='w-full max-w-xs'
                      />
                    </>
                  );
                }
                return null;
              })}
            {!providers && <p className='text-sm text-gray-500'>Sign up options are currently unavailable.</p>}
          </div>
          {/* Main Action Buttons List */}
          <ul className='flex-grow w-full flex flex-col gap-1.5 px-2 py-3 text-md overflow-y-auto'>
            {/* Section 1: Profile, Orders */}
            <li className='flex items-center gap-3 px-4 py-2.5 rounded-xs hover:bg-grey-light cursor-pointer'>
              <BoxIcon size={22} className='text-gray-600 shrink-0' />
              <span className='text-sm text-gray-700'>Orders</span>
            </li>

            {/* Section 2: Wishlist, Cart */}
            <li className='flex items-center gap-3 px-4 py-2.5 rounded-xs hover:bg-grey-light cursor-pointer'>
              <Heart size={22} className='text-gray-600 shrink-0' />
              <span className='text-sm text-gray-700'>Wishlist</span>
            </li>
            <li className='flex items-center gap-3 px-4 py-2.5 rounded-xs hover:bg-grey-light cursor-pointer'>
              <ShoppingCart size={22} className='text-gray-600 shrink-0' />
              <span className='text-sm text-gray-700'>Cart</span>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

// -- User Menu Slider -------------------------------------------
function UserMenuSlider({
  session,
  profileImage,
  username,
  isUserMenuOpen,
  providers,
}: {
  session: Session | null;
  profileImage: string;
  username: string;
  isUserMenuOpen: boolean;
  providers: Record<string, { id: string; name: string }> | null;
}) {
  const [parent] = useAutoAnimate({ duration: 100 });

  return (
    <MobileSlider
      side='right'
      trigger={
        <div ref={parent} className='flex flex-col items-center group cursor-pointer'>
          {!session ? (
            <>
              <User className='h-5 w-5 text-gray-700 group-hover:text-primary duration-100 group-hover:-translate-y-1' />
              <span className='text-xs mt-1 group-hover:text-primary'>Guest</span>
            </>
          ) : (
            <>
              <div className={`${isUserMenuOpen ? "group-hover:-translate-y-1" : ""} duration-100 w-5 h-5 overflow-hidden border-1 border-gray-400 rounded-full`}>
                <Image
                  src={profileImage || "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80"}
                  className='object-cover w-full h-full'
                  alt='avatar'
                  width={0}
                  height={0}
                  sizes='100vw'
                />
              </div>
              <span className={`text-xs mt-1 ${isUserMenuOpen ? "text-primary-dark" : ""} group-hover:text-primary`}>{username}</span>
            </>
          )}
        </div>
      }
    >
      <UserMenu providers={providers ?? {}} session={session!} />
    </MobileSlider>
  );
}

// -- Logo -------------------------------------------
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
