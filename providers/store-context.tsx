"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '@/lib/axios'
import type { StoreData } from '@/types/store'

interface StoreContextType {
    stores: StoreData[]
    currentStore: StoreData | null
    setCurrentStore: (store: StoreData) => void
    isLoading: boolean
    fetchStores: () => Promise<void>
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [stores, setStores] = useState<StoreData[]>([])
    const [currentStore, setCurrentStoreState] = useState<StoreData | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const fetchStores = async () => {
        try {
            setIsLoading(true)
            const response = await api.get('/stores/me')
            const storesData = response.data.stores
            setStores(storesData)

            // Set current store from localStorage or first store
            const savedStoreId = localStorage.getItem('currentStoreId')
            const savedStore = storesData.find((store: StoreData) => store.id === savedStoreId)
            setCurrentStoreState(savedStore || storesData[0] || null)
        } catch (error) {
            console.error('Error fetching stores:', error)
            setStores([])
            setCurrentStoreState(null)
        } finally {
            setIsLoading(false)
        }
    }

    const setCurrentStore = (store: StoreData) => {
        setCurrentStoreState(store)
        localStorage.setItem('currentStoreId', store.id)
    }

    useEffect(() => {
        fetchStores()
    }, [])

    return (
        <StoreContext.Provider
            value={{
                stores,
                currentStore,
                setCurrentStore,
                isLoading,
                fetchStores,
            }}
        >
            {children}
        </StoreContext.Provider>
    )
}

export function useStore() {
    const context = useContext(StoreContext)
    if (context === undefined) {
        throw new Error('useStore must be used within a StoreProvider')
    }
    return context
} 