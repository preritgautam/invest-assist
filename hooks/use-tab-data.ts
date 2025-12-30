"use client"

import { useEffect, useRef } from "react"
import { 
  usePropertyDataStore, 
  useTabDataReadOnly, 
  TabType,
  DocumentDataCombined 
} from "@/stores/property-data-store"

// Re-export types
export type { TabType, DocumentDataCombined }

/**
 * Hook to get cached tab data with automatic chained prefetching
 * IMPORTANT: This hook reads from cache. Data should be prefetched beforehand.
 * Will trigger fallback fetch only if data is missing.
 * 
 * @param propertyId - The property ID
 * @param tab - The tab type to get data for
 * @param enableChainedPrefetch - Whether to trigger chained prefetch (default: true)
 */
export function useTabData<T = any>(
  propertyId: string,
  tab: TabType,
  enableChainedPrefetch: boolean = true
) {
  const tabData = useTabDataReadOnly<T>(propertyId, tab)
  const triggerChainedPrefetch = usePropertyDataStore(state => state.triggerChainedPrefetch)
  const prefetchTab = usePropertyDataStore(state => state.prefetchTab)
  const hasTriggeredChain = useRef(false)
  const hasTriggeredFallback = useRef(false)

  // Trigger chained prefetch when this tab is viewed (once)
  useEffect(() => {
    if (enableChainedPrefetch && propertyId && !hasTriggeredChain.current) {
      hasTriggeredChain.current = true
      triggerChainedPrefetch(propertyId, tab)
    }
  }, [propertyId, tab, enableChainedPrefetch, triggerChainedPrefetch])

  // Fallback: fetch if not prefetched (shouldn't happen if prefetch works correctly)
  useEffect(() => {
    if (propertyId && !tabData.prefetched && !tabData.loading && !hasTriggeredFallback.current) {
      hasTriggeredFallback.current = true
      console.warn(`[useTabData] Fallback fetch for ${tab} - data should be prefetched`)
      prefetchTab(propertyId, tab)
    }
  }, [propertyId, tab, tabData.prefetched, tabData.loading, prefetchTab])

  // Reset when property changes
  useEffect(() => {
    hasTriggeredChain.current = false
    hasTriggeredFallback.current = false
  }, [propertyId])

  return {
    data: tabData.data,
    loading: tabData.loading,
    error: tabData.error,
    prefetched: tabData.prefetched,
    timestamp: tabData.timestamp,
    isInitialLoading: tabData.loading && !tabData.data,
    hasData: tabData.hasData,
  }
}

/**
 * Hook to prefetch data for a property when entering property pages
 * Call this in PropertyLayoutWrapper
 */
export function usePropertyPrefetch(propertyId: string, initialTab: TabType = 'os') {
  const prefetchTabs = usePropertyDataStore(state => state.prefetchTabs)
  const hasValidData = usePropertyDataStore(state => state.hasValidData)
  const hasPrefetched = useRef(false)

  useEffect(() => {
    if (propertyId && !hasPrefetched.current) {
      hasPrefetched.current = true
      
      // If data doesn't exist, prefetch all tabs for this property
      if (!hasValidData(propertyId, initialTab)) {
        prefetchTabs(propertyId, ['os', 'rentRoll', 'om', 'assumptions', 'validation', 'documentData'])
      }
    }
  }, [propertyId, initialTab, prefetchTabs, hasValidData])

  // Reset when property changes
  useEffect(() => {
    hasPrefetched.current = false
  }, [propertyId])
}

/**
 * Hook to prefetch all properties' data on the home page
 */
export function useHomePrefetch(propertyIds: string[], enabled: boolean = true) {
  const prefetchAllProperties = usePropertyDataStore(state => state.prefetchAllProperties)
  const homePrefetchStatus = usePropertyDataStore(state => state.homePrefetchStatus)
  const hasPrefetched = useRef(false)
  const previousIdsRef = useRef<string[]>([])

  useEffect(() => {
    if (!enabled || propertyIds.length === 0) return

    const idsChanged = JSON.stringify(propertyIds) !== JSON.stringify(previousIdsRef.current)
    
    if (idsChanged || !hasPrefetched.current) {
      hasPrefetched.current = true
      previousIdsRef.current = propertyIds
      prefetchAllProperties(propertyIds)
    }
  }, [propertyIds, enabled, prefetchAllProperties])

  return homePrefetchStatus
}

/**
 * Hook for navigation intent prefetching
 * Returns event handlers to attach to property cards/links
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
 * Hook to manually control prefetching
 */
export function usePrefetchControl() {
  const prefetchTabs = usePropertyDataStore(state => state.prefetchTabs)
  const prefetchTab = usePropertyDataStore(state => state.prefetchTab)
  const invalidateProperty = usePropertyDataStore(state => state.invalidateProperty)
  const invalidateTab = usePropertyDataStore(state => state.invalidateTab)
  const isStale = usePropertyDataStore(state => state.isStale)
  const updateTabData = usePropertyDataStore(state => state.updateTabData)

  return {
    prefetch: prefetchTabs,
    prefetchSingle: prefetchTab,
    invalidateProperty,
    invalidateTab,
    isStale,
    updateData: updateTabData,
  }
}

/**
 * Legacy hook for backwards compatibility with existing context usage
 * @deprecated Use individual hooks instead
 */
export function usePropertyData() {
  const store = usePropertyDataStore()
  
  return {
    cache: store.cache,
    getTabData: store.getTabData,
    prefetchTab: store.prefetchTab,
    prefetchTabs: store.prefetchTabs,
    prefetchAllPropertiesOS: store.prefetchAllProperties,
    triggerChainedPrefetch: store.triggerChainedPrefetch,
    updateTabData: store.updateTabData,
    invalidateProperty: store.invalidateProperty,
    invalidateTab: store.invalidateTab,
    isStale: store.isStale,
    homePrefetchStatus: store.homePrefetchStatus,
  }
}
