
import { faDiscord } from '@fortawesome/free-brands-svg-icons';
import { faTrashCan, faBoltLightning, faMobileNotch, faUserShield, faUser, faChartLine, faEye, faGear, faPen, faRightLeft, faTrash, faUserChart, faUserPlus, faWarning } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Title, Grid, Tooltip, Button, Card, Center, Avatar, rem, Container, GridCol, Box, Stack } from '@mantine/core';
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

                    <Grid columns={8} pt={10} >
                        <GridCol span={{ base: 4, md: 2 }}>
                            <Tooltip label="Delete User" >
                                <Button
                                    hidden={!await hasPermission("deleteUser")}
                                    leftSection={<FontAwesomeIcon fontSize={20} icon={faTrashCan} />}
                                    disabled={!!user.admin && !await isAdmin()}


                                    // disabled={!employee.presence}
                                    fullWidth
                                    variant="gradient"
                                    gradient={{
                                        from: "red",
                                        to: "orange",
                                    }}
                                >
                                    Delete
                                </Button>
                            </Tooltip>
                        </GridCol>
                        <GridCol span={{ base: 4, md: 2 }}>
                            <Tooltip label="Reset Permissions" >
                                <Button
                                    hidden={!await hasPermission("resetPermissions")}
                                    leftSection={<FontAwesomeIcon fontSize={20} icon={faBoltLightning} />}
                                    disabled={true}
                                    fullWidth
                                    variant="gradient"
                                    gradient={{
                                        from: "darkred",
                                        to: "#CB356B",
                                    }}
                                >
                                    Reset Permissions
                                </Button>
                            </Tooltip>
                        </GridCol>
                        <GridCol span={{ base: 4, md: 2 }}>
                            <Tooltip
                                // label="Logout All Devices"
                                label="WIP / Logout All Devices"

                            >
                                <Button
                                    hidden={!await hasPermission("logoutAllDevices")}
                                    leftSection={<FontAwesomeIcon fontSize={20} icon={faMobileNotch} />}
                                    disabled={true}
                                    fullWidth
                                    variant="gradient"
                                    gradient={{
                                        from: "yellow",
                                        to: "brown",
                                    }}
                                >
                                    Logout All Devices
                                </Button>
                            </Tooltip>
                        </GridCol>
                    </Grid>
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
                            {await hasPermission(["editUser", "editUserPermissions"]) && <Box className='absolute left-4 top-4'>
                                <UserSaveButton />
                            </Box>}

                            <Center pt={15}>

                                <Avatar
                                    alt="Discord Profile Picture"
                                    size={"xl"}
                                    src={user.image}
                                    style={{
                                        // backgroundColor: "transparent",
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
                    {/* <GridCol span={6} hiddenFrom="md" hidden={!accountActions()}>
                        <Card className={twMerge(className)}>{accountActions()}</Card>
                    </GridCol> */}

                    {/* User Info Card */}
                    {/* <GridCol span={6}>
						<Card>
							<Title pb={10} order={4}>
								User Info
							</Title>
							<Group justify="space-between" wrap="nowrap">
								<Group wrap="nowrap">
									<FontAwesomeIcon fixedWidth icon={faRightToBracket} />
									<Text truncate>Logins:</Text>
								</Group>
								{employee.logins}
							</Group>
							<Group justify="space-between" wrap="nowrap">
								<Group wrap="nowrap">
									<FontAwesomeIcon fixedWidth icon={faCalendarNote} />
									<Text truncate>Last Login:</Text>
								</Group>
								<Text truncate>
									{formatTime(employee.lastLogin, {
										withoutYear: true,
										withoutSeconds: true,
									})}
								</Text>
							</Group>

							<Group justify="space-between" wrap="nowrap">
								<Group wrap="nowrap">
									<FontAwesomeIcon fixedWidth icon={faDiscord} />
									<Text truncate>ID:</Text>
								</Group>
								{employee.discordId}
							</Group>
						</Card>
					</GridCol> */}
                </Grid>
            </React.Fragment>
        );
    };

    const MainBody = async () => {

        // const [value, setValue] = useState<string[]>([]);


        return (

            <Grid>
                {await hasPermission(["deleteUser"]) && <GridCol>
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
                {/* <Affix
                // hidden={!unsavedChanges}
                position={{ bottom: 20, right: 20 }}>
                <ActionIcon
                    // loading={isUpdating}
                    // onClick={() => {
                    // 	if (unsavedChanges && employee && id) {
                    // 		updateUser({
                        // 			id: id, body: {
                            // 				permissions: userPermissions,
                            // 			}
                            // 		});
                            // 	}
                            // }}
                            size={"xl"}
                            variant="gradient"
                            // gradient={unsavedError ? { from: "error.4", to: "error.6" } : undefined}
                            
                            >
                            <FontAwesomeIcon size={"xl"} icon={faFloppyDisk} />
                            </ActionIcon>
                            </Affix> */}
            </Container>
        </ManagementStoreProvider>
    )
}

