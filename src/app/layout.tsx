import "~/styles/globals.css";
import '@mantine/core/styles.css';
import '@mantine/dropzone/styles.css';
import '@mantine/code-highlight/styles.css';

import { Button, MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';

import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { AppStoreProvider } from "~/providers/app-store-provider";
import { CSPostHogProvider } from "./providers";
import { QrCodeStoreProvider } from "~/providers/qr-code-provider";
import { theme } from "./theme";

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
        style={{
          background: "linear-gradient(to top, #06080f, #122b69)"
        }}
      >
        <CSPostHogProvider>
          <TRPCReactProvider>
            <MantineProvider
              defaultColorScheme="dark"
              forceColorScheme="dark"
              theme={theme}
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
