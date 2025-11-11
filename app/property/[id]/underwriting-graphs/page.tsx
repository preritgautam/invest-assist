// app/property/[id]/underwriting-graphs/page.tsx
import { UnderwritingGraphsTab } from "@/components/tabs/analytics-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyAnalyticsPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <UnderwritingGraphsTab property={property} />
}
