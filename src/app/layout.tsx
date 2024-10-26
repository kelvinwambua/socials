
import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";

import { ourFileRouter } from "~/app/api/uploadthing/core";

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
    <html lang="en" className={`${GeistSans.variable} dark`}>
      <body>
        <TRPCReactProvider>
        <Providers>
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
   
          {children}
          <Toaster/>
          
        </Providers>
          </TRPCReactProvider>
      </body>
    </html>
  );
}
