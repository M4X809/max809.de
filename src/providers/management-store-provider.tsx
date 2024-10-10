// src/providers/management-store-provider.tsx
'use client'

import { type ReactNode, createContext, useRef, useContext } from 'react'
import { useStore } from 'zustand'

import { type ManagementStore, createManagementStore } from '~/stores/management-store'

export type ManagementStoreApi = ReturnType<typeof createManagementStore>

export const ManagementStoreContext = createContext<ManagementStoreApi | undefined>(
    undefined,
)

export interface ManagementStoreProviderProps {
    children: ReactNode
}

export const ManagementStoreProvider = ({
    children,
}: ManagementStoreProviderProps) => {
    const storeRef = useRef<ManagementStoreApi>()
    if (!storeRef.current) {
        storeRef.current = createManagementStore()
    }

    return (
        <ManagementStoreContext.Provider value={storeRef.current}>
            {children}
        </ManagementStoreContext.Provider>
    )
}

export const useManagementStore = <T,>(
    selector: (store: ManagementStore) => T,
): T => {
    const managementStoreContext = useContext(ManagementStoreContext)

    if (!managementStoreContext) {
        throw new Error("useManagementStore must be used within ManagementStoreProvider")
    }

    return useStore(managementStoreContext, selector)
}
