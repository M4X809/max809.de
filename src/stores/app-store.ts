// src/stores/app-store.ts
import type { Session } from "next-auth";
import type QrcodeDecoder from "qrcode-decoder";
import type React from "react";
import { createStore } from "zustand/vanilla";

export type AppStore = {
	session: Session | null;
	setSession: (session: Session | null) => void;

	// SpeedCube Timer
	hideHeader: boolean;
	setHideHeader: (hideHeader: boolean) => void;
};

export const createAppStore = () => {
	return createStore<AppStore>()((set) => ({
		session: null,
		setSession: (session: Session | null) => set(() => ({ session })),

		// SpeedCube Timer
		hideHeader: false,
		setHideHeader: (hideHeader: boolean) => set(() => ({ hideHeader })),
	}));
};
