// src/stores/app-store.ts
import type { Session } from "next-auth";
import type React from "react";
import { createStore } from "zustand/vanilla";

export type AppStore = {
	session: Session | null;
	setSession: (session: Session | null) => void;

	saveTitle: string;
	setSaveTitle: (saveTitle: string) => void;

	qrCode: string;
	setQrCode: (qrCode: string) => void;
	qrCodeLength: number;

	setQrLvl: (qrLvl: string) => void;
	qrLvl: number;

	size: number;
	setSize: (size: number | string) => void;

	color: string;
	setColor: (color: string) => void;

	backgroundColor: string;
	setBackgroundColor: (backgroundColor: string) => void;

	downloading: boolean;
	setDownloading: (downloading: boolean) => void;

	canvasState: string;
	setCanvasState: (canvasState: string) => void;

	finderRadius: number;
	setFinderRadius: (finderRadius: number) => void;

	dotRadius: number;
	setDotRadius: (dotRadius: number) => void;

	refetchCodes: null | (() => void);
	setRefetchCodes: (refetchCodes: () => void) => void;

	canvasRef: React.MutableRefObject<HTMLCanvasElement | null> | null;
	setCanvasRef: (
		canvasRef: React.MutableRefObject<HTMLCanvasElement | null>,
	) => void;
};

export const createAppStore = () => {
	return createStore<AppStore>()((set) => ({
		session: null,
		setSession: (session: Session | null) => set(() => ({ session })),

		saveTitle: "",
		setSaveTitle: (saveTitle: string) => set(() => ({ saveTitle })),

		qrCode: "https://max809.de",
		setQrCode: (qrCode: string) =>
			set(() => ({ qrCode: qrCode, qrCodeLength: qrCode?.length })),
		qrCodeLength: "https://max809.de".length,

		setQrLvl: (qrLvl: string) => set(() => ({ qrLvl: Number(qrLvl) })),
		qrLvl: 0,

		size: 2048,
		setSize: (size: number | string) => {
			if (typeof size === "string") size = Number(size);

			if (size < 512) return set({ size: 512 });
			if (size > 4096) return set({ size: 4096 });

			// console.log(size);

			return set({ size });
		},

		color: "rgba(255, 255, 255, 1)",
		setColor: (color: string) => set(() => ({ color })),

		backgroundColor: "rgba(0, 0, 0, 0)",
		setBackgroundColor: (backgroundColor: string) =>
			set(() => ({ backgroundColor })),

		downloading: false,
		setDownloading: (downloading: boolean) => set(() => ({ downloading })),

		canvasState: "",
		setCanvasState: (canvasState: string) => set(() => ({ canvasState })),

		finderRadius: 0,
		setFinderRadius: (finderRadius: number) => set(() => ({ finderRadius })),

		dotRadius: 0,
		setDotRadius: (dotRadius: number) => set(() => ({ dotRadius })),

		refetchCodes: null,
		setRefetchCodes: (refetchCodes: () => void) => set(() => ({ refetchCodes })),

		canvasRef: null,
		setCanvasRef: (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) =>
			set(() => ({ canvasRef })),
	}));
};