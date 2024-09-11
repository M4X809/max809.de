"use server"
import { Center, Stack, Text, Title } from "@mantine/core"
import { TRPCError } from "@trpc/server"
import type { Metadata, ResolvingMetadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"
import { api } from "~/trpc/server"

interface Props {
    params: {
        id: string
    }
}


export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {


    const code = await api.codes.getQrCodeWithID(params.id)

    if (code instanceof TRPCError) {
        return {
            metadataBase: new URL('https://max809.de'),
            title: "Qr Code Generator",
            description: "Private QR Code, only accessible by the creator.",
            icons: [{ rel: "icon", url: "/favicon-qr.webp" }],
            openGraph: {
                title: "Qr Code Generator",
                description: "Private QR Code, only accessible by the creator.",
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


    // // read route params
    // const id = params.id

    // // fetch data
    // const product = await fetch(`https://.../${id}`).then((res) => res.json())

    // // optionally access and extend (rather than replace) parent metadata
    // const previousImages = (await parent).openGraph?.images || []

    return {
        metadataBase: new URL('https://max809.de'),

        title: "Qr Code Generator",
        description: `QR Code Generator by ${code?.createdBy || "Unknown"}`,
        icons: [{ rel: "icon", url: "/favicon-qr.webp" }],
        openGraph: {
            title: "Qr Code Generator",
            description: `QR Code Generator by ${code?.createdBy || "Unknown"}`,
            images: [
                {
                    url: code?.dataUrl || "/favicon-qr.webp",
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



export default async function Page({ params }: Props) {
    if (!params.id) {
        redirect("/qr-code-generator")
    }

    const code = await api.codes.getQrCodeWithID(params.id)

    if (!code) {
        redirect("/qr-code-generator")
    }

    if (code instanceof TRPCError) {
        return (
            <Center className="h-screen w-screen bg-gradient-to-tr from-[#06080f] to-[#122b69] text-white">
                <Stack gap={0}>
                    <Title>QR Code</Title>

                    <Text>
                        This QR Code is not publicly accessible.
                    </Text>
                    <Link prefetch={true} href={"/qr-code-generator"} className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20 text-nowrap mt-10" >
                        Return to QR Code Generator
                    </Link>
                </Stack>
            </Center>
        )
    }




    // console.log(code)

    return (
        <Center className="h-screen w-screen bg-gradient-to-tr from-[#06080f] to-[#122b69] text-white">
            <Stack gap={0}>

                <Title>QR Code</Title>
                <Text c={"dimmed"} component="span" > Name: {code.name}</Text>
                <Text mb={30} c={"dimmed"} component="span" > Created by: {code.createdBy}</Text>
                {!!code.dataUrl && <Image className="flex self-center" src={code.dataUrl} alt="qr-code" width={400} height={400} />}
                {!code.dataUrl &&
                    <Text>
                        No QR Code data found, this may be because the QR Code was created before this feature was added.
                    </Text>}
            </Stack>
        </Center>
    )
}