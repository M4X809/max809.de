"use client"

import { AppShell, type AppShellProps, Box, Group, Text } from '@mantine/core'
import type { Session } from 'next-auth';
import React, { useEffect } from 'react'
import { useAppStore } from '~/providers/app-store-provider';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGithub } from '@fortawesome/free-brands-svg-icons'
import { faHeart } from '@fortawesome/pro-duotone-svg-icons'

import pkg from "~/../package.json";


function Shell({ children, session, ...props }: AppShellProps & { session: Session | null }) {

    const setSession = useAppStore((state) => state.setSession)

    useEffect(() => {
        setSession(session)
    }, [session, setSession])


    return (
        <>
            <Box className='relative min-h-[calc(100vh-40px)] mb-[calc(2rem*var(--mantine-scale))] z-1 ' style={{
                // marginBottom: "calc(1.5rem * var(--mantine-scale))",
                zIndex: "1",
            }} >
                <div className="flex min-h-screen min-w-full flex-col  justify-center bg-gradient-to-tr from-[#06080f] to-[#122b69]  text-white z-1 " >

                    <AppShell
                        // header={{ height: 40 }}
                        navbar={{
                            width: 300,
                            breakpoint: 'sm',
                            collapsed: { mobile: true, desktop: true },

                        }}

                        padding="md"
                        {...props}
                    >
                        {/* <AppShell.Header>
                </AppShell.Header> */}

                        {/* <AppShell.Navbar
                            // className='acrylic'
                            bg={"transparent"}
                            p="md">Navbar</AppShell.Navbar> */}

                        <AppShell.Main  >
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
                        Made with <Text component='span' c={"#ff0000"} > <FontAwesomeIcon icon={faHeart} /></Text> by <Text c={"blue"} component="a" href='https://github.com/m4x809' td={"underline"} >m4x809</Text>
                    </Text>
                    <Text fz={13} c={"dimmed"} component='span'> Version: {pkg.version} </Text>


                    <Text c={"dimmed"} ta={"right"} fz={13} component="a" href='https://github.com/m4x809/max809.de' td={"underline"}>
                        Source code on <Text c={"blue"} component='span' px={3} ><FontAwesomeIcon color='white' icon={faGithub} /></Text>
                    </Text>
                </Group>
            </Box>
        </>
    )
}

export default Shell