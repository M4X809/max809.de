"use client"

import { faDiscord, faGithub, faGoogle, faSpotify } from "@fortawesome/free-brands-svg-icons"
import { faEnvelope } from "@fortawesome/pro-duotone-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { ActionIcon, Button, TextInput } from "@mantine/core"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { set, z } from "zod"
import "./googleButton.css"




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

export const GoogleSignInButton = () => {
    const [loading, setLoading] = useState(false)
    return (
        <Button unstyled={!loading} loading={loading}
            h={"36px"}
            onClick={async () => {
                setLoading(true)
                await signIn("google")
            }} w={"auto"} className="gsi-material-button" >
            <div className="gsi-material-button-state" />
            <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                        <title>Google Logo</title>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
                <span style={{ display: "none" }}>Sign in with Google</span>
            </div>
        </Button>
    )
}