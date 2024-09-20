import { redirect, RedirectType } from "next/navigation";

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
            url: "https://max809.de/r/qr",
            locale: "en_US",
        }
    }
}


export default async function QrCodeGeneratorRedirect() {
    redirect("/qr-code-generator", RedirectType.replace)
}