import "~/styles/globals.css";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AppStoreProvider } from "~/providers/app-store-provider";
import { CSPostHogProvider } from "./providers";
import { QrCodeStoreProvider } from "~/providers/qr-code-provider";

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
      </head>
      <body
      >
        <CSPostHogProvider>
          <TRPCReactProvider>
            <MantineProvider
              defaultColorScheme="dark"
              forceColorScheme="dark"
              theme={{
                focusRing: "never",

              }}
            >
              <AppStoreProvider>
                <QrCodeStoreProvider>
                  <ModalsProvider>
                    {children}
                  </ModalsProvider>
                </QrCodeStoreProvider>
              </AppStoreProvider>
            </MantineProvider>
          </TRPCReactProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}
