import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/adminUI/Sidebar";
import HeaderButtonsSection from "@/components/adminUI/headerButtons";
import { SessionProvider } from "@/contexts/SessionContext";
import { DashboardBreadcrumb } from "@/components/adminUI/DashboardBreadcrumb";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <SessionProvider>
        <div className='flex w-full'>
          <DashboardSidebar />
          <SidebarInset>
            <header className='flex h-16 items-center gap-4 border-b bg-background px-6'>
              <SidebarTrigger />
              <div className='flex-1'>
                <DashboardBreadcrumb />
              </div>
              <HeaderButtonsSection />
            </header>
            <main className='flex-1 p-6 bg-muted/30'>{children}</main>
          </SidebarInset>
        </div>
      </SessionProvider>
    </SidebarProvider>
  );
}
