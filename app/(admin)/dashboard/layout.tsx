import type React from "react";
import "@/app/globals.css";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/adminUI/Sidebar";
import AuthProvider from "@/components/authentication/AuthProvider";
import { ToastContainer } from "react-toastify";
import HeaderButtonsSection from "@/components/adminUI/headerButtons";


export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang='en'>
      <body>
        <ToastContainer />
        <AuthProvider>
          <SidebarProvider>
            <div className='flex w-full'>
              <DashboardSidebar />
              <SidebarInset>
                <header className='flex h-16 items-center gap-4 border-b bg-background px-6'>
                  <SidebarTrigger />
                  <div className='flex-1'>
                    <h1 className='text-lg font-semibold'>Dashboard</h1>
                  </div>
                  <HeaderButtonsSection/>
                </header>
                <main className='flex-1 p-4 bg-grey-light'>{children}</main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
