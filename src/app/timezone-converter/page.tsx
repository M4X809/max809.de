import type { Metadata } from "next";
import { HydrateClient } from "~/trpc/server";
import Shell from "../_components/Shell";
import { getServerAuthSession } from "~/server/auth";
import { Center, Group, Stack, Title } from "@mantine/core";
import { AuthButton } from "../_components/AuthButton";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
    return {
        metadataBase: new URL('https://max809.de'),

        title: "Timezone Converter",
        description: "A simple tool to convert time zones between different formats.",
        icons: [{ rel: "icon", url: "/max809.webp" }],
        openGraph: {
            title: "Timezone Converter",
            description: "A simple tool to convert time zones between different formats.",
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


export default async function TimezoneConverter() {
    const session = await getServerAuthSession();
    return (
        <HydrateClient>
            <Shell session={session}
                title="Timezone Converter"
                redirect={"/"}
                withLoginButton={true}
            >
                <Center className="h-[calc(100dvh-100px)] w-full">
                    <Stack>
                        <Title ta={"center"}>
                            Timezone Converter
                        </Title>
                        <Title order={3} ta={"center"}>
                            This page is under development. <br />
                        </Title>
                        <Link prefetch href={"/qr-code-generator"} className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20 text-nowrap mt-10 flex justify-center" >
                            Check out the QR Code Generator
                        </Link>
                    </Stack>
                </Center>

            </Shell> </HydrateClient>
    )
}

