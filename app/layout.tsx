import type { Metadata } from "next";
import { inter, oxanium } from "@/app/fonts";
import "@/app/globals.css";
import AuthProvider from "@/components/authentication/AuthProvider";
import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "Motoshop",
  description: "Your one way stop to all your motorcycle needs",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} ${oxanium.variable}`}>
      <body>
        <ToastContainer />
        <AuthProvider>
          {children}
          <div id='modal-root'></div>
        </AuthProvider>
      </body>
    </html>
  );
}
