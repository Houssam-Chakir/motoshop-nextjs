import type { Metadata } from "next";
import { inter, oxanium } from "@/app/fonts";
import "@/app/globals.css";
import AuthProvider from "@/components/authentication/AuthProvider";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import Navbar from "@/components/customerUI/navbar/navbar";
import getSections from "@/utils/getSections";
import TopBanner from "@/components/customerUI/layout/TopBanner";
import Container from "@/components/layout/Container";

export const metadata: Metadata = {
  title: "Motoshop",
  description: "Your one way stop to all your motorcycle needs",
};

//f// Layout ------------------------------------------------------------------------------------
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const sections = await getSections();
  return (
    <html lang='en' className={`${inter.variable} ${oxanium.variable}`}>
      <AuthProvider>
        <body className='bg-grey-light'>
          <NuqsAdapter>
            <TopBanner />
            <Navbar sections={sections} />
            <Container>{children}</Container>
          </NuqsAdapter>
        </body>
      </AuthProvider>
    </html>
  );
}
