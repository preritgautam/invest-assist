"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { OutlayTab } from "@/components/tabs/outlay-tab"
import { getPropertyById } from "@/lib/property-data"
import { use } from "react"

interface OutlayPageProps {
  params: Promise<{
    id: string
  }>
}

export default function OutlayPage({ params }: OutlayPageProps) {
  const { id } = use(params)
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="sources-uses">
      <OutlayTab property={property} />
    </PropertyLayoutWrapper>
  )
}
