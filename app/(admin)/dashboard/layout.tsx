import type React from "react";
import "@/app/globals.css";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/adminUI/Sidebar";
import NavBar from "@/components/Navbar";
import AuthProvider from "@/components/authentication/AuthProvider";
import { ToastContainer } from "react-toastify";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <body>
        <ToastContainer/>
        <AuthProvider>
          <SidebarProvider>
            <div className='flex min-h-screen'>
              <DashboardSidebar />
              <SidebarInset>
                <NavBar />
                <header className='flex h-16 items-center gap-4 border-b bg-background px-6'>
                  <SidebarTrigger />
                  <div className='flex-1'>
                    <h1 className='text-lg font-semibold'>Dashboard</h1>
                  </div>
                </header>
                <main className='flex-1 p-6'>{children}</main>
              </SidebarInset>
            </div>
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
