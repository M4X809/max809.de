

import { faUser, faUserShield } from '@fortawesome/pro-duotone-svg-icons';
import { BackgroundImage, Card, CardSection, Group, Avatar, Tooltip, Button, Text } from '@mantine/core';
import type { Config } from 'next-auth';
import Link from 'next/link';
import React from 'react'
import { twMerge } from 'tailwind-merge';
import ClientIcon from '~/app/_components/ClientIcon';
import { hasPermission } from '~/lib/utils';


export type User = {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    limit: number;
    banner: string | null;
    admin: boolean | null;
    staff: boolean | null;
    permissions: string[];
    config: Config | null;
}

const UserCard = async ({ user }: { user: Omit<User, "email" | "limit">, admin?: boolean, staff?: boolean, id?: string }) => {
    const viewUserPage = await hasPermission("viewUserPage")

    return (
        <BackgroundImage
            src={user.banner ?? ""}
            radius="md"
            key={user.id}
        >
            <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                bg={"rgba(0, 0, 0, 0.6)"}
            >
                <CardSection py={"xs"}>
                    <Group style={{ flexWrap: "nowrap" }} p={10} justify="">
                        <Avatar pos={"absolute"} h={60} w={60} src={user.image}>
                            {user.name?.slice(0, 3)}
                        </Avatar>
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
                    <Button
                        className={twMerge('bg-[rgba(255,255,255,0.11)] hover:bg-[rgba(255,255,255,0.14)] backdrop-blur-sm rounded-md text-white border-none', !viewUserPage && "text-gray-600 bg-[rgba(0,0,0,0.15)]")}
                        disabled={!viewUserPage}
                        component={viewUserPage ? Link : undefined}
                        href={`/dashboard/user/${user.id}`}
                        variant="default"
                        fullWidth
                    >
                        {viewUserPage ? "View User" : "Missing Permission"}
                    </Button>
                </CardSection>
            </Card>
        </BackgroundImage>
    )
}

export default UserCard