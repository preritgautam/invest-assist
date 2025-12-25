"use client"

import { PropertyLayoutWrapper } from "@/components/property-layout-wrapper"
import { PropertyTab } from "@/components/tabs/property-tab/property-tab"
import { getPropertyById } from "@/lib/property-data"
import { useEffect } from "react"
import type { PropertyDocument } from "@/components/tabs/docs-tab/types"
import { useState } from "react"

interface PropertyPageProps {
  params: {
    id: string
  }
}

function mapDocumentType(dbType: string | null): "OS" | "RR" | "OM" | "Appraisal" | "Insurance" {
  const typeMap: Record<string, "OS" | "RR" | "OM" | "Appraisal" | "Insurance"> = {
    rent_roll: "RR",
    operating_statement: "OS",
    t12: "OS",
    offering_memorandum: "OM",
    om: "OM",
    appraisal: "Appraisal",
    insurance: "Insurance",
  }
  return typeMap[dbType?.toLowerCase() || ""] || "OS"
}

function mapProcessingStage(status: string): "upload" | "extracting" | "review" | "verified" {
  const stageMap: Record<string, "upload" | "extracting" | "review" | "verified"> = {
    pending: "upload",
    processing: "extracting",
    completed: "review",
    verified: "verified",
    failed: "upload",
  }
  return stageMap[status?.toLowerCase() || ""] || "upload"
}

interface DatabaseDocument {
  id: number
  user_id: string
  process_id: string
  document_id: string | null
  filename: string
  document_type: string | null
  file_size: number | null
  upload_status: string
  extraction_status: string
  created_at: string
  updated_at: string
}

export default function PropertyPage({ params }: PropertyPageProps) {
  const { id } = params
  const [documents, setDocuments] = useState<PropertyDocument[]>([])
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const property = getPropertyById(id) || null

  useEffect(() => {
    async function fetchDocuments() {
      try {
        // Build URL with propertyId filter if available
        const url = id ? `/api/documents/list?propertyId=${encodeURIComponent(id)}` : "/api/documents/list"
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch documents")
        }

        if (data.documents && data.documents.length > 0) {
          // Filter documents to only include those with completed extraction
          const completedDocuments = data.documents.filter(
            (doc: DatabaseDocument) => doc.extraction_status === "completed",
          )

          // Map database documents to PropertyDocument interface
          const mappedDocuments: PropertyDocument[] = completedDocuments.map((doc: DatabaseDocument) => ({
            // Use document_id if extraction is completed and doc.document_id exists
            id: doc.document_id || doc.process_id,
            name: doc.filename,
            type: mapDocumentType(doc.document_type),
            uploadDate: doc.created_at.split("T")[0],
            stage: mapProcessingStage(doc.extraction_status),
            // For RR documents, we'll load the rent roll data when selected
            rentRollData: mapDocumentType(doc.document_type) === "RR",
            extractedData: mapDocumentType(doc.document_type) === "OS",
            extractionStatus: doc.extraction_status,
            holdPeriod: 7,
          }))

          setDocuments(mappedDocuments)

          if (mappedDocuments.length > 0) {
            const firstOsDoc = mappedDocuments.find((d) => d.type === "OS")
            const docToSelect = firstOsDoc || mappedDocuments[0]
            setSelectedDoc(docToSelect.id)
          }
        }
      } catch (error) {
        console.error("[DocsTab] Error fetching documents:", error)
      } finally {
      }
    }

    fetchDocuments()
  }, [id, property])

  return (
    <PropertyLayoutWrapper propertyId={id} currentTab="property">
      <PropertyTab property={property} propertyId={id} documents={documents} />
    </PropertyLayoutWrapper>
  )
}
