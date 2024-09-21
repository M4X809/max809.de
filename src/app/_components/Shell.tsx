"use client"

import { AppShell, type AppShellProps, Box, Button, Dialog, Group, Stack, Text, Title } from '@mantine/core'
import type { Session } from 'next-auth';
import React, { useEffect } from 'react'
import { useAppStore } from '~/providers/app-store-provider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faHeart } from '@fortawesome/pro-duotone-svg-icons'

import pkg from "~/../package.json";
import { usePostHog } from 'posthog-js/react';
import { usePathname } from 'next/navigation';
import { trackingStore } from '~/stores/tracking-store';
import { AuthButton } from './AuthButton';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';


function Shell({ children, session, title = "SetMe", redirect, withLoginButton, ...props }: Omit<AppShellProps, "padding" | "navbar"> & { session?: Session | null | undefined, title?: string, redirect?: string | boolean, withLoginButton?: boolean }) {
    const posthog = usePostHog()
    const path = usePathname()
    posthog.capture('page_view', { path: path })

    const trackingBanner = trackingStore((state) => state.trackingBanner)
    const setTrackingBanner = trackingStore((state) => state.setTrackingBanner)


    const setSession = useAppStore((state) => state.setSession)

    const hideHeader = useAppStore((state) => state.hideHeader)

    const debugPosthog = posthog.isFeatureEnabled("debug-posthog", {
        send_event: true,
    })

    useEffect(() => {
        if (!session) return
        setSession(session)
        posthog.identify(session?.user?.id)

    }, [session, setSession, posthog])

    useEffect(() => {
        if (debugPosthog) {
            posthog.debug(true)
        } else {
            if (window.localStorage.getItem("ph_debug") === "true") {

                posthog.debug(false)
            }
        }
    }, [debugPosthog, posthog.debug])

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        window.addEventListener("beforeunload", () => {
            posthog.debug(false)
            window.localStorage.setItem("ph_debug", "false")
        });

        return () => {
            window.removeEventListener("beforeunload", () => {
                posthog.debug(false)
                window.localStorage.setItem("ph_debug", "false")
            });
        };
    }, [])

    return (
        <>
            <Box className='relative min-h-[calc(100vh-40px)] mb-[calc(2rem*var(--mantine-scale))] z-1 ' style={{
                zIndex: "1",
            }} >
                <div className="flex min-h-screen min-w-full flex-col  justify-center bg-gradient-to-tr from-[#06080f] to-[#122b69]  text-white z-1 " >
                    <AppShell
                        navbar={{
                            width: 300,
                            breakpoint: 'sm',
                            collapsed: { mobile: true, desktop: true },
                        }}
                        padding="md"
                        {...props}
                    >
                        <AppShell.Main  >
                            {/* {!timerRunning &&  */}
                            <Group justify="space-between" align="center" className={twMerge("select-none transition-opacity duration-500", hideHeader && "opacity-0")}  >
                                <Stack gap={0}>
                                    {!!redirect && <Link href={redirect.toString()} >
                                        <Title>
                                            {title}
                                        </Title>
                                    </Link>}
                                    {!redirect && <Title>
                                        {title}
                                    </Title>}
                                </Stack>
                                {withLoginButton && <AuthButton session={session} />}
                            </Group>
                            {/* // } */}
                            {children}
                        </AppShell.Main>
                    </AppShell>
                </div>

            </Box>
            <Box
                style={{ zIndex: "revert-layer" }}
                className='h-[calc(2rem*var(--mantine-scale))] fixed bottom-0 left-0 right-0 z-0  bg-gradient-to-br from-[#06080f] to-[#122b69] '>
                <Group h={"100%"} align='center' justify='space-between' px={10} >
                    <Text c={"dimmed"} fz={13}>
                        Made with <Text component='span' c={"#ff0000"} > <FontAwesomeIcon icon={faHeart} /></Text> by <Text fz={13} c={"blue"} component="a" href='https://github.com/m4x809' target='_blank' td={"underline"} >@M4X809</Text>
                    </Text>
                    <Text fz={13} c={"dimmed"} component='span'> Version: {pkg.version} </Text>
                    <Text c={"dimmed"} ta={"right"} fz={13} component="a" target='_blank' href='https://github.com/m4x809/max809.de' td={"underline"}>
                        Source code on <Text c={"blue"} component='span' px={3} ><FontAwesomeIcon color='white' icon={faGithub} /></Text>
                    </Text>
                </Group>
            </Box>
            <Dialog
                transitionProps={{ transition: "slide-left", duration: 500 }}
                w={600}
                className='bg-gradient-to-tr from-[#222840] to-[#2347a1] text-white'
                withBorder
                opened={trackingBanner} withCloseButton onClose={() => setTrackingBanner(false)} size="lg" radius="md">
                <Text size="sm" mb="xs" fw={500}>
                    Cookies and Analytics
                </Text>
                <Text fz={13} mb="xs">
                    This website uses cookies and analytics to improve your experience and are necessary for the website to function properly. <br /> By using this website, you agree to the use of cookies and analytics.
                </Text>
                <Button onClick={() => setTrackingBanner(false)} fullWidth size='compact-xs'>
                    OK
                </Button>
            </Dialog>
        </>
    )
}

export default Shell