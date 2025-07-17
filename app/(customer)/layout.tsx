import type { Metadata } from "next";
import "@/app/globals.css";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Navbar from "@/components/customerUI/navbar/navbar";
import TopBanner from "@/components/customerUI/layout/TopBanner";
import Container from "@/components/layout/Container";
import { SessionProvider } from "@/contexts/SessionContext";
import { UserProvider } from "@/contexts/UserContext";
import { SectionsProvider } from "@/contexts/SectionsContext";
import Footer from "@/components/customerUI/layout/footer";

export const metadata: Metadata = {
  title: "Motoshop",
  description: "Your one way stop to all your motorcycle needs",
};

//f// Layout ------------------------------------------------------------------------------------
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {


  return (
    <div className=''>
      <NuqsAdapter>
        <SessionProvider>
          <UserProvider>
            <SectionsProvider>
              <TopBanner />
              <Navbar/>
              <Container>{children}</Container>
              <Footer/>
            </SectionsProvider>
          </UserProvider>
        </SessionProvider>
      </NuqsAdapter>
    </div>
  );
}
