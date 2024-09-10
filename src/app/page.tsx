import { Center, Container, Divider, Grid, GridCol, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
// import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Shell from "./_components/Shell";

import QrCodePreview, { QrCodeData } from "./_components/QrCodePreview";



export default async function Home() {




  const session = await getServerAuthSession();

  // if (session) {
  //   redirect("/generator");
  // }



  // void api.post.getLatest.prefetch();

  // return (
  //   <HydrateClient>
  //     <Shell
  //       session={session}
  //     >
  //       <Group justify="space-between">
  //         <Title>
  //           QR Code Generator
  //         </Title>
  //         <Link
  //           href={session ? "/api/auth/signout" : "/api/auth/signin"}
  //           className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20"
  //         >
  //           {session ? `Sign out: ${session.user?.name}` : "Sign in"}
  //         </Link>
  //       </Group>
  //       <QrCodeContainer />

  //       {/* <Suspense> */}

  //       <Stack mt={20} >
  //         <Divider />
  //         <Title ta={"center"} order={2}>Saved QR Codes</Title>

  //         <Group wrap="wrap" grow justify="center">
  //           <SavedCodes />
  //         </Group>

  //       </Stack>

  //       {/* </Suspense> */}




  //     </Shell>
  //   </HydrateClient>
  // );



  return (
    <HydrateClient>
      <Shell session={session}>
        <Group justify="space-between">
          <Title>
            max809.de
          </Title>
          <Link
            href={session ? "/api/auth/signout" : "/api/auth/signin"}
            className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20"
          >
            {session ? `Sign out: ${session.user?.name}` : "Sign in"}
          </Link>
        </Group>
        <Stack>
          <Center>
            <Stack >
              <Title ta={"center"} order={1} fz={50}>Welcome to my Site. </Title>
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
