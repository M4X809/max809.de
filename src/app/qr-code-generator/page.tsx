import { Divider, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
// import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Shell from "~/app/_components/Shell";

import QrCodeContainer from "~/app/_components/QrCodeContainer";
import SavedCodes from "~/app/_components/ServerSavedCodes";




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
      <Shell
        session={session}
      >
        <Group justify="space-between" align="start" wrap="nowrap">
          <Stack gap={0} >
            <Link href={"/"} prefetch={true}>
              <Title>
                QR Code Generator
              </Title>
            </Link>
            <Text className="text-wrap" fw={900} c={"darkred"} component="span" > This Site is not intended for public use. Use at your own risk.</Text>
          </Stack>
          <Link

            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20 text-nowrap"
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
