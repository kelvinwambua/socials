
import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Providers } from "./providers";

import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
  title: "Sonder",
  description: "Make Friends in College",
  icons: [{ rel: "icon", url: "/sonderlogo.webp" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
        <Providers>
   
          {children}
          <Toaster/>
          
        </Providers>
          </TRPCReactProvider>
      </body>
    </html>
  );
}
