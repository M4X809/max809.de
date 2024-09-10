import { Center, Container, Divider, Group, Stack, Title } from "@mantine/core";
import Link from "next/link";
// import { LatestPost } from "~/app/_components/post";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Shell from "~/app/_components/Shell";

import QrCodeContainer from "~/app/_components/QrCodeContainer";
import SavedCodes from "~/app/_components/ServerSavedCodes";
import { Suspense } from "react";
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
