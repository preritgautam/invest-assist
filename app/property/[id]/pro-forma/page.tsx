// app/property/[id]/pro-forma/page.tsx
import { ProFormaTab } from "@/components/tabs/pro-forma-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyProFormaPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return <ProFormaTab property={property} />
}
