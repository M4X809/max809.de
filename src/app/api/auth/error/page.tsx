import { faArrowLeft } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Stack, Center, Avatar, Title, Button, Box } from "@mantine/core"
import Link from "next/link"
import ErrorBox from "~/app/_components/ErrorBox"
import Shell from "~/app/_components/Shell"
import { HydrateClient } from "~/trpc/server"
import { searchParamsCache } from "../searchParams"
import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { getServerAuthSession } from "~/server/auth"

const signinErrors = {
    default: {
        title: "Sign In Error",
        description: "Unable to sign in.",

    },
    Configuration: {
        title: "Server Error",
        description: "Unable to sign in. There is a problem with the server configuration.",
    },
    AccessDenied: {
        title: "Access Denied",
        description: "Your account is not authorized to login.",
    },
    Verification: {
        title: "Unable to sign in",
        description: "The sign in link is no longer valid. It may have been used already or it may have expired.",
    },
}



export const generateMetadata = ({ params }: { params: Record<string, string | string[] | undefined> }): Metadata => {

    const { error } = searchParamsCache.all()

    const currentError = error ? signinErrors[error as keyof typeof signinErrors] : signinErrors.default


    return {
        metadataBase: new URL('https://max809.de'),
        title: `${currentError.title} - Sign In to max809.de`,
        icons: [{ rel: "icon", url: "/max809.webp" }],
        openGraph: {
            title: `${currentError.title}`,
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







export default async function ErrorPage({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }
) {
    const { error } = searchParamsCache.parse(searchParams)
    const session = await getServerAuthSession()
    if (session?.user.id) {
        return redirect("/")
    }

    const currentError = error ? signinErrors[error as keyof typeof signinErrors] : signinErrors.default

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
                        {currentError.title}
                    </Title>
                    <ErrorBox ta={"center"} fz={15} value={currentError.description} visible={!!error} />
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