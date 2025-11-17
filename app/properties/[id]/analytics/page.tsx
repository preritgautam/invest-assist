"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { UnderwritingGraphsTab } from "@/components/tabs/analytics-tab"
import { getPropertyById } from "@/lib/property-data"
import { use } from "react"

interface AnalyticsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { id } = use(params)
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="underwriting-graphs">
      <UnderwritingGraphsTab property={property} />
    </PropertyLayoutWrapper>
  )
}
