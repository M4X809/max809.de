
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faTrashCan, faBoltLightning, faMobileNotch, faUserShield, faUser, faChartLine, faEye, faGear, faPen, faRightLeft, faTrash, faUserChart, faUserPlus, faWarning } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Title, Grid, Tooltip, Button, Card, Center, Avatar, rem, Container, GridCol, Box, Stack, Group } from '@mantine/core';
import React from 'react'
import { hasPermission, isAdmin, onPageAllowed } from '~/lib/utils';
import { api } from '~/trpc/server'

import CustomAccordion from '../../../_dash-components/CustomAccordion';
import { twMerge } from 'tailwind-merge';
import ClientIcon from '~/app/_components/ClientIcon';
import type { Metadata } from 'next';
import Permissions from '../../../_dash-components/Permissions';
import { getServerAuthSession } from '~/server/auth';
import { ManagementStoreProvider } from '~/providers/management-store-provider';
import UserSaveButton from '../../../_dash-components/UserSaveButton';

import { perms } from "~/permissions";
import AccGroup from '../../../_dash-components/AccGroup';
import { revalidatePath } from 'next/cache';
import { DeleteUserButton, LogoutAllDevicesButton, ResetPermissionsButton } from './AccountActionButtons';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {

    // const user = await api.management.getUser(params.id)

    return {
        metadataBase: new URL('https://max809.de'),

        title: "User Management",
        icons: [{ rel: "icon", url: "/max809.webp" }],
    }
}


export default async function UserPage({ params }: { params: { id: string } }) {
    await onPageAllowed("viewUserPage")
    const session = await getServerAuthSession()
    const className = "bg-[rgba(255,255,255,0.1)] backdrop-blur-lg rounded-lg"



    const user = await api.management.getUser(params.id)

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
                    <GridCol span={6}>
                        <Card px={25} className={twMerge(className)}>
                            {await hasPermission(["editUser", "editUserPermissions", "setStaff", "setAdmin"]) && <Box className='absolute left-4 top-4'>
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

                        <GridCol span={6}>
                            <Card px={25} className={twMerge(className)}>
                                <AccGroup user={user} session={session} />
                            </Card>
                        </GridCol>}
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
                    await hasPermission(["editUserPermissions"]) &&
                    <GridCol >
                        <CustomAccordion
                            userName={user.name}
                            image={user.image}
                        >
                            {await hasPermission("editUserPermissions") &&
                                <Permissions
                                    permissions={await perms({ session })}
                                    session={session}
                                    user={user}
                                />}
                        </CustomAccordion>

                    </GridCol>}
            </Grid>

        );
    };


    return (
        <ManagementStoreProvider>

            <Container fluid size={"xl"} px={{ base: 0, md: undefined }}>
                <Grid pb={50} columns={10}>
                    <GridCol
                        span={{ base: 10, md: 2.5 }}>{userBody()}</GridCol>
                    <GridCol span={{ base: 10, md: 7.5 }}>
                        {MainBody()}
                    </GridCol>
                </Grid>
            </Container>
        </ManagementStoreProvider>
    )
}

