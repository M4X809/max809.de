"use client"

import { AppShell, type AppShellProps, Burger, Image } from '@mantine/core'
import type { Session } from 'next-auth';
import React, { useEffect } from 'react'
import { useAppStore } from '~/providers/app-store-provider';
import { getServerAuthSession } from '~/server/auth';
// import { useSession } from "next-auth/react"
// import { getServerAuthSession } from "~/server/auth";


function Shell({ children, session, ...props }: AppShellProps & { session: Session | null }) {
    // const { data: session, status } = useSession()

    // const session = getServerAuthSession().then(data => data)

    // console.log(session)

    const setSession = useAppStore((state) => state.setSession)


    // const session = await getServerAuthSession();

    useEffect(() => {
        setSession(session)
    }, [session, setSession])


    // const session = getSession()
    // console.log(session)



    return (
        <div className="flex min-h-screen min-w-full flex-col  justify-center bg-gradient-to-tr from-[#06080f] to-[#122b69]  text-white">

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

                <AppShell.Navbar
                    // className='acrylic'
                    bg={"transparent"}
                    p="md">Navbar</AppShell.Navbar>

                <AppShell.Main>
                    {children}
                </AppShell.Main>
            </AppShell>
        </div>
    )
}

export default Shell