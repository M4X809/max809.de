import type { Metadata } from "next";
import { getServerAuthSession } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";
import Shell from "../_components/Shell";
import { MainTimer } from "./_cube-timer-components/MainTimer";

export async function generateMetadata(): Promise<Metadata> {
    return {
        metadataBase: new URL('https://max809.de'),

        title: "SpeedCube Timer",
        description: "A SpeedCubing timer. Generate scrambles, Calculate Averages and more.",
        icons: [{ rel: "icon", url: "/max809.webp" }],
        openGraph: {
            title: "SpeedCube Timer",
            description: "A SpeedCubing timer. Generate scrambles, Calculate Averages and more.",
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
            url: "https://max809.de/cube-timer",
            locale: "en_US",
        }
    }
}








export default async function CubeTimer() {
    const session = await getServerAuthSession();


    return (
        <HydrateClient>
            <Shell session={session}
                title="Cube Timer"
                redirect={"/"}
                withLoginButton
            >
                <MainTimer />
            </Shell>
        </HydrateClient>
    )
}

