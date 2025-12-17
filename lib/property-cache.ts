/**
 * Simple in-memory property cache to avoid duplicate API calls
 * Properties fetched on the home page are cached and reused when navigating
 */

import type { PropertyData } from './property-data'

// Database property type (raw from API)
export interface DatabaseProperty {
  id: string
  company_id: string
  name: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  status: string
  thumbnail_url: string | null
  offer_price: number | null
  cap_rate: number | null
  units: number | null
  year_built: number | null
  occupancy: number | null
  avg_sqft_per_unit: number | null
  metadata: Record<string, any>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Cache storage
const propertyCache = new Map<string, PropertyData>()
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Convert database property to PropertyData format
 */
export function convertDbPropertyToPropertyData(dbProperty: DatabaseProperty): PropertyData {
  return {
    id: dbProperty.id,
    name: dbProperty.name || 'New Property',
    address: [dbProperty.address, dbProperty.city, dbProperty.state, dbProperty.zip_code]
      .filter(Boolean)
      .join(', ') || 'Address pending',
    status: dbProperty.status === 'processing' ? 'Processing' :
            dbProperty.status === 'active' ? 'Active' : 'Draft',
    thumbnail: dbProperty.thumbnail_url || '/placeholder.svg?height=200&width=300',
    offerPrice: dbProperty.offer_price ? `$${(dbProperty.offer_price / 1000000).toFixed(1)}M` : 'TBD',
    capRate: dbProperty.cap_rate ? `${dbProperty.cap_rate}%` : 'TBD',
    units: dbProperty.units || 0,
    yearBuilt: dbProperty.year_built ?? undefined,
    occupancy: dbProperty.occupancy ? `${dbProperty.occupancy}%` : undefined,
    avgSqFtPerUnit: dbProperty.avg_sqft_per_unit ?? undefined,
  }
}

/**
 * Store a property in the cache
 */
export function cacheProperty(property: PropertyData): void {
  propertyCache.set(property.id, property)
  cacheTimestamp = Date.now()
}

/**
 * Store multiple properties in the cache (from list API)
 */
export function cacheProperties(dbProperties: DatabaseProperty[]): PropertyData[] {
  const converted: PropertyData[] = []
  for (const dbProp of dbProperties) {
    const property = convertDbPropertyToPropertyData(dbProp)
    propertyCache.set(property.id, property)
    converted.push(property)
  }
  cacheTimestamp = Date.now()
  return converted
}

/**
 * Get a property from cache
 * Returns null if not found or cache is stale
 */
export function getCachedProperty(propertyId: string): PropertyData | null {
  // Check if cache is stale
  if (Date.now() - cacheTimestamp > CACHE_TTL) {
    return null
  }
  return propertyCache.get(propertyId) || null
}

/**
 * Check if a property exists in cache
 */
export function isPropertyCached(propertyId: string): boolean {
  if (Date.now() - cacheTimestamp > CACHE_TTL) {
    return false
  }
  return propertyCache.has(propertyId)
}

/**
 * Clear the cache
 */
export function clearPropertyCache(): void {
  propertyCache.clear()
  cacheTimestamp = 0
}

/**
 * Get all cached properties
 */
export function getAllCachedProperties(): PropertyData[] {
  if (Date.now() - cacheTimestamp > CACHE_TTL) {
    return []
  }
  return Array.from(propertyCache.values())
}
