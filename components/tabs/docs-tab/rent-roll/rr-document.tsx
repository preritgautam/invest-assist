"use client"

import { useState, useEffect } from "react"
import { RRConfigure } from "./rr-configure"

type RentRollUnit = Record<string, any>

const mockRentRollData: RentRollUnit[] = []

export interface TenantChargeConfig {
  id: string
  name: string
  apiField: string
  frequency: "Monthly" | "Annual" | "One-Time"
  targetFrequency: "Monthly" | "Annual" | "One-Time"
  isActive?: boolean
}

export interface FloorPlan {
  id: string
  name: string
  bedrooms: number
  bathrooms: number
  isRenovated: boolean
}

export interface OccupancyMapping {
  id: string
  rawStatus: string
  normalizedStatus: string
}

export interface RentRollConfig {
  tenantCharges: TenantChargeConfig[]
  floorPlans: FloorPlan[]
  occupancyMappings: OccupancyMapping[]
  availableColumns: string[]
}

interface Metadata {
  "Transaction Codes"?: string[]
  "Floor Plan Analysis"?: {
    floor_plans?: Record<string, any>
  }
  "Occupancy Mapping"?: Record<string, any>
  "Mapping for the charges"?: Record<string, string[]>
}

function buildConfigFromMetadata(metadata: Metadata): RentRollConfig {
  // Build tenant charges from Transaction Codes and Mapping for the charges
  const transactionCodes = metadata["Transaction Codes"] || []
  const chargesMapping = metadata["Mapping for the charges"] || {}

  const tenantCharges: TenantChargeConfig[] = transactionCodes.map((code, idx) => {
    // Find the apiField that maps to this transaction code
    let apiField = code.toLowerCase().replace(/\s+/g, "_")
    for (const [field, codes] of Object.entries(chargesMapping)) {
      if (Array.isArray(codes) && codes.includes(code)) {
        apiField = field
        break
      }
    }

    return {
      id: (idx + 1).toString(),
      name: code,
      apiField: apiField,
      frequency: "Monthly" as const,
      targetFrequency: "Monthly" as const,
      isActive: true,
    }
  })

  // Build floor plans from Floor Plan Analysis
  const floorPlanAnalysis = metadata["Floor Plan Analysis"]?.floor_plans || {}
  const floorPlans: FloorPlan[] = Object.entries(floorPlanAnalysis).map(([name, data], idx) => {
    const fpData = data as any
    return {
      id: (idx + 1).toString(),
      name: name,
      bedrooms: fpData.bedrooms || 0,
      bathrooms: fpData.bathrooms || 0,
      isRenovated: fpData.renovation_status === "renovated",
    }
  })

  // Build occupancy mappings from Occupancy Mapping
  const occupancyMapping = metadata["Occupancy Mapping"] || {}
  const occupancyMappings: OccupancyMapping[] = Object.entries(occupancyMapping)
    .filter(([key]) => key !== "validation")
    .map(([rawStatus, normalizedStatus], idx) => ({
      id: (idx + 1).toString(),
      rawStatus: rawStatus,
      normalizedStatus: normalizedStatus as string,
    }))

  // Available columns from the charges mapping keys
  const availableColumns = Object.keys(chargesMapping)

  return {
    tenantCharges,
    floorPlans,
    occupancyMappings,
    availableColumns,
  }
}

interface RRDocumentProps {
  isOpen: boolean
  onClose: () => void
  config: RentRollConfig
  onConfigChange: (config: RentRollConfig) => void
}

export function RRDocument({isOpen, onClose, config, onConfigChange}: RRDocumentProps) {
  const [data, setData] = useState<RentRollUnit[]>(mockRentRollData)
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dynamicConfig, setDynamicConfig] = useState<RentRollConfig>(config)

  useEffect(() => {
    fetchRentRollData()
  }, [])

  const fetchRentRollData = async () => {
    try {
      setLoading(true)
      setError(null)

      const documentId = "00a647b4-3b2c-4b96-b217-c2ff00bffb2e"
      const response = await fetch(`/api/documents/${documentId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      if (result.success && result.document?.extraction_result?.data?.extraction?.units) {
        const units = result.document.extraction_result.data.extraction.units
        const headers = result.document.extraction_result.data.extraction.headers
        const metadata = result.document.extraction_result.data.metadataMappings as Metadata

        // Map API data using headers as keys
        const mappedData: RentRollUnit[] = units.map((unit: any[]) => {
          const unitMap: Record<string, any> = {}
          headers.forEach((header: string, index: number) => {
            unitMap[header] = unit[index]
          })
          return unitMap
        })

        setData(mappedData)
        setColumns(headers)

        // Build dynamic config from metadata
        if (metadata) {
          const builtConfig = buildConfigFromMetadata(metadata)
          setDynamicConfig(builtConfig)
        }
      } else {
        throw new Error("Invalid API response format")
      }
    } catch (err) {
      console.error("Failed to fetch rent roll data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      setData(mockRentRollData)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Occupied":
        return "bg-green-100 text-green-800"
      case "Occupied-NTVL":
      case "Occupied-NTV":
        return "bg-yellow-100 text-yellow-800"
      case "Vacant":
      case "Applicant":
        return "bg-gray-100 text-gray-800"
      case "Admin/Down":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="relative w-full h-full flex bg-white" data-rr-container>
      {/* Table Container - Left side with independent scrolling */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {loading && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading rent roll data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {error} - Displaying sample data instead.
            </p>
          </div>
        )}

        {!loading && (
          <div className="overflow-x-auto overflow-y-auto flex-1 min-w-0">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="bg-gray-50 border-b border-gray-200">
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-2 text-left text-xs font-medium text-gray-700 whitespace-nowrap"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {columns.map((column) => {
                      const value = row[column]
                      const displayValue = 
                        value === null || 
                        value === undefined || 
                        value === "NA" || 
                        value === "N/A" || 
                        String(value).toUpperCase() === "NA"
                          ? "-"
                          : String(value)
                      
                      return (
                        <td
                          key={`${index}-${column}`}
                          className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap"
                        >
                          {displayValue}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Configure Modal - Fixed positioning overlay within relative parent */}
      <RRConfigure
        isOpen={isOpen}
        onClose={onClose}
        config={dynamicConfig}
        onConfigChange={onConfigChange}
      />
    </div>
  )
}
