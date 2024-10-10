"use client";
import { create, createStore } from "zustand";

export type ManagementStore = {
	permissionsChanged: boolean;
	setPermissionsChanged: (permissionsChanged: boolean) => void;

	userPermissions: string[];
	setUserPermissions: (
		userPermissions: string[] | ((prev: string[]) => string[]),
	) => void;

	staffChanged: boolean;
	setStaffChanged: (staffChanged: boolean) => void;
	staff: boolean | null;
	setStaff: (staff: boolean | null) => void;

	adminChanged: boolean;
	setAdminChanged: (adminChanged: boolean) => void;
	admin: boolean | null;
	setAdmin: (admin: boolean | null) => void;
};

// export const managementStore = create<ManagementStore>()((set, get) => ({
// 	userPermissions: [],
// 	setUserPermissions: (
// 		userPermissions: string[] | ((prev: string[]) => string[]),
// 	) => {
// 		set(() => ({
// 			userPermissions:
// 				typeof userPermissions === "function"
// 					? userPermissions(get().userPermissions)
// 					: userPermissions,
// 		}));
// 	},
// }));
export const createManagementStore = () => {
	return createStore<ManagementStore>()((set, get) => ({
		permissionsChanged: false,
		setPermissionsChanged: (permissionsChanged: boolean) =>
			set(() => ({ permissionsChanged })),

		userPermissions: [],
		setUserPermissions: (
			userPermissions: string[] | ((prev: string[]) => string[]),
		) => {
			set(() => ({
				userPermissions:
					typeof userPermissions === "function"
						? userPermissions(get().userPermissions)
						: userPermissions,
			}));
		},

		staffChanged: false,
		setStaffChanged: (staffChanged: boolean) => set(() => ({ staffChanged })),
		staff: false,
		setStaff: (staff: boolean | null) => set(() => ({ staff })),

		adminChanged: false,
		setAdminChanged: (adminChanged: boolean) => set(() => ({ adminChanged })),
		admin: false,
		setAdmin: (admin: boolean | null) => set(() => ({ admin })),
	}));
};
