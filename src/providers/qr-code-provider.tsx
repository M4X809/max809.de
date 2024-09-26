// src/providers/qrCode-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type QrCodeStore, createQrCodeStore } from '~/stores/qr-code-store'

export type QrCodeStoreApi = ReturnType<typeof createQrCodeStore>

export const QrCodeStoreContext = createContext<QrCodeStoreApi | undefined>(
    undefined,
)

export interface QrCodeStoreProviderProps {
    children: ReactNode
}

export const QrCodeStoreProvider = ({
    children,
}: QrCodeStoreProviderProps) => {
    const storeRef = useRef<QrCodeStoreApi>()
    if (!storeRef.current) {
        storeRef.current = createQrCodeStore()
    }

    return (
        <QrCodeStoreContext.Provider value={storeRef.current}>
            {children}
        </QrCodeStoreContext.Provider>
    )
}

export const useQrCodeStore = <T,>(
    selector: (store: QrCodeStore) => T,
): T => {
    const qrCodeStoreContext = useContext(QrCodeStoreContext)

    if (!qrCodeStoreContext) {
        throw new Error("useQrCodeStore must be used within QrCodeStoreProvider")
    }

    return useStore(qrCodeStoreContext, selector)
}
