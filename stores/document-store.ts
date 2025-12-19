import { create } from 'zustand'
import { RentRollConfig } from '@/components/tabs/docs-tab/rent-roll/rr-configure'

// Types for Rent Roll data
export interface RentRollUnit {
  [key: string]: any
}

export interface Metadata {
  "Transaction Codes"?: string[]
  "Floor Plan Analysis"?: {
    floor_plans?: Record<string, any>
  }
  "Occupancy Mapping"?: Record<string, any>
  "Mapping for the charges"?: Record<string, string[]>
}

export interface RentRollDocumentData {
  data: RentRollUnit[]
  columns: string[]
  rawData: any[]
  baseHeaders: string[]
  metadata: Metadata | null
  config: RentRollConfig | null
  chargesMapping: Record<string, string[]>
  normalizedChargesMapping: Record<string, string>
  transactionCodes?: string[] // Dynamic transaction codes from API
  fetchedAt: number // timestamp for cache invalidation if needed
}

export interface T12DocumentData {
  extractedData: any[]
  metadata: any
  fetchedAt: number
}

interface DocumentCache {
  rentRoll: Record<string, RentRollDocumentData> // keyed by documentId
  t12: Record<string, T12DocumentData> // keyed by documentId
}

interface DocumentStoreState {
  // Cache storage
  cache: DocumentCache
  
  // Loading states per document
  loadingStates: Record<string, boolean>
  
  // Error states per document
  errorStates: Record<string, string | null>

  // Actions
  setRentRollData: (documentId: string, data: RentRollDocumentData) => void
  getRentRollData: (documentId: string) => RentRollDocumentData | null
  hasRentRollData: (documentId: string) => boolean
  
  setT12Data: (documentId: string, data: T12DocumentData) => void
  getT12Data: (documentId: string) => T12DocumentData | null
  hasT12Data: (documentId: string) => boolean
  
  setLoading: (documentId: string, loading: boolean) => void
  isLoading: (documentId: string) => boolean
  
  setError: (documentId: string, error: string | null) => void
  getError: (documentId: string) => string | null
  
  // Update specific fields in rent roll cache
  updateRentRollData: (documentId: string, updates: Partial<RentRollDocumentData>) => void
  updateRentRollConfig: (documentId: string, config: RentRollConfig) => void
  updateRentRollRow: (documentId: string, rowIndex: number, columnName: string, newValue: string) => void
  
  // Clear cache
  clearDocumentCache: (documentId: string) => void
  clearAllCache: () => void
  
  // Invalidate cache (for refresh scenarios)
  invalidateRentRoll: (documentId: string) => void
  invalidateT12: (documentId: string) => void
}

export const useDocumentStore = create<DocumentStoreState>((set, get) => ({
  cache: {
    rentRoll: {},
    t12: {},
  },
  loadingStates: {},
  errorStates: {},

  // Rent Roll actions
  setRentRollData: (documentId, data) => {
    set((state) => ({
      cache: {
        ...state.cache,
        rentRoll: {
          ...state.cache.rentRoll,
          [documentId]: data,
        },
      },
    }))
  },

  getRentRollData: (documentId) => {
    return get().cache.rentRoll[documentId] || null
  },

  hasRentRollData: (documentId) => {
    return !!get().cache.rentRoll[documentId]
  },

  // T12 actions
  setT12Data: (documentId, data) => {
    set((state) => ({
      cache: {
        ...state.cache,
        t12: {
          ...state.cache.t12,
          [documentId]: data,
        },
      },
    }))
  },

  getT12Data: (documentId) => {
    return get().cache.t12[documentId] || null
  },

  hasT12Data: (documentId) => {
    return !!get().cache.t12[documentId]
  },

  // Loading states
  setLoading: (documentId, loading) => {
    set((state) => ({
      loadingStates: {
        ...state.loadingStates,
        [documentId]: loading,
      },
    }))
  },

  isLoading: (documentId) => {
    return get().loadingStates[documentId] || false
  },

  // Error states
  setError: (documentId, error) => {
    set((state) => ({
      errorStates: {
        ...state.errorStates,
        [documentId]: error,
      },
    }))
  },

  getError: (documentId) => {
    return get().errorStates[documentId] || null
  },

  // Update rent roll data partially
  updateRentRollData: (documentId, updates) => {
    const current = get().cache.rentRoll[documentId]
    if (current) {
      set((state) => ({
        cache: {
          ...state.cache,
          rentRoll: {
            ...state.cache.rentRoll,
            [documentId]: {
              ...current,
              ...updates,
            },
          },
        },
      }))
    }
  },

  // Update rent roll config
  updateRentRollConfig: (documentId, config) => {
    const current = get().cache.rentRoll[documentId]
    if (current) {
      set((state) => ({
        cache: {
          ...state.cache,
          rentRoll: {
            ...state.cache.rentRoll,
            [documentId]: {
              ...current,
              config,
            },
          },
        },
      }))
    }
  },

  // Update a specific row in rent roll data
  updateRentRollRow: (documentId, rowIndex, columnName, newValue) => {
    const current = get().cache.rentRoll[documentId]
    if (current && current.data[rowIndex]) {
      const updatedData = [...current.data]
      updatedData[rowIndex] = {
        ...updatedData[rowIndex],
        [columnName]: newValue,
      }

      // Also update raw data if column exists
      let updatedRawData = current.rawData
      if (current.baseHeaders.length > 0) {
        const columnIndex = current.baseHeaders.indexOf(columnName)
        if (columnIndex !== -1 && current.rawData[rowIndex]) {
          updatedRawData = [...current.rawData]
          updatedRawData[rowIndex] = [...updatedRawData[rowIndex]]
          updatedRawData[rowIndex][columnIndex] = newValue
        }
      }

      set((state) => ({
        cache: {
          ...state.cache,
          rentRoll: {
            ...state.cache.rentRoll,
            [documentId]: {
              ...current,
              data: updatedData,
              rawData: updatedRawData,
            },
          },
        },
      }))
    }
  },

  // Clear specific document cache
  clearDocumentCache: (documentId) => {
    set((state) => {
      const newRentRoll = { ...state.cache.rentRoll }
      const newT12 = { ...state.cache.t12 }
      delete newRentRoll[documentId]
      delete newT12[documentId]
      
      const newLoadingStates = { ...state.loadingStates }
      const newErrorStates = { ...state.errorStates }
      delete newLoadingStates[documentId]
      delete newErrorStates[documentId]

      return {
        cache: {
          rentRoll: newRentRoll,
          t12: newT12,
        },
        loadingStates: newLoadingStates,
        errorStates: newErrorStates,
      }
    })
  },

  // Clear all cache
  clearAllCache: () => {
    set({
      cache: {
        rentRoll: {},
        t12: {},
      },
      loadingStates: {},
      errorStates: {},
    })
  },

  // Invalidate rent roll cache (forces refetch next time)
  invalidateRentRoll: (documentId) => {
    set((state) => {
      const newRentRoll = { ...state.cache.rentRoll }
      delete newRentRoll[documentId]
      return {
        cache: {
          ...state.cache,
          rentRoll: newRentRoll,
        },
      }
    })
  },

  // Invalidate T12 cache
  invalidateT12: (documentId) => {
    set((state) => {
      const newT12 = { ...state.cache.t12 }
      delete newT12[documentId]
      return {
        cache: {
          ...state.cache,
          t12: newT12,
        },
      }
    })
  },
}))
