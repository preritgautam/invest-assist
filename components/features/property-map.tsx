"use client"

import type { PropertyData } from "@/lib/property-data"

interface PropertyMapProps {
  properties: PropertyData[]
  onPropertyClick: (propertyId: string) => void
}

export function PropertyMap({ properties, onPropertyClick }: PropertyMapProps) {
  return (
    <div className="w-full h-96 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 font-medium">Map view coming soon</p>
        <p className="text-sm text-gray-500 mt-1">Showing {properties.length} properties</p>
      </div>
    </div>
  )
}
