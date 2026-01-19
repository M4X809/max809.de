// src/providers/app-store-provider.tsx
"use client";

import { type ReactNode, createContext, useRef, useContext } from "react";
import { useStore } from "zustand";

import { type CubeStore, createCubeStore } from "~/stores/cube-timer-store";

export type CubeStoreApi = ReturnType<typeof createCubeStore>;

export const CubeStoreContext = createContext<CubeStoreApi | undefined>(undefined);

export interface CubeStoreProviderProps {
	children: ReactNode;
}

export const CubeStoreProvider = ({ children }: CubeStoreProviderProps) => {
	const storeRef = useRef<CubeStoreApi>(null);
	if (!storeRef.current) {
		storeRef.current = createCubeStore();
	}

	return <CubeStoreContext.Provider value={storeRef.current}>{children}</CubeStoreContext.Provider>;
};

export const useCubeStore = <T,>(selector: (store: CubeStore) => T): T => {
	const cubeStoreContext = useContext(CubeStoreContext);

	if (!cubeStoreContext) {
		throw new Error("useCubeStore must be used within CubeStoreProvider");
	}

	return useStore(cubeStoreContext, selector);
};
