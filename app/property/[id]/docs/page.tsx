// app/property/[id]/docs/page.tsx
import { DocumentsTab } from "@/components/tabs/docs-tab/docs-tab"
import { T12ActualsTab } from "@/components/tabs/docs-tab/t12-actuals-tab"
import { getPropertyById, type PropertyData } from "@/lib/property-data"

type Props = { params: { id: string } }

export default function PropertyDocsPage({ params }: Props) {
  const property: PropertyData | null = getPropertyById(params.id) ?? null
  return (
    <DocumentsTab property={property}>
      {property && <T12ActualsTab property={property} />}
    </DocumentsTab>
  )
}
