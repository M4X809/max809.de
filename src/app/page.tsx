import { AspectRatio, Box, Center, Container, Grid, GridCol, Group, Pill, Stack, Text, Title, Image as MantineImage } from "@mantine/core";
import Link from "next/link";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Shell from "./_components/Shell";

import QrCodePreview from "~/app/qr-code-generator/_qr-components/QrCodePreview";
import type { Metadata } from 'next'
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube } from "@fortawesome/pro-duotone-svg-icons";
import { env } from "~/env";


export async function generateMetadata(): Promise<Metadata> {
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
      <Shell session={session}
        title="max809.de"
        withLoginButton
      >
        <Stack>
          <Center>
            <Stack >
              <Title ta={"center"} order={1} fz={50}>Welcome to my Site. </Title>
              <Text className="text-wrap text-red-800/40" ta={"center"} fw={900} component="span" > This Site is not intended for public use. Use at your own risk.</Text>
              <Title order={3} ta={"center"}>
                Apps on this site
              </Title>
              <Group wrap="wrap" grow justify="center">



                {/* Qr Code Generator */}
                <Container bg={"rgba(255,255,255,0.1)"} p={20} size={"sm"} w={500} mah={180} mih={180} maw={"100dvw"} className="rounded-lg"
                  component={Link}
                  // @ts-ignore
                  href={"/qr-code-generator"}
                  prefetch={true}
                >
                  <Group justify='space-between' align="stretch" grow gap={0} mah={500} wrap='nowrap'>
                    <Stack gap={0} miw={300}>
                      <Title order={2}>Qr Code Generator</Title>
                      <Box className="h-full  w-full">
                        <Text fz={13} >
                          This is a QR Code Generator. It allows you to create QR Codes with customizable options. You can save them to your account and share them with others.
                        </Text>
                      </Box>
                    </Stack>
                    <Group justify="end" align="center"  >
                      <AspectRatio ratio={1 / 1} maw={100} h={"auto"}  >
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
                          }} w={100} />
                      </AspectRatio>
                    </Group>
                  </Group>

                </Container>
                {/* Timezone Converter */}
                <Container bg={"rgba(255,255,255,0.1)"} p={20} size={"sm"} w={500} mah={180} mih={180} maw={"100dvw"} className="rounded-lg"
                  component={Link}
                  // @ts-ignore
                  href={"/timezone-converter"}
                  prefetch={true}
                >
                  <Group justify='space-between' align="stretch" grow gap={0} mah={500} wrap='nowrap'>
                    <Stack gap={0} miw={300} h={"100%"} >
                      <Title order={2}>Timezone Converter</Title>
                      <Box className="h-full  w-full">
                        <Text fz={13} >
                          This is a simple tool to convert time zones between different formats.
                          <Text c={"dimmed"} fz={13} component="span">
                            <br />
                            <br />
                            This page is still under development.
                          </Text>
                        </Text>
                      </Box>
                    </Stack>
                    <Group justify="end" align="center">
                      <AspectRatio ratio={1 / 1} maw={100} >
                        <Box h={"auto"} w={100} />
                      </AspectRatio>
                    </Group>
                  </Group>
                </Container>
                <Container bg={"rgba(255,255,255,0.1)"} p={20} size={"sm"} w={500} mah={180} mih={180} maw={"100dvw"} className="rounded-lg"
                  component={Link}
                  // @ts-ignore
                  href={"/cube-timer"}
                  prefetch={true}
                >
                  <Group justify='space-between' align="stretch" grow gap={0} mah={500} wrap='nowrap'>
                    <Stack gap={0} miw={300} h={"100%"} >
                      <Title order={2}>Cube Timer</Title>
                      <Box className="h-full  w-full">
                        <Text fz={13} >
                          A SpeedCubing timer. Generate scrambles, Calculate Averages and more.
                          <Text c={"dimmed"} fz={13} component="span">
                            <br />
                            <br />
                            This page is still under development.
                          </Text>
                        </Text>
                      </Box>
                    </Stack>
                    <Group justify="end" align="center">
                      <AspectRatio ratio={1 / 1} maw={100} >
                        {/* <Box h={"auto"} w={100} /> */}
                        <FontAwesomeIcon icon={faCube} size="10x" height={100} width={100} />

                      </AspectRatio>
                    </Group>
                  </Group>
                </Container>
              </Group>

              <Title order={3} ta={"center"}  >
                Other things i've build.
              </Title>
              <Group wrap="wrap" grow justify="center">



                {/* Qr Code Generator */}
                <Container bg={"rgba(255,255,255,0.1)"} p={15} size={"sm"} w={400} mah={180} mih={180} maw={"100dvw"}
                  className="rounded-lg"
                  component={Link}
                  // @ts-ignore
                  href={"/note-mark"}
                  prefetch={true}
                >

                  <Grid columns={10}>
                    <GridCol span={"auto"}>
                      <Stack gap={0} miw={300} h={"100%"} >
                        <Title order={2}>Note Mark</Title>
                        <Group h={"100%"} >
                          <Text fz={13} >
                            This is a simple desktop note taking app, utilizing the power of Markdown, Build with Electron. It has a fully fledged auto updater, Settings to customize the app, and a lot more.
                          </Text>
                          <Pill px={10} >
                            Windows
                          </Pill>
                        </Group>
                      </Stack>
                    </GridCol>
                    <GridCol span={"content"}>
                      <Group justify="end" align="center">
                        <AspectRatio ratio={1 / 1} maw={140} >
                          <Image src={"https://utfs.io/a/su1pkz07fn/2014oiRrVeB1t7fMixwJ27LFyhSB3HwRQKtoxC0ZVWauJqrP"} alt="Note Mark" height={140} width={140} />
                        </AspectRatio>
                      </Group>
                    </GridCol>
                    {/* <GridCol span={10}>

                    </GridCol> */}
                  </Grid>





                </Container>
              </Group>
              <Title order={3} ta={"center"}  >
                My Top Programming Languages
              </Title>
              <Group wrap="wrap" justify="center">

                <AspectRatio ratio={16 / 9} maw={"100%"} className="w-[25rem] self-center justify-center flex" >
                  <Link href="https://max809.de" >
                    <MantineImage src={`${!env.NEXTAUTH_URL.startsWith("https://") && env.NEXTAUTH_URL.startsWith("http://") ? env.NEXTAUTH_URL : `https://${env.NEXTAUTH_URL}`}/api/gh-stats/top-lang?layout=compact&hide=css&custom_title=M4X809's Top Languages&hide_border=true&langs_count=20`} alt="gh-stats" />
                  </Link>
                </AspectRatio>
              </Group>
            </Stack>
          </Center>
        </Stack>
      </Shell >
    </HydrateClient >
  )
}
