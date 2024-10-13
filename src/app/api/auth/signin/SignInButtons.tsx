"use client"

import { faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Button } from "@mantine/core"
import { signIn } from "next-auth/react"
import { useState } from "react"



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