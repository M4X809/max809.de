import { Center, Container, Divider, Grid, GridCol, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
// import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Shell from "./_components/Shell";

import QrCodePreview, { QrCodeData } from "./_components/QrCodePreview";
import type { Metadata } from 'next'
import { AuthButton } from "./_components/AuthButton";

// export const metadata: Metadata = {


export async function generateMetadata() {
  return {
    metadataBase: new URL('https://max809.de'),

    title: "max809.de",
    description: "The Homepage of @max809",
    icons: [{ rel: "icon", url: "/max809.webp" }],
    openGraph: {
      title: "max809.de",
      description: "The Homepage of @max809",
      images: [
        {
          url: "/max809.webp",
          width: 1200,
          height: 630,
          alt: "max809.de",
        },
      ],
      type: "website",
      siteName: "max809.de",
      url: "https://max809.de/",
      locale: "en_US",
    }
  }
}


export default async function Home() {
  const session = await getServerAuthSession();


  return (
    <HydrateClient>
      <Shell session={session}>
        <Group justify="space-between" align="start"  >
          <Stack gap={0} >
            {/* <Link href={"/"} prefetch={true}> */}
            <Title>
              max809.de
            </Title>
            {/* </Link> */}
            {/* <Text className="text-wrap" fw={900} c={"darkred"} component="span" > This Site is not intended for public use. Use at your own risk.</Text> */}
          </Stack>
          <AuthButton session={session} />

        </Group>
        <Stack>
          <Center>
            <Stack >
              <Title ta={"center"} order={1} fz={50}>Welcome to my Site. </Title>
              <Text className="text-wrap" ta={"center"} fw={900} c={"darkred"} component="span" > This Site is not intended for public use. Use at your own risk.</Text>

              <Title ta={"center"}>Apps On This Site</Title>
              <Container

                component={Link}
                // @ts-ignore
                href={"/qr-code-generator"}
                prefetch={true}
                size={"sm"}
                p={20}
                bg={"rgba(255,255,255,0.1)"}
                w={450}
                className="rounded-lg"
              >
                <Grid columns={5}>
                  <GridCol span={"auto"}>
                    <Stack gap={0}>
                      <Title order={2}>QR Code Generator</Title>
                      <Text fz={13} > Create / Download / Save Custom QR Codes for your websites and apps.


                      </Text>

                    </Stack>
                  </GridCol>
                  <GridCol span={"content"}>
                    <QrCodePreview
                      data={{
                        color: "rgba(255,255,255,1)",
                        backgroundColor: "rgba(0,0,0,0)",
                        finderRadius: 0,
                        dotRadius: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        qrCode: "https://max809.de/qr-code-generator",
                        qrLvl: 0,
                        size: 512,
                        id: "1",
                        name: "QR Code Generator",
                        createdById: "1",

                      }}
                    />
                  </GridCol>
                </Grid>

              </Container>
            </Stack>
          </Center>
        </Stack>




      </Shell>
    </HydrateClient>
  )
}
