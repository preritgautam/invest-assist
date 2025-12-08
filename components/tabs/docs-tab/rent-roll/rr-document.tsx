"use client"

import { useState, useEffect, useCallback } from "react"
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

function buildConfigFromMetadata(metadata: Metadata, allHeaders: string[] = []): RentRollConfig {
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

  // Note: availableColumns will be populated from the actual API headers when data is fetched
  // For now, include charge mapping keys as a fallback
  const availableColumns = allHeaders.length > 0 ? allHeaders : Object.keys(chargesMapping)

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
  const [metadata, setMetadata] = useState<Metadata | null>(null)
  const [dynamicConfig, setDynamicConfig] = useState<RentRollConfig>(config)
  const [originalConfig, setOriginalConfig] = useState<RentRollConfig>(config)
  const [chargesMapping, setChargesMapping] = useState<Record<string, string[]>>({})
  const [rawData, setRawData] = useState<any[]>([])
  const [baseHeaders, setBaseHeaders] = useState<string[]>([])

  useEffect(() => {
    fetchRentRollData()
  }, [])

  // Sync config changes from parent/RRConfigure to local state and update table data
  useEffect(() => {
    setDynamicConfig(config)
  }, [config])

  const updateDataWithConfig = useCallback((units: any[], cfg: RentRollConfig, headers: string[]) => {
    console.log("Updating data with config - floorPlans:", cfg.floorPlans)
    const mappedData: RentRollUnit[] = units.map((unit: any[]) => {
      const unitMap: Record<string, any> = {}
      headers.forEach((header: string, index: number) => {
        unitMap[header] = unit[index]
      })
      
      // Add new columns using updated config: bed, bath, renovated
      const floorPlan = unitMap["Floor Plan"]
      const floorPlanLookup = cfg.floorPlans.reduce((acc, fp) => {
        acc[fp.name] = fp
        return acc
      }, {} as Record<string, FloorPlan>)
      
      if (floorPlan && floorPlanLookup[floorPlan]) {
        const fpData = floorPlanLookup[floorPlan]
        unitMap["bed"] = fpData.bedrooms
        unitMap["bath"] = fpData.bathrooms
        unitMap["renovated"] = fpData.isRenovated ? "Yes" : "No"
      } else {
        unitMap["bed"] = 0
        unitMap["bath"] = 0
        unitMap["renovated"] = "No"
      }
      
      return unitMap
    })
    
    setData(mappedData)
  }, [])

  // Trigger recalculation when config changes
  useEffect(() => {
    if (rawData.length > 0 && baseHeaders.length > 0) {
      console.log("Config changed, recalculating data")
      updateDataWithConfig(rawData, config, baseHeaders)
    }
  }, [config.floorPlans, rawData, baseHeaders, updateDataWithConfig])

  const fetchRentRollData = async () => {
    try {
      setLoading(true)
      setError(null)

      const documentId = "878e830c-8995-4c84-9da9-aabc0d7139e9"
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
          
          // Add new columns: bed, bath, renovated
          const floorPlan = unitMap["Floor Plan"]
          const floorPlanAnalysis = metadata?.["Floor Plan Analysis"]?.floor_plans || {}
          
          if (floorPlan && floorPlanAnalysis[floorPlan]) {
            const fpData = floorPlanAnalysis[floorPlan]
            unitMap["bed"] = fpData.bedrooms || 0
            unitMap["bath"] = fpData.bathrooms || 0
            unitMap["renovated"] = fpData.renovation_status === "renovated" ? "Yes" : "No"
          } else {
            unitMap["bed"] = 0
            unitMap["bath"] = 0
            unitMap["renovated"] = "No"
          }
          
          return unitMap
        })

        setData(mappedData)
        // Add new columns to the headers array
        const updatedHeaders = [...headers, "bed", "bath", "renovated"]
        setColumns(updatedHeaders)
        // Store base headers and raw units for later recalculation
        setBaseHeaders(headers)
        setRawData(units)

        // Store metadata and charges mapping
        if (metadata) {
          setMetadata(metadata)
          setChargesMapping(metadata["Mapping for the charges"] || {})
          const builtConfig = buildConfigFromMetadata(metadata, headers)
          setOriginalConfig(builtConfig)
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

  const getDisplayColumns = () => {
    // Display all columns from the API response headers in their original order
    return columns
  }

  const getChargeCategory = (column: string): string | null => {
    // Find which charge category this column belongs to
    for (const [category, codes] of Object.entries(chargesMapping)) {
      if (Array.isArray(codes) && codes.includes(column)) {
        return category
      }
    }
    return null
  }

  const isChargeColumn = (column: string): boolean => {
    return getChargeCategory(column) !== null
  }

  const formatHeaderName = (column: string): string => {
    // Format the column name by capitalizing words
    return column
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getChargeCategories = (): string[] => {
    return Object.keys(chargesMapping)
  }

  // Get unique category names from config.tenantCharges by apiField
  const getConfigCategories = (): string[] => {
    const categories = new Set<string>()
    dynamicConfig.tenantCharges.forEach(charge => {
      if (charge.apiField) {
        categories.add(charge.apiField)
      }
    })
    return Array.from(categories).sort()
  }

  // Get ALL available categories from the API mapping (for display even if $0.00)
  const getAllCategories = (): string[] => {
    const categories = new Set<string>()
    // Add configured categories
    dynamicConfig.tenantCharges.forEach(charge => {
      if (charge.apiField) {
        categories.add(charge.apiField)
      }
    })
    // Add original categories from API mapping (for categories that might show $0.00)
    Object.keys(chargesMapping).forEach(category => {
      categories.add(category)
    })
    return Array.from(categories).sort()
  }

  // Get all charges that map to a specific category
  const getChargesForCategory = (category: string): TenantChargeConfig[] => {
    return dynamicConfig.tenantCharges.filter(charge => charge.apiField === category)
  }

  const getCategoryHeaderColor = (category: string) => {
    return "bg-blue-600 text-white"
  }

  const getCategoryCellColor = (category: string) => {
    return "bg-blue-50"
  }

  const getTotalForCategory = (row: RentRollUnit, category: string): number => {
    // Get all charges with this apiField and sum their values from the row
    const charges = getChargesForCategory(category)
    return charges.reduce((total, charge) => {
      const value = parseFloat(String(row[charge.name]).replace(/[^0-9.-]/g, "")) || 0
      return total + value
    }, 0)
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
          <div className="w-full h-96 flex flex-col min-w-0 overflow-hidden border border-gray-200 rounded-lg">
            <div className="flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr className="bg-gray-50 border-b border-gray-200">
                  {getDisplayColumns().map((column) => {
                    const displayHeader = formatHeaderName(column)

                    return (
                      <th
                        key={column}
                        className="px-4 py-2 text-left text-xs font-medium whitespace-nowrap bg-blue-50 text-blue-700 border-l-2 border-blue-300"
                      >
                        {displayHeader}
                      </th>
                    )
                  })}
                  {/* Charge Category Columns */}
                  {getAllCategories().map((category) => (
                    <th
                      key={`category-${category}`}
                      className={`px-4 py-2 text-left text-xs font-bold whitespace-nowrap ${getCategoryHeaderColor(category)} border-l-2 border-gray-300`}
                    >
                      {category.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    {getDisplayColumns().map((column) => {
                      const value = row[column]
                      const displayValue =
                        value === null ||
                        value === undefined ||
                        value === "NA" ||
                        value === "N/A" ||
                        String(value).toUpperCase() === "NA"
                          ? "-"
                          : String(value)

                      // Apply status color styling to the status column
                      const isStatusColumn = column === "status"
                      const statusClass = isStatusColumn
                        ? `${getStatusColor(displayValue)} px-3 py-1 rounded-full font-medium inline-block`
                        : ""

                      return (
                        <td
                          key={`${index}-${column}`}
                          className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap bg-blue-50 font-semibold text-blue-900"
                        >
                          {isStatusColumn ? (
                            <span className={statusClass}>{displayValue}</span>
                          ) : (
                            displayValue
                          )}
                        </td>
                      )
                    })}
                    {/* Charge Category Totals */}
                    {getAllCategories().map((category) => {
                      const total = getTotalForCategory(row, category)
                      return (
                        <td
                          key={`${index}-category-${category}`}
                          className={`px-4 py-2 text-sm font-bold whitespace-nowrap ${getCategoryCellColor(category)}`}
                        >
                          ${total.toFixed(2)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      {/* Configure Modal - Fixed positioning overlay within relative parent */}
      <RRConfigure
        isOpen={isOpen}
        onClose={onClose}
        config={dynamicConfig}
        onConfigChange={onConfigChange}
        originalConfig={originalConfig}
      />
    </div>
  )
}
