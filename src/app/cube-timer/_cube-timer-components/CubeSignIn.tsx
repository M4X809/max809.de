"use client"
import { Center, Stack, Title } from '@mantine/core'
import type { Session } from 'next-auth'
import React from 'react'
import { twMerge } from 'tailwind-merge'
import { AuthButton } from '~/app/_components/AuthButton'
import { useAppStore } from '~/providers/app-store-provider'

const CubeSignIn = ({ session }: { session: Session | null | undefined }) => {
    const hideHeader = useAppStore((state) => state.hideHeader)


    return (
        <Center className={twMerge("h-full w-full bg-[rgba(255,255,255,0.1)]  rounded-xl transition-opacity duration-500", hideHeader && "opacity-0")} >
            <Stack>
                <Title order={4}>Sign in to see your History.</Title>
                <AuthButton session={session} onlySignIn />
            </Stack>
        </Center>
    )
}

export default CubeSignIn