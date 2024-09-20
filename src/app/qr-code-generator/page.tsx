import { Divider, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
// import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Shell from "~/app/_components/Shell";

import QrCodeContainer from "~/app/qr-code-generator/_qr-components/QrCodeContainer";
import SavedCodes from "~/app/qr-code-generator/_qr-components/ServerSavedCodes";


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
  return (
    <HydrateClient>
      <Shell
        session={session} title="QR Code Generator" redirect={"/"}
        withLoginButton={true}
      >

        <QrCodeContainer />
        <Stack mt={20} gap={0} >
          <Divider my={15} />
          <Title pos={"sticky"} ta={"center"} order={2}>Saved QR Codes</Title>
          <SavedCodes />
        </Stack>
      </Shell>
    </HydrateClient>
  );
}
