// src/stores/app-store.ts
import type { OS } from "@mantine/hooks";
import type { Session, SessionType } from "next-auth";
import { getSession } from "next-auth/react";
import { createStore } from "zustand/vanilla";

export type AppStore = {
	session: SessionType;
	refreshSession: () => Promise<void>;
	setSession: (session: Session | null) => void;

	os: OS;
	setOs: (os: OS) => void;

	// SpeedCube Timer
	hideHeader: boolean;
	setHideHeader: (hideHeader: boolean) => void;
};

export const createAppStore = () => {
	return createStore<AppStore>()((set) => ({
		session: null,
		refreshSession: async () => {
			const session = await getSession();
			set(() => ({ session }));
		},
		setSession: (session) => set(() => ({ session })),

		os: "undetermined",
		setOs: (os: OS) => set(() => ({ os })),

		// SpeedCube Timer
		hideHeader: false,
		setHideHeader: (hideHeader: boolean) => set(() => ({ hideHeader })),
	}));
};
