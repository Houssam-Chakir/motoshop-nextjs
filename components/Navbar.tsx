"use client";
import { signIn, signOut, useSession, getProviders } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

const NavBar = () => {
  const { data: session } = useSession();
  console.log("session: ", session);
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
    <nav className='relative bg-white shadow dark:bg-gray-800'>
      <div className='container px-6 py-4 mx-auto'>
        <div className='lg:flex lg:items-center lg:justify-between'>
          <div className='flex items-center justify-between'>
            <a href='#'>
              <img className='w-auto h-6 sm:h-7' src='https://merakiui.com/images/full-logo.svg' alt='' />
            </a>

            {/* <!-- Mobile menu button --> */}
            <div className='flex lg:hidden'>
              <button
                type='button'
                className='text-gray-500 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 focus:outline-none focus:text-gray-600 dark:focus:text-gray-400'
                aria-label='toggle menu'
              >
                <svg xmlns='http://www.w3.org/2000/svg' className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2'>
                  <path strokeLinecap='round' strokeLinejoin='round' d='M4 8h16M4 16h16' />
                </svg>
              </button>
            </div>
          </div>

          {/* <!-- Mobile Menu open: "block", Menu closed: "hidden" --> */}
          <div className='absolute inset-x-0 z-20 w-full px-6 py-4 transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 lg:mt-0 lg:p-0 lg:top-0 lg:relative lg:bg-transparent lg:w-auto lg:opacity-100 lg:translate-x-0 lg:flex lg:items-center'>
            <div className='flex flex-col -mx-6 lg:flex-row lg:items-center lg:mx-8'>
              {!session && (
                <div className='flex items-center mt-4 lg:mt-0'>
                  {providers &&
                    Object.values(providers).map((provider) => {
                      return (
                        <button
                          key={provider.id}
                          onClick={() => signIn(provider.id)}
                          className='hidden mx-4 text-gray-600 transition-colors duration-300 transform lg:block dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-400 focus:text-gray-700 dark:focus:text-gray-400 focus:outline-none'
                          aria-label='show notifications'
                        >
                          SignIn with {provider.name}
                        </button>
                      );
                    })}
                </div>
              )}
              {session && (
                <>
                  <button type='button' className='flex items-center focus:outline-none' aria-label='toggle profile dropdown'>
                    <div className='w-8 h-8 overflow-hidden border-2 border-gray-400 rounded-full'>
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

                    <h3 className='mx-2 text-gray-700 dark:text-gray-200 lg:hidden'>Khatab wedaa</h3>
                  </button>
                  <button
                    onClick={() => signOut()}
                    className='hidden mx-4 text-gray-600 transition-colors duration-300 transform lg:block dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-400 focus:text-gray-700 dark:focus:text-gray-400 focus:outline-none'
                    aria-label='show notifications'
                  >
                    SignOut
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
