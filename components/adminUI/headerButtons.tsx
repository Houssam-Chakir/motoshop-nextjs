"use client";

import { Session } from "next-auth";
import { getProviders, signIn, signOut, useSession } from "next-auth/react";

import { LogOut, User, UserSearch } from "lucide-react";
import Image from "next/image";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import GoogleSignupButton from "../authentication/GoogleSignUpButton";
import { useEffect, useState } from "react";

export default function HeaderButtonsSection() {
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }> | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: session } = useSession();

  const [parent] = useAutoAnimate({ duration: 100 });
  const username = session?.user.name.split(" ").at(0) || "username";
  const profileImage = session?.user.image?.toString() as string;



  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);

  return (
    <>
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
