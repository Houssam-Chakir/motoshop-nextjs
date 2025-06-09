"use client";

import { getProviders, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Session } from "next-auth";
import GoogleSignupButton from "@/components/authentication/GoogleSignUpButton";
import { useSessionContext } from "@/contexts/SessionContext";

export default function HeaderButtons() {
  const { session } = useSessionContext();
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }> | null>(null);
  const profileImage = session?.user?.image?.toString() as string;

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);

  return (
    <div className='flex items-center space-x-6'>
      {!session && (
        <div>
          {providers &&
            Object.values(providers).map((provider, i) => {
              if (provider.id === "google") {
                return <GoogleSignupButton onSignup={() => signIn(provider.id)} key={i} className='' />;
              }
            })}
        </div>
      )}
      {session && (
        <div className='flex items-center space-x-4'>
          <div className='flex flex-col items-end'>
            <span className='text-sm font-medium'>{session.user?.name}</span>
            <span className='text-xs text-gray-500'>{session.user?.email}</span>
          </div>
          <div className='w-10 h-10 overflow-hidden border-2 border-gray-400 rounded-full'>
            <Image
              src={
                profileImage
                  ? profileImage
                  : "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=334&q=80"
              }
              className='object-cover w-full h-full'
              alt='avatar'
              width={0}
              height={0}
              sizes='100vw'
            />
          </div>
          <button onClick={() => signOut()} className='text-sm text-gray-500 hover:text-gray-700'>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
