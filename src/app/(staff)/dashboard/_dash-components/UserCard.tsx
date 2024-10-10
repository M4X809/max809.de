

import { faUser, faUserShield } from '@fortawesome/pro-duotone-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { BackgroundImage, Card, CardSection, Group, Avatar, Tooltip, Button, Text } from '@mantine/core';
import { useMounted } from '@mantine/hooks';
import Link from 'next/link';
import React from 'react'
import ClientIcon from '~/app/_components/ClientIcon';


export type User = {
    staff: boolean | null;
    admin: boolean | null;
    id: string;
    name: string | null;
    emailVerified: Date | null;
    image: string | null;
    banner: string | null;
    permissions: string[];
}


const UserCard = ({ user, admin, staff, id }: { user: User, admin: boolean, staff: boolean, id: string }) => {



    return (
        <BackgroundImage
            src={user.banner ?? ""}
            radius="md"
            key={user.id}
        >
            <Card
                // ref={ref}
                // w={500}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                bg={"rgba(0, 0, 0, 0.6)"}

            >
                <CardSection py={"xs"}>
                    <Group style={{ flexWrap: "nowrap" }} p={10} justify="">
                        {/* <Indicator
                                pos={"absolute"}
                                h={60}
                                w={60}
                                position="bottom-end"
                                size={13}
                                color={user.presence ? "green" : "red"}
                                label={user.presence ? "Online" : "Offline"}
                                c={"#C9C9C9"}
                            > */}
                        <Avatar pos={"absolute"} h={60} w={60} src={user.image}>
                            {user.name?.slice(0, 3)}
                        </Avatar>
                        {/* </Indicator> */}
                        <Group>
                            <Tooltip
                                openDelay={500}
                                p={"xs"}
                                style={{ border: "1px solid #424242" }}
                                label={
                                    (
                                        <>
                                            {user.admin && "Administrator"}
                                            {!user.admin && user.staff && "Staff Member"}
                                            {!user.admin && !user.staff && "User"}
                                        </>
                                    )
                                }
                            >
                                <Text
                                    fw={600}
                                    ml={70}
                                    truncate
                                    fz={30}
                                >
                                    {user.name}
                                </Text>
                            </Tooltip>
                            {user.admin && (<ClientIcon icon={faUserShield} />)}
                            {!user.admin && user.staff && (<ClientIcon icon={faUser} />)}

                        </Group>
                    </Group>
                </CardSection>
                <CardSection p={"10"}>
                    {/* <Tooltip label={"View User"} p={"xs"} style={{ border: "1px solid #424242" }} > */}
                    <Button
                        className='bg-[rgba(0,0,0,0.15)] hover:bg-[rgba(0,0,0,0.2)] backdrop-blur-md rounded-md text-white border-none hover:border-slate-400 hover:border'

                        // TODO: Add permission check
                        disabled={false}
                        // onClick={manageUserClicked}
                        component={Link}
                        // to={`/management/user/${user.id}`}
                        href={`/dashboard/user/${user.id}`}
                        variant="default"
                        fullWidth
                    >
                        View User
                    </Button>
                    {/* </Tooltip> */}
                </CardSection>
            </Card>
        </BackgroundImage>

    )
}

export default UserCard