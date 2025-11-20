"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { PropertyTab } from "@/components/tabs/property-tab/property-tab"
import { getPropertyById } from "@/lib/property-data"

interface PropertyPageProps {
  params: {
    id: string
  }
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = params
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="property">
      <PropertyTab property={property} />
    </PropertyLayoutWrapper>
  )
}
