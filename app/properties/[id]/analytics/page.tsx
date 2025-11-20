"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { UnderwritingGraphsTab } from "@/components/tabs/analytics-tab"
import { getPropertyById } from "@/lib/property-data"

interface AnalyticsPageProps {
  params: {
    id: string
  }
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = params
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="underwriting-graphs">
      <UnderwritingGraphsTab property={property} />
    </PropertyLayoutWrapper>
  )
}
