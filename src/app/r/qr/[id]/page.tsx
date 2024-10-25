import { TRPCError } from "@trpc/server"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { api } from "~/trpc/server"

interface Props {
    params: Promise<{
        id: string
    }>
}

export async function generateMetadata(
    { params }: Props,
): Promise<Metadata> {
    const { id } = await params

    const code = await api.codes.getQrCodeWithID(id)
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
                url: "https://max809.de/r/qr",
                locale: "en_US",
            }
        }
    }
    return {
        metadataBase: new URL('https://max809.de'),
        title: `QR Code Generator - ${code?.name}`,
        description: `Generated by ${code?.createdBy || "Unknown"}`,
        icons: [{ rel: "icon", url: code?.imageKey ? `https://utfs.io/a/su1pkz07fn/${code.imageKey}` : "/favicon-qr.webp", }],
        openGraph: {
            title: `QR Code Generator - ${code?.name}`,
            description: `Generated by ${code?.createdBy || "Unknown"}`,
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
            url: `https://max809.de/r/qr${code?.id ? `/${code.id}` : ""}`,
            locale: "en_US",
        }
    }
}


export default async function QRCodeGeneratorRedirect({ params }: Props) {
    const { id } = await params
    if (!id) {
        redirect("/qr-code-generator")
    }
    return redirect(`/qr-code-generator/${id}`)
}