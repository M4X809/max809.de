"use client"

import { Button, type ButtonProps } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";

export const AuthButton = ({ session, ...props }: { session: Session | null, props?: ButtonProps }) => {
    const [confirmSignOut, setConfirmSignOut] = useState(false)
    const { start, clear } = useTimeout(() => {
        setConfirmSignOut(false)
    }, 1500)
    const posthog = usePostHog()
    return (
        <Button
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
            className="rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20 text-nowrap h-full"
        >
            {session ? confirmSignOut ? "Confirm Sign Out" : `Sign out: ${session.user?.name}` : "Sign in"}
        </Button>
    );

}