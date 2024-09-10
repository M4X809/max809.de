import "~/styles/globals.css";
import '@mantine/core/styles.css';
import {  MantineProvider } from '@mantine/core';

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AppStoreProvider } from "~/providers/app-store-provider";



export const metadata: Metadata = {
  metadataBase: new URL('https://max809.de'),
  title: "max809.de",
  description: "The Homepage of @max809",
  icons: [{ rel: "icon", url: "/max809.webp" }],

};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <head>
        {/* <ColorSchemeScript /> */}
      </head>
      <body
      // style={{
      //   backgroundColor: "#242424",
      //   color: "#fff",
      // }}
      >
        <TRPCReactProvider>
          {/* <HelmetProvider> */}
          <MantineProvider
            defaultColorScheme="dark"
            forceColorScheme="dark"
            theme={{
              focusRing: "never",

            }}
          >
            <AppStoreProvider>
              {children}
            </AppStoreProvider>
          </MantineProvider>
          {/* </HelmetProvider> */}
        </TRPCReactProvider>
      </body>
    </html>
  );
}
