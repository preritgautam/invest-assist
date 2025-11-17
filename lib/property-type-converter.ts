/**
 * Property type conversion utilities
 *
 * Converts between PropertyData and component-specific property types
 */

import type { PropertyData } from "@/lib/property-data"
import type { Property } from "@/components/tabs/capital-tab/types"

/**
 * Converts PropertyData to the Property interface used by components like CapitalTab and PlanTab
 */
export function convertPropertyDataToProperty(propertyData: PropertyData | null): Property | null {
  if (!propertyData) return null

  return {
    id: propertyData.id,
    name: propertyData.name,
    address: propertyData.address,
    isActive: propertyData.status === "Active",
  }
}
