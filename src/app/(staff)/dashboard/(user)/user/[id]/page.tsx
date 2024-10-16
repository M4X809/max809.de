
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faUserShield, faUser } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Title, Grid, Tooltip, Card, Center, Avatar, rem, Container, GridCol, Box, Stack, Group, Button, Text } from '@mantine/core';
import React from 'react'
import { hasPermission, onPageAllowed } from '~/lib/sUtils';
import { api } from '~/trpc/server'

import CustomAccordion from '../../../_dash-components/CustomAccordion';
import { twMerge } from 'tailwind-merge';
import ClientIcon from '~/app/_components/ClientIcon';
import type { Metadata } from 'next';
import Permissions from '../_userpage-components/Permissions';
import { getServerAuthSession } from '~/server/auth';
import UserSaveButton from '../_userpage-components/UserSaveButton';

import { perms } from "~/permissions";
import AccGroup from '../_userpage-components/AccGroup';
import { DeleteUserButton, LogoutAllDevicesButton, ResetPermissionsButton } from './AccountActionButtons';
import ManageQrCodes from '../_userpage-components/ManageQrCodes';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import UserConfig from '../_userpage-components/UserConfig';

export const metadata: Metadata = {
    metadataBase: new URL('https://max809.de'),
    title: "User Management",
    icons: [{ rel: "icon", url: "/max809.webp" }],
}


export default async function UserPage({ params }: { params: { id: string } }) {
    await onPageAllowed("viewUserPage")
    const session = await getServerAuthSession()
    const className = "bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg"

    const user = await api.management.getUser(params.id)

    if (!user) {
        redirect("/dashboard/user-management")
    }

    const accountActions = async () => {
        if (await hasPermission(["deleteUser", "resetPermissions", "logoutAllDevices"]))
            return (
                <React.Fragment>
                    <Title order={4}>Account Actions</Title>


                    <Box className='grid md:grid-cols-3 sm:grid-cols-4 gap-4'>
                        {await hasPermission("deleteUser") &&
                            <Group className='flex md:col-span-1 col-span-2'>
                                <Tooltip label="Reset Permissions" >
                                    <DeleteUserButton id={params.id} session={session} />
                                </Tooltip>

                            </Group>
                        }
                        {await hasPermission("resetPermissions") &&
                            <Group className='flex md:col-span-1 col-span-2'>
                                <Tooltip label="Reset Permissions" >
                                    <ResetPermissionsButton id={params.id} session={session} />
                                </Tooltip>

                            </Group>
                        }
                        {await hasPermission("logoutAllDevices") &&
                            <Group className='flex md:col-span-1 col-span-2'>
                                <Tooltip label="Log Out All Devices" >
                                    <LogoutAllDevicesButton id={params.id} session={session} />
                                </Tooltip>

                            </Group>
                        }
                    </Box>
                </React.Fragment>
            );
    };

    const userBody = async () => {

        return (
            <React.Fragment>
                <Grid columns={6}>
                    {/* User Card */}
                    <GridCol span={6} order={1}>
                        <Card px={25} className={twMerge(className)}>
                            {await hasPermission(["editUser", "editUserPermissions", "setStaff", "setAdmin", "changeQrLimits"]) && <Box className='absolute left-4 top-4'>
                                <UserSaveButton />
                            </Box>}

                            <Center pt={15}>

                                <Avatar
                                    alt="Discord Profile Picture"
                                    size={"xl"}
                                    src={user.image}
                                    style={{
                                        border: "3px solid #424242",
                                    }}
                                >
                                    <FontAwesomeIcon
                                        icon={faDiscord}
                                        style={{
                                            fontSize: rem(50),
                                        }}
                                    />
                                </Avatar>
                            </Center>
                            <Stack justify="center" gap={1} >
                                <Title my={15} ta={"center"} >
                                    {user.name}
                                </Title>

                                <Center ta={"center"} className='min-h-[1rem]'>
                                    {user.admin && <ClientIcon title='Administrator' icon={faUserShield} />}
                                    {!user.admin && user.staff && <ClientIcon title='Staff Member' icon={faUser} />}
                                </Center>

                            </Stack>

                        </Card>
                    </GridCol>
                    {await hasPermission(["setAdmin", "setStaff"]) &&
                        <GridCol span={6} order={2}>
                            <Card px={25} className={twMerge(className)}>
                                <AccGroup user={user} session={session} />
                            </Card>
                        </GridCol>}
                    {await hasPermission(["viewWhitelist"]) &&
                        <GridCol span={6} order={{ base: 3, md: 2 }}>
                            <Card px={15} className={twMerge(className)}>
                                <Button
                                    prefetch={false}
                                    disabled={!user.whiteListId}
                                    title={`View Whitelist - ${user.name}`}
                                    className='bg-white/10 hover:bg-white/20'
                                    component={Link}
                                    href={`/dashboard/login-whitelist?search=${user.id}`}
                                >
                                    {!!user.whiteListId && <Text truncate fz={13} fw={500}>
                                        View Whitelist - {user.name}
                                    </Text>}
                                    {!user.whiteListId && <Text truncate fz={13} fw={500}>
                                        User not in Whitelist
                                    </Text>}
                                </Button>
                            </Card>
                        </GridCol>
                    }
                    {await hasPermission(["editUser"]) &&
                        <GridCol span={6} order={{ base: 2, md: 3 }}>
                            <Card px={15} className={twMerge(className)}>
                                <UserConfig
                                    user={user}
                                />
                            </Card>
                        </GridCol>
                    }
                </Grid>
            </React.Fragment>
        );
    };

    const MainBody = async () => {
        return (
            <Grid>
                {await hasPermission(["deleteUser", "resetPermissions", "logoutAllDevices"]) && <GridCol>
                    <Card className={twMerge(className)}>{accountActions()}</Card>
                </GridCol>}
                {
                    await hasPermission(["editUserPermissions", "viewQrStats"]) &&
                    <GridCol >
                        <CustomAccordion
                            userName={user.name}
                            image={user.image}
                            defaultOpen={session?.user.config?.userPage?.expanded ?? []}
                        >
                            {await hasPermission("editUserPermissions") &&
                                <Permissions
                                    permissions={await perms({ session })}
                                    session={session}
                                    user={user}
                                />}
                            {await hasPermission(["viewQrStats", "changeQrLimits"]) &&
                                <ManageQrCodes
                                    id={user.id}
                                />}
                        </CustomAccordion>

                    </GridCol>}
            </Grid>

        );
    };


    return (



        <Container fluid size={"xl"} px={{ base: 0, md: undefined }}>
            <Grid pb={50} columns={10}>
                <GridCol
                    span={{ base: 10, md: 2.5 }}>{userBody()}</GridCol>
                <GridCol span={{ base: 10, md: 7.5 }}>
                    {MainBody()}
                </GridCol>
            </Grid>
        </Container>
    )
}

