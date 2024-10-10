import { Box } from '@mantine/core'
import React from 'react'
import { onPageAllowed } from '~/lib/utils'
import { api } from '~/trpc/server'
import UserCard from '../../_dash-components/UserCard'

export default async function UserManagement() {
    await onPageAllowed(["viewUser"])
    const users = await api.management.getUsers()
    const list = users.map((user) => {
        return (
            <UserCard user={user} key={user.id} />
        )
    })
    return (
        <Box className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 '>
            {list}
        </Box>
    )
}
