import type { Metadata } from "next";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
    return {
        metadataBase: new URL('https://max809.de'),

        title: "Note Mark",
        description: "A simple desktop note taking app, utilizing the power of Markdown, Build with Electron.",
        icons: [{ rel: "icon", url: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1t7fMixwJ27LFyhSB3HwRQKtoxC0ZVWauJqrP" }],
        openGraph: {
            title: "Note Mark",
            description: "A simple desktop note taking app, utilizing the power of Markdown, Build with Electron.",
            images: [
                {
                    url: "https://utfs.io/a/su1pkz07fn/2014oiRrVeB1t7fMixwJ27LFyhSB3HwRQKtoxC0ZVWauJqrP",
                    width: 579,
                    height: 579,
                    alt: "note mark icon",
                },
            ],
            type: "website",
            siteName: "max809.de",
            url: "https://max809.de/r/nm",
            locale: "en_US",
        }
    }
}

export const dynamic = 'force-dynamic'

export default async function NoteMarkRedirect() {
    redirect("/note-mark")
}