import type { Metadata } from "next";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Shell from "~/app/_components/Shell";
import { MainTimer } from "./_cube-timer-components/MainTimer";
// import CubeTimerContainer from "./_cube-timer-components/CubeTimerContainer";
import { Box, Center, Grid, GridCol, Stack, Text, Title } from "@mantine/core";
import { twMerge } from "tailwind-merge";
import CubeScrambleBox from "./_cube-timer-components/CubeScrambleBox";
import CubeTimerHistory from "./_cube-timer-components/CubeTimerHistory";
import { AuthButton } from "~/app/_components/AuthButton";
import type { CubeHistory } from "./_cubeTimerTypes";
import CubeTimerStats from "./_cube-timer-components/CubeTimerStats";
import CubeSignIn from "./_cube-timer-components/CubeSignIn";



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
    let history: CubeHistory | undefined = undefined
    if (session?.user.id) {
        history = await api.cube.getCubeTimeHistory({ cubeSize: "333", page: 1 })
    }
    return (
        <HydrateClient>
            <Shell session={session}
                title="Cube Timer"
                redirect={"/"}
                withLoginButton
            >
                <Box className="flex flex-col flex-grow">
                    <Grid columns={9} mt={20} className="flex flex-col flex-grow"
                        classNames={{
                            inner: "flex-grow",
                        }}
                    >
                        <GridCol span={{ base: 9, md: 2.75 }} order={{ base: 3, md: 1 }}>
                            {!!session?.user.id &&
                                <CubeTimerHistory
                                    history={history}
                                    className={twMerge("transition-opacity duration-500 h-full")}
                                />
                            }
                            {!session?.user.id && <CubeSignIn session={session} />}
                        </GridCol>
                        <GridCol span={{ base: 9, md: 3.5 }} order={{ base: 1, md: 2 }} className={"flex flex-col h-auto"}>
                            <MainTimer session={session} />
                        </GridCol>
                        <GridCol span={{ base: 9, md: 2.75 }} order={{ base: 1, md: 3 }}>
                            <Stack className="max-h-[calc(100dvh-100px)] flex flex-col h-full">
                                <CubeScrambleBox className={twMerge("transition-opacity duration-500 overflow-auto max-h-[50%] ")} />
                                <CubeTimerStats session={session} className={twMerge("transition-opacity duration-500 overflow-auto max-h-[50%]")} />
                            </Stack>
                        </GridCol>
                    </Grid>
                </Box>
            </Shell>
        </HydrateClient>
    )
}

