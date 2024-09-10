import "~/styles/globals.css";
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AppStoreProvider } from "~/providers/app-store-provider";


export const metadata: Metadata = {
  title: "QR Code Generator",
  description: "QR Code Generator",
  icons: [{ rel: "icon", url: "/favicon.webp" }],
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
        </TRPCReactProvider>
      </body>
    </html>
  );
}
