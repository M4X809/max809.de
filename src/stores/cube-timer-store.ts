// src/stores/app-store.ts
import type { Session } from "next-auth";
import type QrcodeDecoder from "qrcode-decoder";
import type React from "react";
import { useStopwatch } from "react-use-precision-timer";
import { createStore } from "zustand/vanilla";

export type CubeStore = {
	timer: () => ReturnType<typeof useStopwatch>;
};

export const createCubeStore = () => {
	return createStore<CubeStore>()((set) => ({
		timer: () => {
			const timer = useStopwatch();
			return timer;
		},
	}));
};
