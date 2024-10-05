

import "server-only"

import type { Metadata } from "next";
import { getServerAuthSession } from "~/server/auth";
import Shell from "~/app/_components/Shell";
import { Box, Center, Container, Group, Pill, Stack, Text, Title } from "@mantine/core";
import { HydrateClient } from "~/trpc/server";
import { getDomain } from "~/lib/utils";
import { env } from "~/env";
import { db } from "~/server/db";
import { Img } from "~/app/note-mark/_notemark-components/Img";
import ExampleInput from "./_emoji-components/ExampleInput";


function getRandomObjectEmoji(): string {
    const objectEmojis = [
        '📱', '💻', '📷', '🔑', '🎧', '🔨', '📚', '🎒', '🖼️', '✏️', '🖊️', '🔒', '🔧', '🔩', '🖥️', '🖱️',
        '📺', '📀', '💡', '🔋', '🔌', '🛏️', '🚪', '🚿', '🛁', '🪑', '🚽', '📦', '🗑️', '📅', '📂', '📇', '📎',
        '🗄️', '🗂️', '✂️', '📏', '📐', '🖇️', '🔗', '🔎', '🔬', '💼', '👜', '🛍️', '🎁', '🧳', '🏷️', '🛠️', '🧰',
        '🧲', '⛏️', '⚙️', '🧵', '🧶', '🪛', '🪚', '🔫', '💣', '🧯'
    ];

    const randomIndex = Math.floor(Math.random() * objectEmojis.length);

    return objectEmojis[randomIndex] as string;
}



export const revalidate = 60;
export const dynamic = "force-dynamic";


export async function generateMetadata(): Promise<Metadata> {

    const emoji = getRandomObjectEmoji();



    // get a random emoji

    // console.log("emoji", emoji);

    return {
        metadataBase: new URL('https://max809.de'),
        title: "Emoji Favicon",
        description: "A simple emoji favicon generator.",
        icons: [{ rel: "icon", url: `${getDomain(env.NEXTAUTH_URL)}/api/icon/${emoji}` }],
        openGraph: {
            title: "Emoji Favicon",
            description: "A simple emoji favicon generator.",
            images: [
                {
                    url: `${getDomain(env.NEXTAUTH_URL)}/api/icon/${emoji}`,
                    width: 1200,
                    height: 630,
                    alt: "emoji favicon",
                },
            ],
            type: "website",
            siteName: "emoji favicon",
            url: "https://max809.de/emoji-favicon",
            locale: "en_US",
        }
    }
}


export default async function EmojiFavicon() {
    const session = await getServerAuthSession();

    const topEmojis = await db.query.emojis.findMany({
        where: (emojis, { gt }) => gt(emojis.callCount, 0),
        orderBy: (emojis, { desc }) => desc(emojis.callCount),
    });


    const totalCalls = topEmojis.reduce((acc, cur) => acc + cur.callCount, 0);
    console.log("totalCalls", totalCalls);
    // console.log("topEmojis", topEmojis);

    return (
        <HydrateClient>
            <Shell
                title="Emoji Favicon API"
                redirect={"/"}
                session={session}
            >
                <Container fluid className="md:m-auto md:w-[1000px] h-full">
                    <Center>
                        <Stack justify="center" gap={2} ta={"center"} mb={15}>
                            <Title>
                                Top Emoji
                            </Title>
                            <Img className="flex self-center justify-center" imgType="mantine" src={`${getDomain(env.NEXTAUTH_URL)}/api/icon/${topEmojis[0]?.emoji ?? "👑"}`} alt="emoji favicon" ratio={1 / 1} width={50} />
                            {topEmojis.length > 0 && <Text c={"white"} className="text-center" mb={10} fz={20} ta={"center"} >
                                The {topEmojis[0]?.emoji} was requested {topEmojis[0]?.callCount} times.
                            </Text>}
                            {topEmojis.length === 0 && <Text c={"white"} className="text-center" mb={10} fz={20} ta={"center"} >
                                No Emojis were requested yet. Try using one of the examples below.
                            </Text>}

                            <Text c={"white"} className="text-center" mb={10} fz={18} ta={"center"} >
                                Total Emoji Calls: {totalCalls ?? 0}
                            </Text>

                        </Stack>
                    </Center>
                    <Container className="gap-2 flex md:max-w-1/2 flex-wrap items-center " >
                        {topEmojis.map((emoji) => {
                            return (
                                <Pill key={emoji.id} size="xl" radius={"sm"}
                                    className="bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.12)] text-white min-w-[100px]"
                                    classNames={{
                                        label: "flex"
                                    }}
                                >
                                    <Box p={0} className="flex-nowrap w-fit flex self-center items-center gap-2" >
                                        <Title order={4}>{emoji.emoji}</Title>
                                        <Text  >
                                            {emoji.callCount}x
                                        </Text>
                                    </Box>
                                </Pill>
                            )
                        })}
                    </Container>
                    {/* <Container size={"xl"} className="min-w-[500px] "> */}
                    <ExampleInput
                        url={getDomain()}
                    />

                    {/* </Container> */}
                </Container>

            </Shell>
        </HydrateClient>
    )
}