"use client";
import type { Session } from "next-auth";
import type { Permissions as PermissionsType } from "~/types";
import type { User } from "../../../_dash-components/UserCard";

import { faCircle, faCopy } from "@fortawesome/pro-duotone-svg-icons";
import {
	Accordion,
	Card,
	Checkbox,
	Code,
	Flex,
	Grid,
	Group,
	List,
	Stack,
	Text,
	Title,
	UnstyledButton,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import React, { useEffect } from "react";
import { useIsAdmin, usePermission } from "~/lib/cUtils";
import ClientIcon from "~/app/_components/ClientIcon";

import { twMerge } from "tailwind-merge";
import { useManagementStore } from "~/providers/management-store-provider";

const Permissions = ({
	session,
	permissions,
	user,
}: {
	session: Session | null | undefined;
	permissions: PermissionsType[];
	user: User;
}) => {
	const hasPermission = usePermission(session);
	const admin = useIsAdmin(session);
	const { copy } = useClipboard({ timeout: 500 });
	const setUserPermissions = useManagementStore((state) => state.setUserPermissions);
	const userPermissions = useManagementStore((state) => state.userPermissions);
	const setPermissionsChanged = useManagementStore((state) => state.setPermissionsChanged);

	useEffect(() => {
		if (!user.permissions) return;
		setUserPermissions(user.permissions);
	}, [user.permissions, setUserPermissions]);

	if (!hasPermission("editUserPermissions")) return null;

	const color = (perm: any) => {
		switch (true) {
			case perm?.danger && !perm?.disabled:
				return "#f9413b";
			case !perm?.danger && perm?.disabled:
				return "#555960";
			case perm?.danger && perm?.disabled:
				return "#893d3b";
			default:
				return undefined;
		}
	};

	const onCheck = (e: { target: { checked: boolean; value: string } }) => {
		setUserPermissions((prevSelectedRoles: string[]) => {
			let updatedPermissions: string[];

			if (e?.target?.checked) {
				// Add the role to the selectedRoles array
				updatedPermissions = [...prevSelectedRoles, e.target.value];
			} else {
				// Remove the role from the selectedRoles array
				updatedPermissions = prevSelectedRoles.filter((perm) => perm !== e.target.value);
			}
			// Sort the updatedPermissions array
			return updatedPermissions.slice().sort();
		});
	};

	useEffect(() => {
		const permissionsChanged =
			!userPermissions.every((perm) => user.permissions.includes(perm)) ||
			!user.permissions.every((perm) => userPermissions.includes(perm));
		setPermissionsChanged(permissionsChanged);
	}, [userPermissions, user.permissions, setPermissionsChanged]);

	const categories = permissions.map((perm) => {
		const perms = perm?.perms?.map((perm) => {
			const subPerms = perm?.children?.map((perm) => {
				return (
					<Grid
						py={5}
						grow
						key={perm.name}
						columns={8}
						c={color(perm)}
						style={{
							alignContent: "flex-end",
						}}
					>
						<Grid.Col span={"auto"}>
							<Flex justify={"center"} align={"center"} h={"100%"}>
								<ClientIcon
									fixedWidth
									visibility={!perm?.icon ? "hidden" : "visible"}
									icon={perm?.icon ?? faCircle}
									fontSize={15}
								/>
							</Flex>
						</Grid.Col>
						<Grid.Col span={5}>
							<Group wrap="nowrap" justify="space-between">
								<Text truncate fz={18}>
									{perm.name}
								</Text>
								{admin() && (
									<UnstyledButton
										className="hidden md:block"
										type="button"
										bg="background.9"
										styles={{ root: { borderRadius: "0.4rem" } }}
										onClick={() => {
											copy(perm.perm);
										}}
									>
										<Group wrap="nowrap" px={5} ta={"center"}>
											<Code className="rounded-md bg-[rgba(0,0,0,0.25)]" c={color(perm)}>
												<Text truncate fz={14}>
													{perm.perm}
												</Text>
											</Code>
											<ClientIcon icon={faCopy} color={color(perm)} fontSize={10} />
										</Group>
									</UnstyledButton>
								)}
							</Group>
						</Grid.Col>
						<Grid.Col span={"auto"}>
							<Flex
								justify={"center"}
								align={"center"}
								h={"100%"}
								className={twMerge("cursor-pointer", perm.disabled && "cursor-not-allowed")}
							>
								<Checkbox
									classNames={{
										input: twMerge("cursor-pointer", perm.disabled && "cursor-not-allowed"),
									}}
									color={color(perm)}
									disabled={perm?.disabled ?? false}
									value={perm.perm}
									onChange={onCheck}
									size="md"
									checked={userPermissions?.includes(perm.perm as string)}
								/>
							</Flex>
						</Grid.Col>
					</Grid>
				);
			});

			return (
				<React.Fragment key={perm.name}>
					<Stack
						style={{
							borderBottom: subPerms ? "2px solid #2D3748" : undefined,
							alignContent: "flex-end",
						}}
						key={perm.name}
					>
						<Grid c={color(perm)} columns={8} grow py={5}>
							<Grid.Col span={"auto"}>
								<Flex justify={"center"} align={"center"} h={"100%"}>
									<ClientIcon
										fixedWidth
										visibility={!perm?.icon ? "hidden" : "visible"}
										icon={perm?.icon ?? faCircle}
										fontSize={subPerms ? 20 : 15}
									/>
								</Flex>
							</Grid.Col>
							<Grid.Col span={5} pt={subPerms ? 15 : undefined}>
								<Group wrap="nowrap" justify="space-between">
									<Text truncate fz={subPerms ? 20 : 18} fw={subPerms ? 800 : 500}>
										{perm.name}
									</Text>
									{admin() && !subPerms && (
										<UnstyledButton
											className="hidden md:block"
											type="button"
											bg="background.9"
											styles={{ root: { borderRadius: "0.4rem" } }}
											onClick={() => {
												copy(perm.perm);
											}}
										>
											<Group wrap="nowrap" px={5} ta={"center"}>
												<Code className="rounded-md bg-[rgba(0,0,0,0.25)]" c={color(perm)}>
													<Text truncate fz={14}>
														{perm.perm}
													</Text>
												</Code>
												<ClientIcon icon={faCopy} color={color(perm)} fontSize={10} />
											</Group>
										</UnstyledButton>
									)}
								</Group>
							</Grid.Col>
							<Grid.Col span={"auto"}>
								<Flex
									justify={"center"}
									align={"center"}
									h={"100%"}
									className={twMerge("cursor-pointer", perm.disabled && "cursor-not-allowed")}
								>
									<Checkbox
										classNames={{
											input: twMerge("cursor-pointer", perm.disabled && "cursor-not-allowed"),
										}}
										disabled={perm.disabled ?? false}
										color={color(perm)}
										value={perm.perm}
										onChange={onCheck}
										size="md"
										display={subPerms ? "none" : "block"}
										checked={userPermissions?.includes(perm.perm as string)}
									/>
								</Flex>
							</Grid.Col>
						</Grid>
					</Stack>
					{subPerms}
				</React.Fragment>
			);
		});

		return (
			<Grid.Col span={{ base: 1, xl: 1 }} key={perm.name}>
				<Card className="rounded-lg bg-[rgba(0,0,0,0.25)]" mih={"100%"} shadow="none" radius="md">
					<List>
						<Title
							order={2}
							pb={5}
							style={{
								borderBottom: "3px solid #2D3748",
							}}
						>
							{perm.icon && <ClientIcon style={{ padding: "0 10 0 0" }} icon={perm.icon} />}
							{perm.name}
						</Title>
						{perms}
					</List>
				</Card>
			</Grid.Col>
		);
	});

	return (
		<Accordion.Item value="permissions" className="rounded-lg bg-[rgba(255,255,255,0.1)] backdrop-blur-lg">
			<Accordion.Control>
				<Text size="xl">Permissions </Text>
			</Accordion.Control>
			<Accordion.Panel>
				<Grid columns={1}>{categories}</Grid>
			</Accordion.Panel>
		</Accordion.Item>
	);
};

export default Permissions;
