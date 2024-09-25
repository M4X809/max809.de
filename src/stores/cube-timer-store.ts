// src/stores/app-store.ts
import type { Session } from "next-auth";
import type QrcodeDecoder from "qrcode-decoder";
import type React from "react";
import { useStopwatch } from "react-use-precision-timer";
import { createStore } from "zustand/vanilla";
import { createJSONStorage, persist } from "zustand/middleware";

export type CubeStore = {
	timer: () => ReturnType<typeof useStopwatch>;
	page: number;
	setPage: (page: number) => void;

	// cubeSize: string;
	// setCubeSize: (cubeSize: string) => void;

	scramble: string;
	setScramble: (scramble: string) => void;

	newScrambleCounter: number;
	increaseNewScrambleCounter: () => void;

	scrambleType: string;
	setScrambleType: (scrambleType: string) => void;

	refetchCounter: number;
	increaseRefetchCounter: () => void;
};

export const createCubeStore = () => {
	return createStore<CubeStore>()(
		persist(
			(set, get) => ({
				timer: () => {
					const timer = useStopwatch();
					return timer;
				},
				page: 1,
				setPage: (page: number) => set(() => ({ page })),

				// cubeSize: "3x3x3",
				// setCubeSize: (cubeSize: string) => set(() => ({ cubeSize })),

				scramble: "",
				setScramble: (scramble: string) => set(() => ({ scramble })),

				newScrambleCounter: 0,
				increaseNewScrambleCounter: () =>
					set((state) => ({ newScrambleCounter: state.newScrambleCounter + 1 })),

				scrambleType: "333",
				setScrambleType: (scrambleType: string) => set(() => ({ scrambleType })),

				refetchCounter: 0,
				increaseRefetchCounter: () =>
					set((state) => ({ refetchCounter: state.refetchCounter + 1 })),
			}),
			{
				name: "cube-timer-store",
				storage: createJSONStorage(() => localStorage),
				partialize: (state) => ({ scrambleType: state.scrambleType }),
				version: 2,
				migrate: (persistedState, version) => {
					console.log("migrate", persistedState, version);
					return {
						cubeSize: undefined,
						scrambleType: "333",
					};
				},
			},
		),
	);
};
