"use client";

import { getProviders, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell, Search, Settings, User, LogOut, Shield, HelpCircle, Moon, Sun, Monitor } from "lucide-react";
import GoogleSignupButton from "@/components/authentication/GoogleSignUpButton";
import { useSessionContext } from "@/contexts/SessionContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import Link from "next/link";

export default function HeaderButtons() {
  const { session } = useSessionContext();
  const [providers, setProviders] = useState<Record<string, { id: string; name: string }> | null>(null);
  const [notifications] = useState(3); // Mock notification count

  useEffect(() => {
    const setAuthProviders = async () => {
      const res = await getProviders();
      setProviders(res);
    };
    setAuthProviders();
  }, []);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className='flex items-center gap-3'>
      {!session && (
        <div>
          {providers &&
            Object.values(providers).map((provider, i) => {
              if (provider.id === "google") {
                return (
                  <GoogleSignupButton
                    onSignup={() => {
                      signIn(provider.id);
                    }}
                    key={i}
                    className=''
                  />
                );
              }
            })}
        </div>
      )}

      {session && (
        <>
          {/* Global Search */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='relative'>
                  <Search className='size-5' />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Search everywhere</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant='ghost' size='icon' className='relative'>
                  <Bell className='size-5' />
                  {notifications > 0 && (
                    <Badge className='absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-red-500 text-white border-0'>{notifications}</Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{notifications} new notifications</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' className='relative h-10 w-10 rounded-full border-2 border-transparent hover:border-muted-foreground/20'>
                <Avatar className='h-9 w-9'>
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                  <AvatarFallback className='bg-blue-600 text-white font-semibold'>{session.user?.name?.charAt(0)?.toUpperCase() || "A"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-64' align='end' forceMount>
              <DropdownMenuLabel className='font-normal'>
                <div className='flex flex-col space-y-1'>
                  <p className='text-sm font-medium leading-none'>{session.user?.name || "Admin User"}</p>
                  <p className='text-xs leading-none text-muted-foreground'>{session.user?.email || "admin@motoshop.com"}</p>
                  <div className='flex items-center gap-2 mt-2'>
                    <Badge className='text-xs bg-blue-100 text-blue-800 hover:bg-blue-200'>
                      <Shield className='w-3 h-3 mr-1' />
                      Admin
                    </Badge>
                    <Badge className='text-xs bg-green-100 text-green-800 border-green-200'>Online</Badge>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href='/dashboard/profile' className='cursor-pointer'>
                    <User className='mr-2 h-4 w-4' />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href='/dashboard/settings' className='cursor-pointer'>
                    <Settings className='mr-2 h-4 w-4' />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Monitor className='mr-2 h-4 w-4' />
                    <span>Theme</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>
                      <Sun className='mr-2 h-4 w-4' />
                      <span>Light</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Moon className='mr-2 h-4 w-4' />
                      <span>Dark</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Monitor className='mr-2 h-4 w-4' />
                      <span>System</span>
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href='/dashboard/help' className='cursor-pointer'>
                    <HelpCircle className='mr-2 h-4 w-4' />
                    <span>Help & Support</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={handleSignOut} className='cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10'>
                <LogOut className='mr-2 h-4 w-4' />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
    </div>
  );
}
