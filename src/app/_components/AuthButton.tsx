"use client"

import { Button, type ButtonProps } from "@mantine/core";
import { useTimeout } from "@mantine/hooks";
import type { Session } from "next-auth";
import { signIn, signOut } from "next-auth/react";
import { usePostHog } from "posthog-js/react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

export const AuthButton = ({ session, onlySignIn = false, ...props }: { session: Session | null | undefined, onlySignIn?: boolean, props?: Omit<ButtonProps, "children" | "onClick" | "className" | "unstyled" | "tabIndex"> }) => {
    const [confirmSignOut, setConfirmSignOut] = useState(false)
    const { start, clear } = useTimeout(() => {
        setConfirmSignOut(false)
    }, 3000)
    const posthog = usePostHog()
    if (onlySignIn && session?.user.id) return <></>

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
            className={twMerge("rounded-full bg-white/10 px-8 py-2 font-semibold no-underline  hover:bg-white/20 text-nowrap h-full transition-colors duration-500 ", confirmSignOut ? " bg-blue-500 hover:bg-blue-500 " : "")}
        >
            {session ? confirmSignOut ? "Confirm Sign Out" : `Sign out: ${session.user?.name}` : "Sign in"}
        </Button>
    );

}