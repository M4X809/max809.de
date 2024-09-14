"use server"
import { AspectRatio, Center, Stack, Text, Title } from "@mantine/core"
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
    await api.codes.uploadQrCodeImage({ id: params.id })
    // console.log("head", migrateCode)



    return {
        metadataBase: new URL('https://max809.de'),

        title: `QR Code Generator - ${code?.name}`,
        description: `QR Generated by ${code?.createdBy || "Unknown"}`,
        icons: [{ rel: "icon", url: code?.imageKey ? `https://utfs.io/a/su1pkz07fn/${code.imageKey}` : "/favicon-qr.webp", }],
        openGraph: {
            title: `QR Code Generator - ${code?.name}`,
            description: `QR Generated by ${code?.createdBy || "Unknown"}`,
            images: [
                {
                    url: code?.imageKey ? `https://utfs.io/a/su1pkz07fn/${code.imageKey}` : "/favicon-qr.webp",
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
    await api.codes.uploadQrCodeImage({ id: params.id })
    // console.log(migrateCode)

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
        <Center className="h-screen w-screen bg-gradient-to-tr from-[#06080f] to-[#122b69] text-white select-none">
            <Stack gap={0}>

                <Title>QR Code</Title>
                <Text c={"dimmed"} component="span" > Name: {code.name}</Text>
                <Text mb={20} c={"dimmed"} component="span" > Created by: {code.createdBy}</Text>

                {!!code.imageKey &&
                    <>
                        <AspectRatio ratio={1 / 1} maw={400} >
                            <Image priority loading="eager" quality={100} className="flex self-center" src={`https://utfs.io/a/su1pkz07fn/${code.imageKey}`} alt={`${code.name}-${code.createdBy}`} width={400} height={400} />
                        </AspectRatio>
                        <Link prefetch href={"/qr-code-generator"} className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20 text-nowrap mt-10 flex justify-center" >
                            Return to QR Code Generator
                        </Link>
                    </>
                }
                {!code.imageKey &&
                    <Text>
                        No QR Code data found, this may be because the QR Code was created before this feature was added.
                    </Text>}
            </Stack>
        </Center>
    )
}