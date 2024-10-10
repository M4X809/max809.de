"use client"
import { faUser, faUserShield } from '@fortawesome/pro-duotone-svg-icons';
import React, { useEffect } from 'react'
import type { User } from './UserCard';
import { useManagementStore } from '~/providers/management-store-provider';
import { Group, Stack, Switch, Text } from '@mantine/core';
import ClientIcon from '~/app/_components/ClientIcon';
import type { SessionType } from 'next-auth';
import { usePermission } from '~/lib/cUtils';


const AccGroup = ({ user, session }: { user: User, session: SessionType }) => {
    const adminUser = useManagementStore((state) => state.admin)
    const staffUser = useManagementStore((state) => state.staff)

    const setAdmin = useManagementStore((state) => state.setAdmin)
    const setStaff = useManagementStore((state) => state.setStaff)

    const setAdminChanged = useManagementStore((state) => state.setAdminChanged)
    const setStaffChanged = useManagementStore((state) => state.setStaffChanged)

    const hasPermission = usePermission(session)


    useEffect(() => {
        setAdmin(user.admin)
        setStaff(user.staff)
    }, [user, setAdmin, setStaff])


    useEffect(() => {
        if (adminUser !== user.admin) {
            setAdminChanged(true)
        } else {
            setAdminChanged(false)
        }
        if (staffUser !== user.staff) {
            setStaffChanged(true)
        } else {
            setStaffChanged(false)
        }
    }, [adminUser, staffUser, user, setAdminChanged, setStaffChanged])



    return (
        <Stack className='grid grid-cols-2 md:grid-cols-1 gap-4' >
            {hasPermission("setStaff") &&

                <Group wrap='nowrap' justify='space-between' >
                    <Group wrap='nowrap'>
                        <ClientIcon icon={faUser} />
                        <Text fz={13} fw={500}>
                            Staff Member
                        </Text>
                    </Group>
                    <Switch
                        checked={!!staffUser}
                        disabled={!!adminUser}
                        onChange={(e) => {
                            setStaff(e.target.checked)
                        }}

                    />
                </Group>}
            {hasPermission("setAdmin") &&

                <Group wrap='nowrap' justify='space-between' c={"#f9413b"} >
                    <Group wrap='nowrap'>
                        <ClientIcon icon={faUserShield} />
                        <Text fz={13} fw={500}>
                            Administrator
                        </Text>
                    </Group>
                    <Switch
                        color='#f9413b'
                        checked={!!adminUser}
                        onChange={(e) => {
                            setAdmin(e.target.checked)
                        }}

                    />
                </Group>}

        </Stack>
    )
}

export default AccGroup

