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

	dataUrl: string;
	setDataUrl: (dataUrl: string) => void;

	shareable: boolean;
	setShareable: (shareable: boolean) => void;

	refetchCodes: number;
	setRefetchCodes: (refetchCodes: number) => void;

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
			if (size > 2048) return set({ size: 2048 });
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

		dataUrl: "",
		setDataUrl: (dataUrl: string) => set(() => ({ dataUrl })),

		shareable: false,
		setShareable: (shareable: boolean) => set(() => ({ shareable })),

		refetchCodes: 0,
		setRefetchCodes: (refetchCodes: number) => set({ refetchCodes }),
		canvasRef: null,
		setCanvasRef: (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) =>
			set(() => ({ canvasRef })),
	}));
};
