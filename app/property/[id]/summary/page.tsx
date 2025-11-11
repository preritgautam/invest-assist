// app/property/[id]/summary/page.tsx
import { SummaryTab } from "@/components/tabs/summary-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertySummaryPage({ params }: Props) {
  // you can still fetch server data here if needed, or rely on layout-provided property
  const property: PropertyData | null = getPropertyById(params.id) ?? null

  return <SummaryTab property={property} />
}
