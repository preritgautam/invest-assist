import { create } from 'zustand'

/**
 * Tab data types - maps to actual API responses
 */
export type TabType = 'os' | 'rentRoll' | 'om' | 'validation' | 'marketData' | 'assumptions' | 'documentData'

/**
 * Tab fetch status
 */
export interface TabDataState<T = any> {
  data: T | null
  loading: boolean
  error: string | null
  prefetched: boolean
  timestamp: number | null
}

/**
 * Combined document data for analyze tab
 */
export interface DocumentDataCombined {
  osData: any | null
  omData: any | null
  analysisData: any | null
}

/**
 * Property cache structure
 */
export interface PropertyTabCache {
  os: TabDataState
  rentRoll: TabDataState
  om: TabDataState
  validation: TabDataState
  marketData: TabDataState
  assumptions: TabDataState
  documentData: TabDataState<DocumentDataCombined>
}

/**
 * Home prefetch status
 */
interface HomePrefetchStatus {
  loading: boolean
  completed: number
  total: number
  propertyIds: string[]
}

/**
 * Create empty cache entry
 */
function createEmptyTabCache(): PropertyTabCache {
  return {
    os: { data: null, loading: false, error: null, prefetched: false, timestamp: null },
    rentRoll: { data: null, loading: false, error: null, prefetched: false, timestamp: null },
    om: { data: null, loading: false, error: null, prefetched: false, timestamp: null },
    validation: { data: null, loading: false, error: null, prefetched: false, timestamp: null },
    marketData: { data: null, loading: false, error: null, prefetched: false, timestamp: null },
    assumptions: { data: null, loading: false, error: null, prefetched: false, timestamp: null },
    documentData: { data: null, loading: false, error: null, prefetched: false, timestamp: null },
  }
}

/**
 * Chained prefetch rules - what to prefetch when viewing a tab
 */
const CHAINED_PREFETCH_RULES: Record<TabType, TabType[]> = {
  os: ['rentRoll'],           // T-12 → prefetch Rent Roll
  rentRoll: ['om'],           // Rent Roll → prefetch OM
  om: ['validation'],         // OM → prefetch Documents/Validation
  validation: [],             // Validation is last in chain
  marketData: ['assumptions'],
  assumptions: [],
  documentData: ['marketData', 'assumptions'],
}

/**
 * API endpoints for each tab
 */
const TAB_API_ENDPOINTS: Record<Exclude<TabType, 'documentData'>, (propertyId: string) => string> = {
  os: (id) => `/api/properties/${id}/os-data`,
  rentRoll: (id) => `/api/properties/${id}/rent-roll-data`,
  om: (id) => `/api/properties/${id}/om-data`,
  validation: (id) => `/api/documents/validation?propertyId=${id}`,
  marketData: (id) => `/api/walkscore?propertyId=${id}`,
  assumptions: (id) => `/api/properties/${id}/assumptions`,
}

/**
 * Tabs to prefetch on home page for each property
 */
const HOME_PREFETCH_TABS: TabType[] = ['os', 'rentRoll', 'om', 'assumptions', 'validation', 'documentData']

/**
 * Default max age for cache (5 minutes)
 */
const DEFAULT_MAX_AGE = 5 * 60 * 1000

/**
 * In-flight request tracking (module-level to persist across renders)
 */
const inFlightRequests: Record<string, Promise<any>> = {}

/**
 * Property Data Store State
 */
interface PropertyDataStore {
  // Cache storage
  cache: Record<string, PropertyTabCache>
  
  // Home prefetch status
  homePrefetchStatus: HomePrefetchStatus
  
  // Get cached data for a property/tab (never fetches, only reads)
  getTabData: <T = any>(propertyId: string, tab: TabType) => TabDataState<T>
  
  // Check if data exists and is not stale
  hasValidData: (propertyId: string, tab: TabType, maxAge?: number) => boolean
  
  // Check if data is stale
  isStale: (propertyId: string, tab: TabType, maxAge?: number) => boolean
  
  // Prefetch a single tab (skips if already prefetched)
  prefetchTab: (propertyId: string, tab: TabType) => Promise<void>
  
  // Prefetch multiple tabs in parallel
  prefetchTabs: (propertyId: string, tabs: TabType[]) => Promise<void>
  
  // Prefetch all data for all properties (home page optimization)
  prefetchAllProperties: (propertyIds: string[]) => Promise<void>
  
  // Prefetch on navigation intent (hover/pointer down)
  prefetchOnIntent: (propertyId: string) => void
  
  // Trigger chained prefetch based on current tab
  triggerChainedPrefetch: (propertyId: string, currentTab: TabType) => void
  
  // Update tab data manually (for when tabs modify data)
  updateTabData: <T = any>(propertyId: string, tab: TabType, data: T) => void
  
  // Invalidate cache for a property
  invalidateProperty: (propertyId: string) => void
  
  // Invalidate specific tab
  invalidateTab: (propertyId: string, tab: TabType) => void
  
  // Clear all cache
  clearCache: () => void
}

/**
 * Fetch document data (OS + OM + Analysis) in parallel
 */
async function fetchDocumentData(propertyId: string): Promise<DocumentDataCombined> {
  const [osResponse, omResponse, analysisResponse] = await Promise.all([
    fetch(`/api/properties/${propertyId}/os-data`),
    fetch(`/api/properties/${propertyId}/om-data`),
    fetch(`/api/properties/${propertyId}/analysis-data`),
  ])

  const osData = osResponse.ok ? await osResponse.json() : null
  const omData = omResponse.ok ? await omResponse.json() : null
  const analysisData = analysisResponse.ok ? await analysisResponse.json() : null

  return { osData, omData, analysisData }
}

/**
 * Fetch data for a specific tab with deduplication
 */
async function fetchTabDataInternal(propertyId: string, tab: TabType): Promise<any> {
  const requestKey = `${propertyId}-${tab}`
  
  // Return existing in-flight request if any (deduplication)
  const existingRequest = inFlightRequests[requestKey]
  if (existingRequest !== undefined) {
    return existingRequest
  }

  // Special handling for documentData
  if (tab === 'documentData') {
    const fetchPromise = (async () => {
      try {
        return await fetchDocumentData(propertyId)
      } finally {
        delete inFlightRequests[requestKey]
      }
    })()
    inFlightRequests[requestKey] = fetchPromise
    return fetchPromise
  }

  const endpoint = TAB_API_ENDPOINTS[tab](propertyId)
  
  const fetchPromise = (async () => {
    try {
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${tab} data: ${response.statusText}`)
      }
      return await response.json()
    } finally {
      delete inFlightRequests[requestKey]
    }
  })()

  inFlightRequests[requestKey] = fetchPromise
  return fetchPromise
}

/**
 * Zustand Property Data Store
 */
export const usePropertyDataStore = create<PropertyDataStore>((set, get) => ({
  cache: {},
  
  homePrefetchStatus: {
    loading: false,
    completed: 0,
    total: 0,
    propertyIds: [],
  },

  getTabData: <T = any>(propertyId: string, tab: TabType): TabDataState<T> => {
    const { cache } = get()
    if (!cache[propertyId]) {
      return { data: null, loading: false, error: null, prefetched: false, timestamp: null }
    }
    return cache[propertyId][tab] as TabDataState<T>
  },

  hasValidData: (propertyId: string, tab: TabType, maxAge: number = DEFAULT_MAX_AGE): boolean => {
    const { cache } = get()
    const tabData = cache[propertyId]?.[tab]
    if (!tabData?.prefetched || !tabData?.data || !tabData?.timestamp) return false
    return Date.now() - tabData.timestamp <= maxAge
  },

  isStale: (propertyId: string, tab: TabType, maxAge: number = DEFAULT_MAX_AGE): boolean => {
    const { cache } = get()
    const tabData = cache[propertyId]?.[tab]
    if (!tabData?.timestamp) return true
    return Date.now() - tabData.timestamp > maxAge
  },

  prefetchTab: async (propertyId: string, tab: TabType) => {
    const { cache, isStale } = get()
    
    // Skip if already prefetched and not stale
    const existing = cache[propertyId]?.[tab]
    if (existing?.prefetched && !isStale(propertyId, tab)) {
      return
    }

    // Skip if currently loading (prevent duplicate requests)
    if (existing?.loading) {
      return
    }

    // Set loading state
    set(state => ({
      cache: {
        ...state.cache,
        [propertyId]: {
          ...(state.cache[propertyId] || createEmptyTabCache()),
          [tab]: {
            ...(state.cache[propertyId]?.[tab] || createEmptyTabCache()[tab]),
            loading: true,
            error: null,
          },
        },
      },
    }))

    try {
      const data = await fetchTabDataInternal(propertyId, tab)
      
      set(state => ({
        cache: {
          ...state.cache,
          [propertyId]: {
            ...(state.cache[propertyId] || createEmptyTabCache()),
            [tab]: {
              data,
              loading: false,
              error: null,
              prefetched: true,
              timestamp: Date.now(),
            },
          },
        },
      }))
    } catch (error) {
      set(state => ({
        cache: {
          ...state.cache,
          [propertyId]: {
            ...(state.cache[propertyId] || createEmptyTabCache()),
            [tab]: {
              ...(state.cache[propertyId]?.[tab] || createEmptyTabCache()[tab]),
              loading: false,
              error: error instanceof Error ? error.message : 'Unknown error',
              prefetched: false,
            },
          },
        },
      }))
    }
  },

  prefetchTabs: async (propertyId: string, tabs: TabType[]) => {
    const { hasValidData, prefetchTab } = get()
    
    // Filter to only tabs that need fetching
    const tabsToFetch = tabs.filter(tab => !hasValidData(propertyId, tab))
    
    if (tabsToFetch.length === 0) return
    
    // Fetch all in parallel
    await Promise.all(tabsToFetch.map(tab => prefetchTab(propertyId, tab)))
  },

  prefetchAllProperties: async (propertyIds: string[]) => {
    if (propertyIds.length === 0) return

    const { hasValidData, prefetchTab } = get()

    // Find properties that need prefetching
    const propertiesNeedingFetch = propertyIds.filter(id => 
      HOME_PREFETCH_TABS.some(tab => !hasValidData(id, tab))
    )

    if (propertiesNeedingFetch.length === 0) {
      set({
        homePrefetchStatus: {
          loading: false,
          completed: propertyIds.length,
          total: propertyIds.length,
          propertyIds,
        },
      })
      return
    }

    set({
      homePrefetchStatus: {
        loading: true,
        completed: propertyIds.length - propertiesNeedingFetch.length,
        total: propertyIds.length,
        propertyIds,
      },
    })

    // Fetch in chunks to avoid overwhelming the server
    const CHUNK_SIZE = 2
    let completed = propertyIds.length - propertiesNeedingFetch.length

    for (let i = 0; i < propertiesNeedingFetch.length; i += CHUNK_SIZE) {
      const chunk = propertiesNeedingFetch.slice(i, i + CHUNK_SIZE)
      
      await Promise.all(
        chunk.map(async (propertyId) => {
          // Fetch all tabs for this property in parallel
          await Promise.all(
            HOME_PREFETCH_TABS.map(tab => prefetchTab(propertyId, tab))
          )
          
          completed++
          set(state => ({
            homePrefetchStatus: {
              ...state.homePrefetchStatus,
              completed,
            },
          }))
        })
      )
    }

    set(state => ({
      homePrefetchStatus: {
        ...state.homePrefetchStatus,
        loading: false,
      },
    }))
  },

  prefetchOnIntent: (propertyId: string) => {
    const { prefetchTabs } = get()
    // Prefetch all critical tabs when user shows navigation intent
    prefetchTabs(propertyId, HOME_PREFETCH_TABS)
  },

  triggerChainedPrefetch: (propertyId: string, currentTab: TabType) => {
    const { prefetchTabs } = get()
    const tabsToPreload = CHAINED_PREFETCH_RULES[currentTab]
    if (tabsToPreload.length > 0) {
      // Prefetch in background
      prefetchTabs(propertyId, tabsToPreload)
    }
  },

  updateTabData: <T = any>(propertyId: string, tab: TabType, data: T) => {
    set(state => ({
      cache: {
        ...state.cache,
        [propertyId]: {
          ...(state.cache[propertyId] || createEmptyTabCache()),
          [tab]: {
            data,
            loading: false,
            error: null,
            prefetched: true,
            timestamp: Date.now(),
          },
        },
      },
    }))
  },

  invalidateProperty: (propertyId: string) => {
    set(state => {
      const newCache = { ...state.cache }
      delete newCache[propertyId]
      return { cache: newCache }
    })
  },

  invalidateTab: (propertyId: string, tab: TabType) => {
    set(state => ({
      cache: {
        ...state.cache,
        [propertyId]: {
          ...(state.cache[propertyId] || createEmptyTabCache()),
          [tab]: createEmptyTabCache()[tab],
        },
      },
    }))
  },

  clearCache: () => {
    set({ cache: {} })
  },
}))

/**
 * Hook to get tab data (read-only, never fetches)
 * Tabs should use this to read from cache
 */
export function useTabDataReadOnly<T = any>(propertyId: string, tab: TabType) {
  const data = usePropertyDataStore(state => state.cache[propertyId]?.[tab]?.data as T | null)
  const loading = usePropertyDataStore(state => state.cache[propertyId]?.[tab]?.loading ?? false)
  const error = usePropertyDataStore(state => state.cache[propertyId]?.[tab]?.error ?? null)
  const prefetched = usePropertyDataStore(state => state.cache[propertyId]?.[tab]?.prefetched ?? false)
  const timestamp = usePropertyDataStore(state => state.cache[propertyId]?.[tab]?.timestamp ?? null)

  return {
    data,
    loading,
    error,
    prefetched,
    timestamp,
    hasData: data !== null,
  }
}

/**
 * Hook for navigation intent prefetching
 * Returns handlers to attach to property cards
 */
export function usePrefetchOnIntent(propertyId: string) {
  const prefetchOnIntent = usePropertyDataStore(state => state.prefetchOnIntent)

  return {
    onMouseEnter: () => prefetchOnIntent(propertyId),
    onPointerDown: () => prefetchOnIntent(propertyId),
    onFocus: () => prefetchOnIntent(propertyId),
  }
}

/**
 * Hook for home page prefetching
 */
export function useHomePrefetch(propertyIds: string[], enabled: boolean = true) {
  const prefetchAllProperties = usePropertyDataStore(state => state.prefetchAllProperties)
  const homePrefetchStatus = usePropertyDataStore(state => state.homePrefetchStatus)

  // Use a ref to track if we've already initiated prefetch for these IDs
  const hasPrefetchedRef = { current: false }
  const previousIdsRef = { current: '' }

  if (enabled && propertyIds.length > 0) {
    const idsKey = propertyIds.join(',')
    if (idsKey !== previousIdsRef.current || !hasPrefetchedRef.current) {
      previousIdsRef.current = idsKey
      hasPrefetchedRef.current = true
      // Start prefetch immediately (not in useEffect to avoid waterfall)
      prefetchAllProperties(propertyIds)
    }
  }

  return homePrefetchStatus
}

/**
 * Hook for chained prefetching when viewing a tab
 */
export function useChainedPrefetch(propertyId: string, currentTab: TabType) {
  const triggerChainedPrefetch = usePropertyDataStore(state => state.triggerChainedPrefetch)
  
  // Trigger once when tab is viewed
  if (propertyId && currentTab) {
    triggerChainedPrefetch(propertyId, currentTab)
  }
}
