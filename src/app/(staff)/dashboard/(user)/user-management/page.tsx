import { faUserShield } from '@fortawesome/pro-duotone-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Avatar, BackgroundImage, Box, Button, Card, CardSection, Container, Group, Indicator, SimpleGrid, Text, Tooltip } from '@mantine/core'
import Link from 'next/link'
import React, { use } from 'react'
import { width } from 'tailwindcss/defaultTheme'

import { hasPermission, isAdmin, onPageAllowed, isStaff } from '~/lib/utils'
import { getServerAuthSession } from '~/server/auth'
import { api } from '~/trpc/server'
import UserCard from '../../_dash-components/UserCard'

export default async function UserManagement() {
    await onPageAllowed(["viewUser"])
    const session = await getServerAuthSession()

    const users = await api.management.getUsers()
    console.log("user", users)

    const [admin, staff] = await Promise.all([isAdmin(), isStaff()])


    const list = users.map((user) => {
        return (
            <UserCard user={user} key={user.id}
                admin={admin}
                staff={staff}
                id={session?.user?.id!}

            />
        )


    })






    return (
        <Box className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 '>
            {list}

        </Box>
    )
}
