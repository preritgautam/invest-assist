"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { ReturnsTab } from "@/components/tabs/returns-tab"
import { getPropertyById } from "@/lib/property-data"

interface ReturnsPageProps {
  params: {
    id: string
  }
}

export default function ReturnsPage({ params }: ReturnsPageProps) {
  const { id } = params
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="returns">
      <ReturnsTab property={property} />
    </PropertyLayoutWrapper>
  )
}
