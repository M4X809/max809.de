"use client"

import { Button, type ButtonProps } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const AuthButton = ({ session, ...props }: { session: Session | null | undefined, props?: ButtonProps }) => {
    const [confirmSignOut, setConfirmSignOut] = useState(false)
    const { start, clear } = useTimeout(() => {
        setConfirmSignOut(false)
    }, 3000)
    const posthog = usePostHog()
    return (
        <Button
            tabIndex={-1}
            {...props}
            unstyled
            onClick={async () => {
                if (session) {
                    if (confirmSignOut) {
                        posthog.capture("sign-out", { distinctId: session.user.id })
                        await signOut()
                        clear()
                    } else {
                        start()
                        setConfirmSignOut(true)
                    }
                } else {
                    await signIn()
                }
            }}
            className={twMerge("rounded-full bg-white/10 px-8 py-2 font-semibold no-underline  hover:bg-white/20 text-nowrap h-full transition-colors duration-700 ", confirmSignOut ? " bg-blue-500 hover:bg-blue-500 " : "")}
        >
            {session ? confirmSignOut ? "Confirm Sign Out" : `Sign out: ${session.user?.name}` : "Sign in"}
        </Button>
    );

}