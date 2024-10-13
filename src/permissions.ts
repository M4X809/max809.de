import {
	faUser,
	faEye,
	faUserPlus,
	faPen,
	faGear,
	faWarning,
	faTrash,
	faUserShield,
	faQrcode,
	faChartLine,
	faRightLeft,
	faToolbox,
	faCommand,
} from "@fortawesome/pro-duotone-svg-icons";
import type { Permissions as PermissionsType, Perm } from "./types";
import type { Session } from "next-auth";

export const allPerms: PermissionsType[] = [
	{
		name: "User Management",
		icon: faUser,
		perms: [
			{
				name: "View Users",
				icon: faEye,
				perm: "viewUser",
			},
			{
				name: "Add Employee",
				perm: "addEmployee",
				icon: faUserPlus,
				disabled: true,
			},
			{
				name: "Account",
				icon: faPen,
				children: [
					{
						name: "View User Page",
						perm: "viewUserPage",
						icon: faGear,
						danger: false,
					},
					{
						name: "View User Permissions",
						perm: "viewUserPermissions",
						icon: faEye,
						disabled: true,
					},
					{
						name: "Edit User",
						perm: "editUser",
						icon: faGear,
						danger: true,
						disabled: true,
					},
					{
						name: "Edit Permissions",
						perm: "editUserPermissions",
						icon: faGear,
						danger: true,
					},
					{
						name: "Dangerous Permissions",
						perm: "dangerousPermissions",
						icon: faWarning,
						danger: true,
						blocked: true,
					},
				],
			},
			{
				name: "Actions",
				icon: faGear,
				children: [
					{
						name: "Delete User",
						perm: "deleteUser",
						icon: faTrash,
						danger: true,
					},
					{
						name: "Reset Permissions",
						perm: "resetPermissions",
						icon: faWarning,
						danger: true,
					},
					{
						name: "Log Out All Devices",
						perm: "logoutAllDevices",
						icon: faWarning,
					},
				],
			},
			{
				name: "Group",
				icon: faUserShield,
				children: [
					{
						name: "Set Staff Member",
						perm: "setStaff",
						icon: faUser,
						danger: true,
						blocked: true,
					},
					{
						name: "Set Admin Member",
						perm: "setAdmin",
						icon: faUserShield,
						danger: true,
						blocked: true,
					},
				],
			},
		],
	},
	{
		name: "QR Codes",
		icon: faQrcode,
		perms: [
			{
				name: "View QR Code Stats",
				perm: "viewQrStats",
				icon: faChartLine,
			},
			{
				name: "Change QR Code Limits ",
				perm: "changeQrLimits",
				icon: faGear,
			},
			{
				name: "View QR Code Preview",
				perm: "viewQrPreview",
				icon: faRightLeft,
			},
			{
				name: "Delete QR Code",
				perm: "deleteQrCode",
				icon: faTrash,
				danger: true,
			},
		],
	},
	{
		name: "Misc",
		icon: faToolbox,
		perms: [
			{
				icon: faCommand,
				perm: "mainCommandWindow",
				name: "Open Command Window",
			},
		],
	},
];

export const perms = async ({
	session,
}: {
	session: Session | null;
}): Promise<PermissionsType[]> => {
	const calculatePermsAndChildrenCount = (item: { perms: string | any[] }) => {
		const permsCount = item.perms ? item.perms.length : 0;
		let childrenCount = 0;

		if (item.perms) {
			for (const perm of item.perms) {
				if (perm?.children) {
					childrenCount += perm.children.length;
				}
			}
		}

		return permsCount + childrenCount;
	};

	const userPerms = session?.user.permissions ?? [];

	const sortedPerms = filteredPerms(session, allPerms, userPerms).sort(
		(a: { perms: string | any[] }, b: { perms: string | any[] }) => {
			const countA = calculatePermsAndChildrenCount(a);
			const countB = calculatePermsAndChildrenCount(b);

			return countB - countA; // Sort in descending order
		},
	);

	return sortedPerms;
};

const filteredPerms = (
	session: Session | null,
	allPerms: PermissionsType[],
	userPerms: string[],
) => {
	// Deep copy of allPerms array
	const permsCopy = JSON.parse(JSON.stringify(allPerms));

	if (session?.user.admin) {
		return permsCopy;
	}

	// const perms = [];

	const perms = permsCopy
		.map(
			(mainPerm: {
				name: string;
				icon: string;
				perms?: Array<{
					name: string;
					perm: string;
					icon: string;
					danger: boolean;
					disabled: boolean;
					children?: Array<{
						name: string;
						perm: string;
						icon: string;
						danger: boolean;
						disabled: boolean;
					}>;
				}>;
			}) => {
				const perms = mainPerm?.perms
					?.map(
						(subPerm: {
							name: string;
							perm: string;
							icon: string;
							danger: boolean;
							disabled: boolean;
							children?: Array<{
								name: string;
								perm: string;
								icon: string;
								danger: boolean;
								disabled: boolean;
							}>;
						}) => {
							const children = subPerm?.children
								?.map(
									(child: {
										name: string;
										perm: string;
										icon: string;
										danger: boolean;
										disabled: boolean;
									}) => {
										if (!userPerms?.includes(child.perm)) return undefined;
										if (child.danger && !userPerms?.includes("dangerousPermissions")) {
											return undefined;
										}

										if (blockedPerms.includes(child.perm)) return undefined;

										return {
											name: child.name,
											perm: child.perm,
											icon: child.icon,
											danger: child.danger,
											disabled: child.disabled,
										};
									},
								)
								.filter(Boolean);

							if (subPerm.children && !children?.length) return undefined;
							if (!subPerm.children && !userPerms?.includes(subPerm.perm))
								return undefined;
							if (subPerm.danger && !userPerms?.includes("dangerousPermissions")) {
								return undefined;
							}

							if (blockedPerms.includes(subPerm.perm)) {
								return undefined;
							}

							return {
								name: subPerm.name,
								perm: subPerm.perm,
								icon: subPerm.icon,
								danger: subPerm.danger,
								disabled: subPerm.disabled,
								children: children ?? undefined,
							};
						},
					)
					.filter(Boolean);

				if (perms && perms?.length <= 0) return undefined;
				return {
					name: mainPerm.name,
					icon: mainPerm.icon,
					perms: perms ?? undefined,
				};
			},
		)
		.filter(Boolean);

	return perms;
};

const getAllDangerousPerms = (perms: Perm[]): string[] => {
	let result: string[] = [];

	for (const perm of perms) {
		if (perm.danger) {
			result.push(perm.perm || perm.name);
			// console.log("perm", perm);
		}

		if (perm.children) {
			// console.log("perm.children", perm.children);
			result = result.concat(getAllDangerousPerms(perm.children)); // Recursively search for children
		}
	}

	return result;
};

export const dangerPerms = allPerms.flatMap((section) =>
	getAllDangerousPerms(section.perms),
);

const getAllDisabledPerms = (perms: Perm[]): string[] => {
	let result: string[] = [];

	for (const perm of perms) {
		if (perm.disabled) {
			result.push(perm.perm || perm.name);
			// console.log("perm", perm);
		}

		if (perm.children) {
			// console.log("perm.children", perm.children);
			result = result.concat(getAllDisabledPerms(perm.children)); // Recursively search for children
		}
	}

	return result;
};

export const disabledPerms = allPerms.flatMap((section) =>
	getAllDisabledPerms(section.perms),
);

const getAllBlockedPerms = (perms: Perm[]): string[] => {
	let result: string[] = [];

	for (const perm of perms) {
		if (perm.blocked) {
			result.push(perm.perm || perm.name);
			// console.log("perm", perm);
		}

		if (perm.children) {
			// console.log("perm.children", perm.children);
			result = result.concat(getAllBlockedPerms(perm.children)); // Recursively search for children
		}
	}

	return result;
};

export const blockedPerms = allPerms.flatMap((section) =>
	getAllBlockedPerms(section.perms),
);
