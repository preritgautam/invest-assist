// app/property/[id]/sources-uses/page.tsx
import { OutlayTab } from "@/components/tabs/outlay-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyOutlayPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <OutlayTab property={property} />
}
