"use client"

import { use } from "react"
import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { PropertyTab } from "@/components/tabs/property-tab/property-tab"
import { getPropertyById } from "@/lib/property-data"

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = use(params)
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="property">
      <PropertyTab property={property} />
    </PropertyLayoutWrapper>
  )
}
