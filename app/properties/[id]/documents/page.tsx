"use client"

import { use, useEffect, useState } from "react"
import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { DocumentsTab } from "@/components/tabs/docs-tab/docs-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

interface DocumentsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
  const { id } = use(params)
  const [property, setProperty] = useState<PropertyData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchProperty() {
      setIsLoading(true)

      // First try mock data
      const mockProperty = getPropertyById(id)
      if (mockProperty) {
        setProperty(mockProperty)
        setIsLoading(false)
        return
      }

      // Then try database
      try {
        const response = await fetch(`/api/properties/${id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.property) {
            // Map database property to PropertyData interface
            const dbProperty: PropertyData = {
              id: data.property.id,
              name: data.property.name || 'New Property',
              address: [data.property.address, data.property.city, data.property.state, data.property.zip_code]
                .filter(Boolean)
                .join(', ') || 'Address pending',
              status: data.property.status === 'processing' ? 'Processing' :
                      data.property.status === 'active' ? 'Active' : 'Draft',
              thumbnail: data.property.thumbnail_url || '/placeholder.svg?height=200&width=300',
              offerPrice: data.property.offer_price ? `$${(data.property.offer_price / 1000000).toFixed(1)}M` : 'TBD',
              capRate: data.property.cap_rate ? `${data.property.cap_rate}%` : 'TBD',
              units: data.property.units || 0,
            }
            setProperty(dbProperty)
          }
        } else {
          console.warn(`[DocumentsPage] Property not found for ID: "${id}"`)
        }
      } catch (error) {
        console.error(`[DocumentsPage] Error fetching property:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="documents">
      <DocumentsTab property={property} propertyId={id} isLoading={isLoading} />
    </PropertyLayoutWrapper>
  )
}
