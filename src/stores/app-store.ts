// src/stores/app-store.ts
import type { OS } from "@mantine/hooks";
import type { Session } from "next-auth";
import type QrcodeDecoder from "qrcode-decoder";
import type React from "react";
import { createStore } from "zustand/vanilla";

export type AppStore = {
	session: Session | null;
	setSession: (session: Session | null) => void;

	os: OS ;
	setOs: (os: OS) => void;

	// SpeedCube Timer
	hideHeader: boolean;
	setHideHeader: (hideHeader: boolean) => void;
};

export const createAppStore = () => {
	return createStore<AppStore>()((set) => ({
		session: null,
		setSession: (session: Session | null) => set(() => ({ session })),

		os: "undetermined",
		setOs: (os: OS) => set(() => ({ os })),

		// SpeedCube Timer
		hideHeader: false,
		setHideHeader: (hideHeader: boolean) => set(() => ({ hideHeader })),
	}));
};
