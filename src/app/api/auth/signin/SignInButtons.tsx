"use client"

import { faDiscord, faGithub, faSpotify } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, Button, TextInput } from "@mantine/core"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { set, z } from "zod"



export const DiscordSignInButton = () => {
    const [loading, setLoading] = useState(false)


    return (
        <Button
            onClick={async () => {
                setLoading(true)
                await signIn("discord")
                // setLoading(false)
            }}
            loading={loading}
            className="bg-[#5865F2] hover:bg-[#5865F2]/80 text-white"


            leftSection={<FontAwesomeIcon fixedWidth fontSize={20} icon={faDiscord} />}
        >
            Sign in with Discord
        </Button>
    )
}
export const GitHubSignInButton = () => {
    const [loading, setLoading] = useState(false)
    return (
        <Button
            loading={loading}
            onClick={async () => {
                setLoading(true)
                await signIn("github")
                // setLoading(false)
            }}

            className="bg-[#24292F] hover:bg-[#2c3239] text-white"

            // color="#FFFFFF"
            // variant="light"
            leftSection={<FontAwesomeIcon fixedWidth fontSize={20} icon={faGithub} />}>
            Sign in with GitHub
        </Button>
    )
}
export const SpotifySignInButton = () => {
    const [loading, setLoading] = useState(false)
    return (
        <Button
            loading={loading}
            onClick={async () => {
                setLoading(true)
                await signIn("spotify")
                // setLoading(false)
            }}

            className="bg-[#121212] hover:bg-[#151515] text-[#1ED760] hover:text-[#1ED760f0]"

            // color="#FFFFFF"
            // variant="light"
            leftSection={<FontAwesomeIcon fixedWidth fontSize={20} icon={faSpotify} />}>
            Sign in with Spotify
        </Button>
    )
}
export const EmailSignInButton = () => {
    const [loading, setLoading] = useState(false)
    const [email, setEmail] = useState("")
    const [error, setError] = useState<string | null>(null)

    return (
        <form>
            <TextInput
                id={"input-email-for-email-provider"}
                type="email"
                name="email"
                placeholder="email@example.com"
                styles={{
                    wrapper: {
                        background: "transparent",
                    },
                    input: {
                        background: "rgba(255,255,255,0.05)",
                    }
                }}
                value={email}
                onBlur={() => {
                    const isEmail = z.string().email().safeParse(email)
                    if (isEmail.error && email.length > 0) {
                        setError("Invalid Email")
                        return
                    }
                    setError(null)



                }}
                onChange={(e) => {
                    const isEmail = z.string().email().safeParse(e.target.value)
                    if (isEmail.success) {
                        setError(null)
                    }

                    setEmail(e.target.value)
                }}
                error={error}
                label="Sing in with Email"
                description={"Only available to existing accounts (Sign in)"}
                rightSection={
                    <ActionIcon
                        loading={loading}
                        onClick={async () => {
                            const isEmail = z.string().email().safeParse(email)
                            if (!isEmail.success) {
                                setError("Invalid Email")
                                return
                            }
                            setLoading(true)

                            await signIn("email", {
                                email,
                            })
                        }}
                        variant="light"
                    >
                        <FontAwesomeIcon fixedWidth fontSize={20} icon={faEnvelope} />
                    </ActionIcon>
                }
            />
        </form>
    )
}