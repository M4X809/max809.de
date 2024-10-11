"use client"

import { AppShell, type AppShellProps, Box, Button, Dialog, Group, Stack, Text, Title } from '@mantine/core'
import type { Session } from 'next-auth';
import React, { useEffect } from 'react'
import { useAppStore } from '~/providers/app-store-provider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faHeart, faHome, faScrewdriverWrench } from '@fortawesome/pro-duotone-svg-icons'

import pkg from "~/../package.json";
import { usePostHog } from 'posthog-js/react';
import { usePathname } from 'next/navigation';
import { trackingStore } from '~/stores/tracking-store';
import { AuthButton } from './AuthButton';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';
import { useDidUpdate, useMounted, useOs } from '@mantine/hooks';
import { PhotoProvider } from 'react-photo-view';
import { useIsStaff } from '../../lib/cUtils';
import ErrorBox from './ErrorBox';


function Shell({ children, session, title = "SetMe", redirect = false, withLoginButton, withDashboardButton = true, withHomeButton = false, ...props }: Omit<AppShellProps, "padding" | "navbar"> & { session?: Session | null | undefined, title?: string, redirect?: string | boolean, withLoginButton?: boolean, withDashboardButton?: boolean, withHomeButton?: boolean }) {
    const posthog = usePostHog()
    const path = usePathname()
    const os = useOs()

    const isStaff = useIsStaff(session)

    posthog.capture('page_view', { path: path })

    const trackingBanner = trackingStore((state) => state.trackingBanner)
    const setTrackingBanner = trackingStore((state) => state.setTrackingBanner)

    const setOs = useAppStore((state) => state.setOs)

    const hideHeader = useAppStore((state) => state.hideHeader)
    const setSession = useAppStore((state) => state.setSession)
    const refreshSession = useAppStore((state) => state.refreshSession)
    const isMounted = useMounted()


    const debugPosthog = posthog.isFeatureEnabled("debug-posthog", {
        send_event: true,
    })

    // useDidUpdate(() => {
    //     if (!isMounted) return
    //     refreshSession()
    //     console.log("session", session)
    // }, [isMounted, session])




    useEffect(() => {
        if (!session) return
        setSession(session)
        posthog.identify(session?.user?.id)

    }, [session, setSession, posthog])

    useEffect(() => {
        if (os === "undetermined") return
        setOs(os)
    }, [os, setOs])

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
            <PhotoProvider>
                <Box className='w-[-webkit-fill-available] relative min-h-[calc(100vh-40px)] mb-[calc(2rem*var(--mantine-scale))] z-1 bg-gradient-to-tr from-[#06080f] to-[#122b69] ' style={{
                    zIndex: "1",
                }} >
                    <div className="flex min-h-screen min-w-full flex-col  justify-center bg-gradient-to-tr from-[#06080f] to-[#122b69]  text-white z-1 " >
                        <AppShell
                            navbar={{
                                width: 300,
                                breakpoint: 'sm',
                                collapsed: { mobile: true, desktop: true },
                            }}
                            padding={{ base: 0, md: "md" }}
                            {...props}
                        >
                            <AppShell.Main className='h-full flex flex-col w-full ' px={{ base: 0, md: undefined }}>
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
                                    <Group justify='end' gap={1}>
                                        {withLoginButton && <AuthButton session={session} />}
                                        {withDashboardButton && isStaff() && !withHomeButton && <Link
                                            href={"/dashboard"}
                                            prefetch={true}
                                            className={twMerge("rounded-full bg-white/10 px-4 py-2  hover:bg-white/20 text-nowrap h-full  transition-colors duration-500")} >
                                            <FontAwesomeIcon icon={faScrewdriverWrench} fixedWidth />
                                        </Link>
                                        }

                                        {withHomeButton && isStaff() && !withDashboardButton && <Link
                                            href={"/"}
                                            prefetch={true}
                                            className={twMerge("rounded-full bg-white/10 px-4 py-2  hover:bg-white/20 text-nowrap h-full  transition-colors duration-500")} >
                                            <FontAwesomeIcon icon={faHome} fixedWidth />
                                        </Link>}

                                        {withDashboardButton && withHomeButton && isStaff()
                                            && <ErrorBox
                                                value={"You can not have both the Dashboard and Home Button enabled."}
                                                visible={true}
                                            />
                                        }

                                    </Group>
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
            </PhotoProvider>

        </>
    )
}

export default Shell