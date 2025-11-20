"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { CapitalTab } from "@/components/tabs/capital-tab"
import { getPropertyById } from "@/lib/property-data"
import { convertPropertyDataToProperty } from "@/lib/property-type-converter"

interface CapitalPageProps {
  params: {
    id: string
  }
}

export default function CapitalPage({ params }: CapitalPageProps) {
  const { id } = params
  const propertyData = getPropertyById(id) || null
  const property = convertPropertyDataToProperty(propertyData)

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="debt-assumptions">
      <CapitalTab property={property} />
    </PropertyLayoutWrapper>
  )
}
