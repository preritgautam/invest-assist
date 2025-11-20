"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { OutlayTab } from "@/components/tabs/outlay-tab"
import { getPropertyById } from "@/lib/property-data"

interface OutlayPageProps {
  params: {
    id: string
  }
}

export default function OutlayPage({ params }: OutlayPageProps) {
  const { id } = params
  const property = getPropertyById(id) || null

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="sources-uses">
      <OutlayTab property={property} />
    </PropertyLayoutWrapper>
  )
}
