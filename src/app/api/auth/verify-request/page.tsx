import { faArrowLeft } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Stack, Center, Avatar, Title, Button, Box } from "@mantine/core"
import Link from "next/link"
import Shell from "~/app/_components/Shell"
import { HydrateClient } from "~/trpc/server"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerAuthSession } from "~/server/auth"



export const generateMetadata = (): Metadata => {
    return {
        metadataBase: new URL('https://max809.de'),
        title: "Verify Sign In - Sign In to max809.de",
        icons: [{ rel: "icon", url: "/max809.webp" }],
        openGraph: {
            title: "Verify Sign In - Sign In to max809.de",
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

export default async function ErrorPage() {
    const session = await getServerAuthSession()
    if (session?.user.id) {
        return redirect("/")
    }

    return (
        <HydrateClient>
            <Shell
                forceHideHeader

                withLoginButton={false}
                withHomeButton={false}
                withDashboardButton={false}
                title="Sign In"
                redirect={"/"}
                session={undefined}
            >
                <Stack
                    className="m-auto bg-[rgba(255,255,255,0.1)] rounded-xl px-5 pt-10 backdrop-blur-xl w-80  h-fit"
                >
                    <Center >
                        <Avatar src={"/max809.webp"} radius={"xl"} size={"xl"} />
                    </Center>
                    <Title order={3} ta={"center"}  >
                        Verify Sign In
                    </Title>
                    <Box
                        w={"100%"}
                        style={{ borderRadius: "5px" }}
                        p={"sm"}
                        ta={"center"}
                    >
                        Check your email inbox for the signin link. <br />
                        The link will expire in 1 hour.
                    </Box>
                    <Center>
                        <Stack>
                            <Button
                                size="compact-sm"
                                component={Link}
                                href={"/api/auth/signin"}
                                className="bg-white/10 hover:bg-white/20 text-white"
                                leftSection={<FontAwesomeIcon fixedWidth icon={faArrowLeft} />}
                            >
                                Back to Login
                            </Button>
                        </Stack>
                    </Center>
                    <Box />
                </Stack>
            </Shell>
        </HydrateClient>
    )
}