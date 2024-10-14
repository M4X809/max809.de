import { Avatar, Box, Button, Center, Stack, Title } from "@mantine/core";
import Shell from "~/app/_components/Shell";
import { HydrateClient } from "~/trpc/server";
import { DiscordSignInButton, GitHubSignInButton, SpotifySignInButton } from "./SignInButtons";
import { searchParamsCache } from '../searchParams'
import ErrorBox from "~/app/_components/ErrorBox";
import type { Metadata } from "next";
import Link from "next/link";
import { faArrowLeft } from "@fortawesome/pro-duotone-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getServerAuthSession } from "~/server/auth";
import { redirect } from "next/navigation";


export const metadata: Metadata = {
    metadataBase: new URL('https://max809.de'),
    title: "Sign In to max809.de",
    icons: [{ rel: "icon", url: "/max809.webp" }],
    openGraph: {
        title: "Sign In",
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


export default async function SignIn({
    searchParams
}: {
    searchParams: Record<string, string | string[] | undefined>
}) {
    const { error, callbackUrl } = searchParamsCache.parse(searchParams)

    const session = await getServerAuthSession()


    if (session?.user.id && !error) {
        return redirect(callbackUrl.length > 0 ? callbackUrl : "/")
    }





    const signinErrors: Record<string | "default", string> = {
        default: "Unable to sign in.",
        Signin: "Try signing in with a different account.",
        OAuthSignin: "Try signing in with a different account.",
        OAuthCallbackError: "Try signing in with a different account.",
        OAuthCreateAccount: "Try signing in with a different account.",
        EmailCreateAccount: "Try signing in with a different account.",
        Callback: "Try signing in with a different account.",
        OAuthAccountNotLinked:
            "To confirm your identity, sign in with the same account you used originally.",
        EmailSignin: "The e-mail could not be sent.",
        CredentialsSignin:
            "Sign in failed. Check the details you provided are correct.",
        SessionRequired: "Please sign in to access this page.",
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
                    className="m-auto bg-[rgba(255,255,255,0.1)] rounded-xl px-5 pt-10 backdrop-blur-xl w-80 h-fit"
                >
                    <Center >
                        <Avatar src={"/max809.webp"} radius={"xl"} size={"xl"} />
                    </Center>
                    <Title order={3} ta={"center"}  >
                        Sign In to max809.de
                    </Title>
                    <Center>
                        <Stack>
                            <DiscordSignInButton />
                            <GitHubSignInButton />
                            <SpotifySignInButton />
                            <Button
                                size="compact-sm"
                                component={Link}
                                href={"/"}
                                className="bg-white/10 hover:bg-white/20 text-white"
                                leftSection={<FontAwesomeIcon fixedWidth icon={faArrowLeft} />}
                            >
                                Back to Homepage
                            </Button>
                        </Stack>
                    </Center>
                    <ErrorBox ta={"center"} fz={15} value={signinErrors[error] ?? signinErrors.default} visible={!!error} />
                    <Box />
                </Stack>
            </Shell>
        </HydrateClient>
    )
}