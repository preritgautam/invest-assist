"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { PlanTab } from "@/components/tabs/plan-tab"
import { getPropertyById } from "@/lib/property-data"
import { convertPropertyDataToProperty } from "@/lib/property-type-converter"
import { use } from "react"

interface PlanPageProps {
  params: Promise<{
    id: string
  }>
}

export default function PlanPage({ params }: PlanPageProps) {
  const { id } = use(params)
  const propertyData = getPropertyById(id) || null
  const property = convertPropertyDataToProperty(propertyData)

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="business-plan">
      <PlanTab property={property} />
    </PropertyLayoutWrapper>
  )
}
