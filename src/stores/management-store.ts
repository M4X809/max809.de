"use client";
import { create, createStore } from "zustand";

export type ManagementStore = {
	refreshing: boolean;
	setRefreshing: (refreshing: boolean) => void;

	// saveUserFunc: (() => void) | null;
	// setSaveUserFunc: (saveUserFunc: (() => void) | null) => void;
	saveUserCounter: number;
	increaseSaveUserCounter: () => void;
	saveDisabled: boolean;
	setSaveDisabled: (saveDisabled: boolean) => void;

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

	previewCodeId: string | null;
	setPreviewCodeId: (previewCodeId: string | null) => void;
	previewCodeOpen: boolean;
	togglePreviewCodeOpen: () => void;

	limitChanged: boolean;
	setLimitChanged: (limitChanged: boolean) => void;
	limit: number | null | string;
	setLimit: (limit: number | null | string) => void;
};

export const createManagementStore = () => {
	return createStore<ManagementStore>()((set, get) => ({
		refreshing: false,
		setRefreshing: (refreshing) => set(() => ({ refreshing })),

		// saveUserFunc: null,
		// setSaveUserFunc: (saveUserFunc) => set(() => ({ saveUserFunc })),

		saveUserCounter: 0,
		increaseSaveUserCounter: () =>
			set((state) => ({ saveUserCounter: state.saveUserCounter + 1 })),

		saveDisabled: true,
		setSaveDisabled: (saveDisabled) => set(() => ({ saveDisabled })),

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
		setAdminChanged: (adminChanged) => set(() => ({ adminChanged })),
		admin: false,
		setAdmin: (admin) => set(() => ({ admin })),

		previewCodeId: null,
		setPreviewCodeId: (previewCodeId) => set(() => ({ previewCodeId })),

		previewCodeOpen: false,
		togglePreviewCodeOpen: () => {
			set((state) => ({ previewCodeOpen: !state.previewCodeOpen }));
			setTimeout(() => {
				if (!get().previewCodeOpen) {
					set({ previewCodeId: null });
				}
			}, 1000);
		},

		limitChanged: false,
		setLimitChanged: (limitChanged) => set(() => ({ limitChanged })),
		limit: null,
		setLimit: (limit) => {
			set(() => ({ limit }));
		},
	}));
};

// export function getSaveUserFunc() {
// 	const func = createManagementStore().getState().saveUserFunc;
// 	console.log("func", func);
// 	return func;
// }
