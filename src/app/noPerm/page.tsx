

import React from 'react'
import { HydrateClient } from '~/trpc/server'
import Shell from '../_components/Shell'
import { getServerAuthSession } from '~/server/auth'
import { redirect } from 'next/navigation'
import { Center, Stack, Title } from '@mantine/core'
import Link from 'next/link'
import { twMerge } from 'tailwind-merge'
import { searchParamsCache } from './searchParams'
export default async function MissingPermission({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await getServerAuthSession()
  const { t: time, callbackUrl } = searchParamsCache.parse(await searchParams)
  if (!session?.user.id) return redirect(`/api/auth/signin?callbackUrl=${callbackUrl}`)
  if (!time) return redirect("/")
  return (
    <HydrateClient>
      <Shell
        title="No Permission"
        redirect={"/"}
        withLoginButton
        withHomeButton
        withDashboardButton={false}
        session={session}
      >
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
      </Shell>
    </HydrateClient>
  )
}

