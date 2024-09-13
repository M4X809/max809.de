import Shell from "~/app/_components/Shell";

import type { Metadata } from "next"
import { getServerAuthSession } from "~/server/auth";





export async function generateMetadata(): Promise<Metadata> {
    return {
        metadataBase: new URL('https://max809.de'),
        title: "Color Picker",
        description: "A simple color picker with customizable options.",
        icons: [{ rel: "icon", url: "/favicon-qr.webp" }],
        openGraph: {
            title: "Color Picker",
            description: "A simple color picker with customizable options.",
            images: [
                {
                    url: "/favicon-qr.webp",
                    width: 1200,
                    height: 630,
                    alt: "Qr Code Generator",
                },
            ],
            type: "website",
            siteName: "Color Picker",
            url: "https://max809.de/color-picker",
            locale: "en_US",
        }
    }
}


export default async function ColorPicker() {
    const session = await getServerAuthSession();

    return (
        <>
            <Shell
                session={session}
            >
                <div>Color Picker</div>
            </Shell>
        </>
    )
}
