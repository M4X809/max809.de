// src/stores/qrCode-store.ts
import type QrcodeDecoder from "qrcode-decoder";
import type React from "react";
import { createStore } from "zustand/vanilla";

export type QrCodeStore = {
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

	deleteCodeId: string | null;
	setDeleteCodeId: (deleteCodeId: string | null) => void;

	deleteName: string | null;
	setDeleteName: (deleteName: string | null) => void;

	resetAllQrCodeSates: () => void;

	deleteToggle: boolean;
	setDeleteToggle: () => void;

	canvasRef: React.MutableRefObject<HTMLCanvasElement | null> | null;
	setCanvasRef: (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) => void;

	// DECODER

	QrcodeDecoder: QrcodeDecoder | null;
	setQrcodeDecoder: (qrcodeDecoder: QrcodeDecoder | null) => void;

	fileAccepted: boolean;
	setFileAccepted: (fileAccepted: boolean) => void;

	fileRejected: React.ReactNode;
	setFileRejected: (fileRejected: React.ReactNode) => void;
};

export const createQrCodeStore = () => {
	return createStore<QrCodeStore>()((set) => ({
		saveTitle: "",
		setSaveTitle: (saveTitle: string) => set(() => ({ saveTitle })),

		qrCode: "https://max809.de",
		setQrCode: (qrCode: string) => set(() => ({ qrCode: qrCode, qrCodeLength: qrCode?.length })),
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
		setBackgroundColor: (backgroundColor: string) => set(() => ({ backgroundColor })),

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

		deleteCodeId: null,
		setDeleteCodeId: (deleteCodeId: string | null) => set(() => ({ deleteCodeId })),

		deleteName: null,
		setDeleteName: (deleteName: string | null) => set(() => ({ deleteName })),

		resetAllQrCodeSates: () =>
			set(() => ({
				saveTitle: "",
				qrCode: "https://max809.de",
				qrLvl: 0,
				size: 2048,
				color: "rgba(255, 255, 255, 1)",
				backgroundColor: "rgba(0, 0, 0, 0)",
				finderRadius: 0,
				dotRadius: 0,
				dataUrl: "",
				shareable: false,
			})),

		deleteToggle: false,
		setDeleteToggle: () => set((state) => ({ deleteToggle: !state.deleteToggle })),

		canvasRef: null,
		setCanvasRef: (canvasRef: React.MutableRefObject<HTMLCanvasElement | null>) => set(() => ({ canvasRef })),

		// DECODER

		QrcodeDecoder: null,
		setQrcodeDecoder: (qrcodeDecoder: QrcodeDecoder | null) => set(() => ({ QrcodeDecoder: qrcodeDecoder })),

		fileAccepted: false,
		setFileAccepted: (fileAccepted: boolean) => set(() => ({ fileAccepted })),

		fileRejected: "",
		setFileRejected: (fileRejected: React.ReactNode) => set(() => ({ fileRejected })),
	}));
};
