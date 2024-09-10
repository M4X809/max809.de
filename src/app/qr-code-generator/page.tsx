import { Center, Container, Divider, Group, Stack, Title } from "@mantine/core";
import Link from "next/link";
// import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Shell from "~/app/_components/Shell";

import QrCodeContainer from "~/app/_components/QrCodeContainer";
import SavedCodes from "~/app/_components/ServerSavedCodes";
import { Suspense } from "react";

import type { Metadata } from 'next'



export async function generateMetadata() {
  return {
    metadataBase: new URL('https://max809.de'),

    title: "Qr Code Generator",
    description: "A simple QR Code Generator with customizable options.",
    icons: [{ rel: "icon", url: "/favicon-qr.webp" }],
    openGraph: {
      title: "Qr Code Generator",
      description: "A simple QR Code Generator with customizable options.",
      images: [
        {
          url: "/favicon-qr.webp",
          width: 1200,
          height: 630,
          alt: "Qr Code Generator",
        },
      ],
      type: "website",
      siteName: "Qr Code Generator",
      url: "https://max809.de/qr-code-generator",
      locale: "en_US",
    }
  }
}


export default async function Home() {
  const session = await getServerAuthSession();

  // if (session) {
  //   redirect("/generator");
  // }



  // void api.post.getLatest.prefetch();

  return (

    <HydrateClient>
      {/* <title>Qr Code Generator</title>
      <meta name="description" content="A simple QR Code Generator with customizable options." />
      <link rel="icon" href="/favicon-qr.webp" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="apple-touch-icon" href="/favicon-qr.webp" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://max809.de/qr-code-generator" />
      <meta property="og:title" content="Qr Code Generator" />
      <meta property="og:description" content="A simple QR Code Generator with customizable options." />
      <meta property="og:image" content="/favicon-qr.webp" /> */}

      <Shell
        session={session}
      >
        <Group justify="space-between">
          <Link href={"/"} prefetch={true}>
            <Title>
              QR Code Generator
            </Title>
          </Link>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? `Sign out: ${session.user?.name}` : "Sign in"}
          </Link>
        </Group>
        <QrCodeContainer />

        {/* <Suspense> */}

        <Stack mt={20} >
          <Divider />
          <Title ta={"center"} order={2}>Saved QR Codes</Title>

          <Group wrap="wrap" grow justify="center">
            <SavedCodes />
          </Group>

        </Stack>

        {/* </Suspense> */}




      </Shell>
    </HydrateClient>
  );
}
