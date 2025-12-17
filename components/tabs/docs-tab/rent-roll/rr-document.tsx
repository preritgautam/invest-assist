"use client"

import { useState, useEffect, useCallback } from "react"
import { RRConfigure } from "./rr-configure"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { EditableCell } from "./editable-cell"
import { sampleRentRollDocument } from "@/lib/sample-rent-roll-data"
import { AlertCircle } from "lucide-react"

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
  base_floor_plan: string
  renovation_status: 'not_specified' | 'yes' | 'no' | 'partial'
  bed_bath_confidence: string
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

  // Normalize chargesMapping keys to lowercase with underscores for consistent matching
  const normalizedChargesMapping: Record<string, string[]> = {}
  const normalizedKeyMap: Record<string, string> = {} // Map normalized -> original
  for (const [field, codes] of Object.entries(chargesMapping)) {
    const normalized = field.toLowerCase().replace(/\s+/g, "_")
    normalizedChargesMapping[normalized] = codes
    normalizedKeyMap[normalized] = field
  }

  const tenantCharges: TenantChargeConfig[] = transactionCodes?.map((code, idx) => {
    // Find the normalized apiField that maps to this transaction code
    let apiField = code.toLowerCase().replace(/\s+/g, "_")
    for (const [field, codes] of Object.entries(normalizedChargesMapping)) {
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
  const floorPlans: FloorPlan[] = Object.entries(floorPlanAnalysis)?.map(([name, data], idx) => {
    const fpData = data as any
    return {
      id: (idx + 1).toString(),
      name: name,
      bedrooms: fpData.bedrooms || 0,
      bathrooms: fpData.bathrooms || 0,
      base_floor_plan: fpData.base_floor_plan || name,
      renovation_status: fpData.renovation_status || 'not_specified',
      bed_bath_confidence: fpData.bed_bath_confidence || 'unknown',
    }
  })

  // Build occupancy mappings from Occupancy Mapping
  const occupancyMapping = metadata["Occupancy Mapping"] || {}
  const occupancyMappings: OccupancyMapping[] = Object.entries(occupancyMapping)
    .filter(([key]) => key !== "validation")
    ?.map(([rawStatus, normalizedStatus], idx) => ({
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

// Helper function for consistent number formatting
const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
}

interface RRDocumentProps {
  isOpen: boolean
  onClose: () => void
  config: RentRollConfig
  onConfigChange: (config: RentRollConfig) => void
  documentId?: string
  processId?: string
}

export function RRDocument({isOpen, onClose, config, onConfigChange, documentId, processId}: RRDocumentProps) {
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
  const [normalizedChargesMapping, setNormalizedChargesMapping] = useState<Record<string, string>>({}) // For display: normalized -> original
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)

  console.log("RRbaseHeaders", baseHeaders)

  useEffect(() => {
    fetchRentRollData()
  }, [])

  // Sync config changes from parent/RRConfigure to local state and update table data
  useEffect(() => {
    setDynamicConfig(config)
  }, [config])

  const updateDataWithConfig = useCallback((units: any[], cfg: RentRollConfig, headers: string[]) => {
    try {
      if (!units || !cfg || !headers) {
        console.warn("Missing data for updateDataWithConfig")
        return
      }
      const floorPlanLookup = (cfg.floorPlans || []).reduce((acc, fp) => {
        acc[fp.name] = fp
        return acc
      }, {} as Record<string, FloorPlan>)

      const mappedData: RentRollUnit[] = units.map((unit: any[]) => {
        const unitMap: Record<string, any> = {}
        headers.forEach((header: string, index: number) => {
          unitMap[header] = unit[index]
        })
        
        // Add new columns using updated config: bed, bath, renovated
        const floorPlan = unitMap["Floor Plan"]
        
        if (floorPlan && floorPlanLookup && floorPlanLookup[floorPlan]) {
          const fpData = floorPlanLookup[floorPlan]
          unitMap["bed"] = fpData.bedrooms ?? 0
          unitMap["bath"] = fpData.bathrooms ?? 0
          unitMap["renovated"] = fpData.renovation_status
        } else {
          unitMap["bed"] = 0
          unitMap["bath"] = 0
          unitMap["renovated"] = "No"
        }
        
        return unitMap
      })
      
      setData(mappedData)
    } catch (error) {
      console.error("Error in updateDataWithConfig:", error)
    }
  }, [])

  // Handle config changes from the modal - update local state and recalculate data
  const handleConfigChange = useCallback((newConfig: RentRollConfig) => {
    setDynamicConfig(newConfig)
    // Recalculate data with the new config
    if (rawData && rawData.length > 0 && baseHeaders && baseHeaders.length > 0) {
      updateDataWithConfig(rawData, newConfig, baseHeaders)
    }
    // Notify parent component
    onConfigChange(newConfig)
  }, [rawData, baseHeaders, updateDataWithConfig, onConfigChange])

  // Trigger recalculation when parent config changes
  useEffect(() => {
    if (rawData && rawData.length > 0 && baseHeaders && baseHeaders.length > 0 && config && config.floorPlans) {
      console.log("Config changed, recalculating data")
      updateDataWithConfig(rawData, config, baseHeaders)
    }
  }, [config?.floorPlans?.length, rawData?.length, baseHeaders?.length, updateDataWithConfig])

  const fetchRentRollData = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsUsingFallbackData(false)

      if (!documentId) {
        throw new Error('No document ID provided')
      }

      const response = await fetch(`/api/documents/${documentId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

      // Debug: Log what we received to help diagnose format issues
      console.log('[RR Document] API response:', {
        success: result.success,
        hasDocument: !!result.document,
        hasExtractionResult: !!result.document?.extraction_result,
        extractionResultKeys: result.document?.extraction_result ? Object.keys(result.document.extraction_result) : [],
        extractionStatus: result.document?.extraction_status,
      })

      // Check if document exists but extraction is still pending/processing
      if (result.success && result.document && !result.document.extraction_result) {
        if (result.document.extraction_status === 'pending' || result.document.extraction_status === 'processing') {
          throw new Error(`Document extraction is ${result.document.extraction_status}. Please wait for extraction to complete.`)
        }
        throw new Error('Document has no extraction results. Extraction may have failed.')
      }

      if (result.success && result.document?.extraction_result?.data?.extraction?.units) {
        const units = result.document.extraction_result.data.extraction.units
        const headers = result.document.extraction_result.data.extraction.headers
        const metadata = result.document.extraction_result.data.metadataMappings as Metadata

        // Map API data using headers as keys
        const mappedData: RentRollUnit[] = units?.map((unit: any[]) => {
          const unitMap: Record<string, any> = {}
          headers?.forEach((header: string, index: number) => {
            unitMap[header] = unit[index]
          })
          
          // Add new columns: bed, bath, renovated
          const floorPlan = unitMap["Floor Plan"]
          const floorPlanAnalysis = metadata?.["Floor Plan Analysis"]?.floor_plans || {}
          
          if (floorPlan && floorPlanAnalysis[floorPlan]) {
            const fpData = floorPlanAnalysis[floorPlan]
            unitMap["bed"] = fpData.bedrooms || 0
            unitMap["bath"] = fpData.bathrooms || 0
            unitMap["renovated"] = fpData.renovation_status
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
          
          // Normalize chargesMapping keys
          const originalMapping = metadata["Mapping for the charges"] || {}
          const normalized: Record<string, string[]> = {}
          const keyMap: Record<string, string> = {}
          for (const [field, codes] of Object.entries(originalMapping)) {
            const normalizedKey = field.toLowerCase().replace(/\s+/g, "_")
            normalized[normalizedKey] = codes
            keyMap[normalizedKey] = field
          }
          
          setChargesMapping(normalized)
          setNormalizedChargesMapping(keyMap)
          const builtConfig = buildConfigFromMetadata(metadata, headers)
          setOriginalConfig(builtConfig)
          setDynamicConfig(builtConfig)
        }
      } else {
        // Provide more detailed error about what structure was received
        const extractionResult = result.document?.extraction_result
        let errorDetail = 'Unknown structure'
        if (!result.success) {
          errorDetail = `API returned success=false: ${result.error || 'unknown error'}`
        } else if (!result.document) {
          errorDetail = 'No document in response'
        } else if (!extractionResult) {
          errorDetail = 'No extraction_result in document'
        } else if (!extractionResult.data) {
          errorDetail = `extraction_result has keys [${Object.keys(extractionResult).join(', ')}] but no 'data' field`
        } else if (!extractionResult.data.extraction) {
          errorDetail = `extraction_result.data has keys [${Object.keys(extractionResult.data).join(', ')}] but no 'extraction' field`
        } else if (!extractionResult.data.extraction.units) {
          errorDetail = `extraction_result.data.extraction has keys [${Object.keys(extractionResult.data.extraction).join(', ')}] but no 'units' field`
        }
        console.error('[RR Document] Invalid extraction_result structure:', extractionResult)
        throw new Error(`Invalid extraction result format: ${errorDetail}`)
      }
    } catch (err) {
      console.error("Failed to fetch rent roll data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data")
      
      // Use fallback/sample data from v0 environment
      console.log("Using fallback sample data...")
      setIsUsingFallbackData(true)
      
      const result = sampleRentRollDocument
      if (result.success && result.document?.extraction_result?.data?.extraction?.units) {
        const units = result.document.extraction_result.data.extraction.units
        const headers = result.document.extraction_result.data.extraction.headers
        const metadata = result.document.extraction_result.data.metadataMappings as Metadata

        // Map sample data using headers as keys
        const mappedData: RentRollUnit[] = units?.map((unit: any[]) => {
          const unitMap: Record<string, any> = {}
          headers?.forEach((header: string, index: number) => {
            unitMap[header] = unit[index]
          })
          
          // Add new columns: bed, bath, renovated
          const floorPlan = unitMap["Floor Plan"]
          const floorPlanAnalysis = metadata?.["Floor Plan Analysis"]?.floor_plans || {}
          
          if (floorPlan && floorPlanAnalysis[floorPlan]) {
            const fpData = floorPlanAnalysis[floorPlan]
            unitMap["bed"] = fpData.bedrooms || 0
            unitMap["bath"] = fpData.bathrooms || 0
            unitMap["renovated"] = fpData.renovation_status
          } else {
            unitMap["bed"] = 0
            unitMap["bath"] = 0
            unitMap["renovated"] = "No"
          }
          
          return unitMap
        })

        setData(mappedData)
        const updatedHeaders = [...headers, "bed", "bath", "renovated"]
        setColumns(updatedHeaders)
        setBaseHeaders(headers)
        setRawData(units)

        if (metadata) {
          setMetadata(metadata)
          const originalMapping = metadata["Mapping for the charges"] || {}
          const normalized: Record<string, string[]> = {}
          const keyMap: Record<string, string> = {}
          for (const [field, codes] of Object.entries(originalMapping)) {
            const normalizedKey = field.toLowerCase().replace(/\s+/g, "_")
            normalized[normalizedKey] = codes
            keyMap[normalizedKey] = field
          }
          
          setChargesMapping(normalized)
          setNormalizedChargesMapping(keyMap)
          const builtConfig = buildConfigFromMetadata(metadata, headers)
          setOriginalConfig(builtConfig)
          setDynamicConfig(builtConfig)
        }
      }
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



  const formatHeaderName = (column: string): string => {
    // Format the column name by capitalizing words
    return column
      .split("_")
      ?.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  // Get ALL available categories from the original API mapping (for display even if $0.00)
  const getAllCategories = (): string[] => {
    // Return normalized keys from chargesMapping
    return Object.keys(chargesMapping).sort()
  }

  // Get display name for a category
  const getCategoryDisplayName = (category: string): string => {
    return normalizedChargesMapping[category] || category
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
    // Get all charges that map to this category
    const charges = getChargesForCategory(category)
    
    // If no charges map to this category, return 0
    if (charges.length === 0) {
      return 0
    }
    
    // Sum all charge values for this category
    return charges.reduce((total, charge) => {
      const value = parseFloat(String(row[charge.name]).replace(/[^0-9.-]/g, "")) || 0
      return total + value
    }, 0)
  }

  // Save row cell data to database
  const saveRowData = useCallback(
    async (rowIndex: number, columnName: string, newValue: string) => {
      try {
        const response = await fetch("/api/documents/rows/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            rowIndex,
            columnName,
            newValue,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to save row data")
        }

        const result = await response.json()

        // Update local data with the new value
        const updatedData = [...data]
        updatedData[rowIndex] = {
          ...updatedData[rowIndex],
          [columnName]: newValue,
        }
        setData(updatedData)

        // Update raw data as well
        if (baseHeaders.length > 0) {
          const columnIndex = baseHeaders.indexOf(columnName)
          if (columnIndex !== -1) {
            const updatedRaw = [...rawData]
            updatedRaw[rowIndex][columnIndex] = newValue
            setRawData(updatedRaw)
          }
        }

        console.log("[RR Document] Row data saved successfully")
      } catch (error) {
        console.error("Error saving row data:", error)
        throw error
      }
    },
    [documentId, data, rawData, baseHeaders]
  )

  // Pagination helpers
  const totalPages = Math.ceil(data.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = data.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="w-full h-full bg-white"
      data-rr-container
    >
      {/* Table Container - Left side with independent scrolling */}
      <ResizablePanel defaultSize={75} minSize={40} className="flex flex-col overflow-hidden">
        <div className="space-y-2 sm:space-y-4 p-1 sm:p-2 md:p-4 flex flex-col h-full overflow-hidden">
          {/* Status Banner */}
          {isUsingFallbackData && (
            <div className="bg-red-50 rounded-lg border border-red-200 p-3 sm:p-4 shadow-sm flex-shrink-0 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">API Unavailable</p>
                <p className="text-xs text-red-700 mt-1">The document API is failing. Displaying sample data for demonstration purposes.</p>
              </div>
            </div>
          )}

          {error && (
            <div className={`rounded-lg border p-3 sm:p-4 shadow-sm flex-shrink-0 flex items-start gap-3 ${
              error.includes('pending') || error.includes('processing')
                ? 'bg-blue-50 border-blue-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                error.includes('pending') || error.includes('processing')
                  ? 'text-blue-600'
                  : 'text-amber-600'
              }`} />
              <div>
                <p className={`text-sm font-semibold ${
                  error.includes('pending') || error.includes('processing')
                    ? 'text-blue-900'
                    : 'text-amber-900'
                }`}>
                  {error.includes('pending') || error.includes('processing')
                    ? 'Extraction In Progress'
                    : 'Data Unavailable'}
                </p>
                <p className={`text-xs mt-1 ${
                  error.includes('pending') || error.includes('processing')
                    ? 'text-blue-700'
                    : 'text-amber-700'
                }`}>
                  {error}
                </p>
                {!error.includes('pending') && !error.includes('processing') && isUsingFallbackData && (
                  <p className="text-xs text-amber-700 mt-1">Displaying sample data for demonstration.</p>
                )}
              </div>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-lg border p-8 shadow-sm">
              <div className="flex flex-col items-center justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600 text-sm">Loading rent roll data...</p>
              </div>
            </div>
          )}

          {!loading && (
            <>
              {/* Table Section */}
              <div className="bg-white rounded-lg border overflow-hidden flex flex-col flex-1">
                <div className="flex-1 overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                  <table className="w-full text-xs table-auto">
                    <thead className="bg-gray-50 border-b sticky top-0 z-20">
                      <tr>
                        <th className="p-2 text-left font-semibold border-r bg-gray-50 text-gray-700 min-w-[150px]">
                          Unit
                        </th>
                        {getDisplayColumns()?.map((column) => (
                          <th
                            key={column}
                            className="p-2 text-left font-semibold border-r text-gray-700 min-w-[100px]"
                          >
                            {formatHeaderName(column)}
                          </th>
                        ))}
                        {/* Charge Category Columns */}
                        {getAllCategories()?.map((category) => (
                          <th
                            key={`category-${category}`}
                            className="p-2 text-right font-semibold border-r text-blue-700 min-w-[120px]"
                          >
                            {getCategoryDisplayName(category)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData?.map((row, index) => {
                        const globalIndex = startIndex + index
                        return (
                        <tr key={globalIndex} className="hover:bg-gray-50 transition-colors">
                          <td className="p-2 text-sm font-semibold text-gray-900 border-r bg-gray-50 sticky left-0 z-10 min-w-[150px]">
                            Unit {globalIndex + 1}
                          </td>
                          {getDisplayColumns()?.map((column) => {
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
                              ? `${getStatusColor(displayValue)} px-3 py-1 rounded-full font-medium inline-block text-xs`
                              : ""

                            return (
                              <td
                                key={`${globalIndex}-${column}`}
                                className="p-2 text-sm text-gray-900 border-r"
                              >
                                <EditableCell
                                  value={displayValue}
                                  rowIndex={globalIndex}
                                  columnName={column}
                                  isStatusColumn={isStatusColumn}
                                  statusClass={statusClass}
                                  onSave={(newValue) =>
                                    saveRowData(globalIndex, column, newValue)
                                  }
                                />
                              </td>
                            )
                          })}
                          {/* Charge Category Totals */}
                          {getAllCategories()?.map((category) => {
                            const total = getTotalForCategory(row, category)
                            
                            return (
                              <td
                                key={`${globalIndex}-category-${category}`}
                                className="p-2 text-sm font-bold text-right text-blue-700 border-r"
                              >
                                {formatCurrency(total)}
                              </td>
                            )
                          })}
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination Controls */}
              <div className="bg-white rounded-lg border p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <span className="text-gray-600">Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="text-xs sm:text-sm text-gray-600">
                  Showing {startIndex + 1} to {Math.min(endIndex, data.length)} of {data.length} units
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Prev
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum = i + 1
                      if (totalPages > 5 && currentPage > 3) {
                        pageNum = currentPage - 2 + i
                      }
                      if (pageNum > totalPages) return null
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded ${
                            currentPage === pageNum
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 sm:px-3 py-1 border border-gray-300 rounded text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Configure Modal - Right side panel */}
      {isOpen && (
        <ResizablePanel defaultSize={25} minSize={20} className="bg-white overflow-hidden">
          <RRConfigure
            isOpen={isOpen}
            onClose={onClose}
            config={dynamicConfig}
            onConfigChange={handleConfigChange}
            originalConfig={originalConfig}
            documentId={documentId}
            processId={processId}
          />
        </ResizablePanel>
      )}
    </ResizablePanelGroup>
  )
}
