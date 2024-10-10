import { Center, Stack, Title } from '@mantine/core'
import Link from 'next/link';
import type React from 'react'
import { twMerge } from 'tailwind-merge';
import { AuthButton } from '~/app/_components/AuthButton';
import Shell from '~/app/_components/Shell';
import { isStaff } from '~/lib/utils';
import { getServerAuthSession } from '~/server/auth';
import { HydrateClient } from '~/trpc/server';

export default async function notFound() {
    const session = await getServerAuthSession();
    const staff = await isStaff()
    let content: React.ReactNode = <></>

    if (session && !staff) {
        content = (
            <Center className='m-auto'>
                <Stack>
                    <Title order={2}>
                        You cant Access this Page.
                    </Title>
                    <Link href={"/"} className={twMerge("rounded-full bg-white/10 px-8 py-2 font-semibold no-underline transition hover:bg-white/20 text-nowrap mt-10 flex justify-center  ")}>
                        Back to Homepage
                    </Link>
                </Stack>
            </Center>
        )
    }

    if (!session) {
        content = (
            <Center className='m-auto'>
                <Stack>
                    <Title order={2}>
                        You need to Be Logged In to Access this Page.
                    </Title>
                    <AuthButton session={session} onlySignIn />
                </Stack>

            </Center>
        )
    }

    return (
        <HydrateClient>
            <Shell
                title={session?.user.id ? "No Access" : "Not Logged In"}
                redirect={"/"}
                withDashboardButton={false}
                withLoginButton={false}
                withHomeButton={false}
                session={session}
            >
                {content}
            </Shell>
        </HydrateClient>
    )
}
