import type { Metadata } from "next";
import { inter, oxanium } from "@/app/fonts";
import "@/app/globals.css";
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
export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const sections = await getSections();

  return (
    <div className='bg-grey-light'>
      <NuqsAdapter>
        <TopBanner />
        <Navbar sections={sections} />
        <Container>{children}</Container>
      </NuqsAdapter>
    </div>
  );
}
