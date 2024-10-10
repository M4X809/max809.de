"use client";
import { create, createStore } from "zustand";

export type ManagementStore = {
	permissionsChanged: boolean;
	setPermissionsChanged: (permissionsChanged: boolean) => void;

	userPermissions: string[];
	setUserPermissions: (
		userPermissions: string[] | ((prev: string[]) => string[]),
	) => void;
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
	}));
};
