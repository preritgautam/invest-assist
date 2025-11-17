"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { SummaryTab } from "@/components/tabs/summary-tab"
import { getPropertyById } from "@/lib/property-data"
import { convertPropertyDataToProperty } from "@/lib/property-type-converter"
import { use } from "react"

interface SummaryPageProps {
  params: Promise<{
    id: string
  }>
}

export default function SummaryPage({ params }: SummaryPageProps) {
  const { id } = use(params)
  const propertyData = getPropertyById(id) || null
  const property = convertPropertyDataToProperty(propertyData)

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="summary">
      <SummaryTab property={property} />
    </PropertyLayoutWrapper>
  )
}
