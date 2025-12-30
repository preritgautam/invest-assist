"use client"

import { useState, useEffect, useCallback } from "react"
import { RRConfigure } from "./rr-configure"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { EditableCell } from "./editable-cell"
import { sampleRentRollDocument } from "@/lib/sample-rent-roll-data"
import { AlertCircle, ChevronRight, ChevronDown } from "lucide-react"
import { useDocumentStore, type RentRollDocumentData, type Metadata } from "@/stores/document-store"
import { OSDocument } from "../os-document"

type RentRollUnit = Record<string, any>

const mockRentRollData: RentRollUnit[] = []

// Column Group Definitions
interface ColumnGroup {
  id: string
  name: string
  columns: string[]
  color: string
  bgColor: string
}

// Static column groups - Unit Info and Lease Terms have fixed columns
// Tenant Charges will be populated dynamically from API Transaction Codes
const STATIC_COLUMN_GROUPS: ColumnGroup[] = [
  {
    id: "unit_info",
    name: "UNIT INFORMATION",
    columns: [
      "Floor Plan", 
      "Square Feet", 
      "Suite Number",
      // Derived from Floor Plan Analysis
      "bed", 
      "bath", 
      "renovated"
    ],
    color: "text-blue-700",
    bgColor: "bg-blue-50"
  },
  {
    id: "lease_terms",
    name: "LEASE TERMS",
    columns: [
      "status",
      "End Date",
      "base_rent",
      "Start Date",
      "Market Rent",
      "Tenant Name",
      "Move In Date",
      "Move Out Date",
      "Month To Month",
      "Lease Description",
      "Total Charges Paid",
      "total_contractual_rent",
      // Additional lease-related fields
      "occupancy_status",
      "Occupancy Status"
    ],
    color: "text-orange-700",
    bgColor: "bg-orange-50"
  },
]

// Allowed categories for Configured Charges section (from "Mapping for the charges")
const ALLOWED_CONFIGURED_CHARGE_CATEGORIES = [
  "laundry",
  "parking",
  "pet_fee",
  "vacancy",
  "monthly_rent",
  "monthly rent",  // Handle variations in naming
  "corporate_unit",
  "month_to_month_fees",
  "utility_reimbursement",
]

// Summary fields to display when column groups are collapsed
const COLLAPSED_SUMMARY_FIELDS: Record<string, { field: string; label: string }> = {
  unit_info: { field: "Suite Number", label: "Suite / Unit" },
  lease_terms: { field: "Tenant Name", label: "Tenant Name" },
  tenant_charges: { field: "base_rent", label: "Base Rent" },
  charge_totals: { field: "monthly_rent", label: "Monthly Rent" },
  other: { field: "balance", label: "Balance" },
}

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

// Use Metadata from store, but keep local alias for compatibility
type LocalMetadata = Metadata

function buildConfigFromMetadata(metadata: LocalMetadata, allHeaders: string[] = []): RentRollConfig {
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
  console.log('[buildConfigFromMetadata] Floor Plan Analysis:', JSON.stringify(floorPlanAnalysis, null, 2))
  const floorPlans: FloorPlan[] = Object.entries(floorPlanAnalysis)?.map(([name, data], idx) => {
    const fpData = data as any
    // Handle both singular (bedroom/bathroom) and plural (bedrooms/bathrooms) field names from API
    const bedroomValue = fpData.bedrooms ?? fpData.bedroom ?? 0
    const bathroomValue = fpData.bathrooms ?? fpData.bathroom ?? 0
    console.log(`[buildConfigFromMetadata] Floor plan "${name}":`, { bedrooms: bedroomValue, bathrooms: bathroomValue, rawData: fpData })
    return {
      id: (idx + 1).toString(),
      name: name,
      bedrooms: bedroomValue,
      bathrooms: bathroomValue,
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
  propertyId?: string
}

export function RRDocument({isOpen, onClose, config, onConfigChange, documentId, processId,propertyId}: RRDocumentProps) {
  console.log("RRDocument rendered with documentId:", documentId, "processId:", processId)
 
  // Zustand store hooks
  const { 
    getRentRollData, 
    hasRentRollData, 
    setRentRollData, 
    updateRentRollConfig,
    updateRentRollRow,
    setLoading: setStoreLoading,
    isLoading: storeIsLoading,
    setError: setStoreError,
    getError: getStoreError,
  } = useDocumentStore()

  // Check if we have cached data for this document
  const cachedData = documentId ? getRentRollData(documentId) : null
  const hasCachedData = documentId ? hasRentRollData(documentId) : false

  // Local state - initialize from cache if available
  const [data, setData] = useState<RentRollUnit[]>(() => cachedData?.data || mockRentRollData)
  const [columns, setColumns] = useState<string[]>(() => cachedData?.columns || [])
  const [loading, setLoading] = useState(() => !hasCachedData)
  const [error, setError] = useState<string | null>(() => documentId ? getStoreError(documentId) : null)
  const [metadata, setMetadata] = useState<LocalMetadata | null>(() => cachedData?.metadata || null)
  const [dynamicConfig, setDynamicConfig] = useState<RentRollConfig>(() => cachedData?.config || config)
  const [originalConfig, setOriginalConfig] = useState<RentRollConfig>(() => cachedData?.config || config)
  const [chargesMapping, setChargesMapping] = useState<Record<string, string[]>>(() => cachedData?.chargesMapping || {})
  const [rawData, setRawData] = useState<any[]>(() => cachedData?.rawData || [])
  const [baseHeaders, setBaseHeaders] = useState<string[]>(() => cachedData?.baseHeaders || [])
  const [normalizedChargesMapping, setNormalizedChargesMapping] = useState<Record<string, string>>(() => cachedData?.normalizedChargesMapping || {})
  const [transactionCodes, setTransactionCodes] = useState<string[]>(() => cachedData?.transactionCodes || [])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [isUsingFallbackData, setIsUsingFallbackData] = useState(false)
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())

  // Build dynamic column groups - static groups + dynamic tenant charges from Transaction Codes
  const COLUMN_GROUPS: ColumnGroup[] = [
    ...STATIC_COLUMN_GROUPS,
    {
      id: "tenant_charges",
      name: "TENANT CHARGES",
      columns: transactionCodes, // Dynamically populated from API Transaction Codes
      color: "text-green-700",
      bgColor: "bg-green-50"
    },
  ]

  // Toggle collapse state for a column group
  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  // Check if a group is collapsed
  const isGroupCollapsed = (groupId: string): boolean => {
    return collapsedGroups.has(groupId)
  }

  // Check if a column belongs to any group
  const getColumnGroup = (columnName: string): ColumnGroup | undefined => {
    return COLUMN_GROUPS.find(group => 
      group.columns.some(col => col.toLowerCase() === columnName.toLowerCase())
    )
  }

  // Check if a column should be visible (not in a collapsed group)
  const isColumnVisible = (columnName: string): boolean => {
    const group = getColumnGroup(columnName)
    if (!group) return true // Ungrouped columns are always visible
    return !collapsedGroups.has(group.id)
  }

  // Get columns that don't belong to any group
  const getUngroupedColumns = (): string[] => {
    return columns.filter(col => !getColumnGroup(col))
  }

  // Get columns for a specific group that exist in the current data
  const getGroupColumns = (group: ColumnGroup): string[] => {
    return columns.filter(col => 
      group.columns.some(groupCol => groupCol.toLowerCase() === col.toLowerCase())
    )
  }

  console.log("RRbaseHeaders", baseHeaders, "hasCachedData:", hasCachedData)

  // Sync local state from cache when documentId changes and cache exists
  useEffect(() => {
    if (documentId && hasCachedData && cachedData) {
      console.log('[RR Document] Loading data from cache for documentId:', documentId)
      setData(cachedData.data)
      setColumns(cachedData.columns)
      setRawData(cachedData.rawData)
      setBaseHeaders(cachedData.baseHeaders)
      setMetadata(cachedData.metadata)
      setChargesMapping(cachedData.chargesMapping)
      setNormalizedChargesMapping(cachedData.normalizedChargesMapping)
      setTransactionCodes(cachedData.transactionCodes || [])
      if (cachedData.config) {
        setDynamicConfig(cachedData.config)
        setOriginalConfig(cachedData.config)
      }
      setLoading(false)
      setError(null)
    }
  }, [documentId, hasCachedData])

  useEffect(() => {
    // Only fetch if we don't have cached data
    if (documentId && !hasCachedData) {
      fetchRentRollData()
    }
  }, [documentId, hasCachedData])

  // Sync config changes from parent/RRConfigure to local state and update table data
  // Only sync if parent config has floor plans (to avoid overwriting fetched config with empty props)
  useEffect(() => {
    if (config && config.floorPlans && config.floorPlans.length > 0) {
      setDynamicConfig(config)
    }
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
          unitMap["renovated"] = fpData.renovation_status ?? "No"
          console.log(`[updateDataWithConfig] Floor plan "${floorPlan}":`, { bed: unitMap["bed"], bath: unitMap["bath"] })
        } else {
          unitMap["bed"] = 0
          unitMap["bath"] = 0
          unitMap["renovated"] = "No"
          console.log(`[updateDataWithConfig] No floor plan match for "${floorPlan}". Available:`, Object.keys(floorPlanLookup))
        }
        
        return unitMap
      })
      
      setData(mappedData)
      
      // Update the store with recalculated data
      if (documentId && hasRentRollData(documentId)) {
        const cachedData = getRentRollData(documentId)
        if (cachedData) {
          setRentRollData(documentId, {
            ...cachedData,
            data: mappedData,
            config: cfg,
          })
        }
      }
    } catch (error) {
      console.error("Error in updateDataWithConfig:", error)
    }
  }, [documentId, hasRentRollData, getRentRollData, setRentRollData])

  // Handle config changes from the modal - update local state and recalculate data
  const handleConfigChange = useCallback((newConfig: RentRollConfig) => {
    setDynamicConfig(newConfig)
    // Recalculate data with the new config
    if (rawData && rawData.length > 0 && baseHeaders && baseHeaders.length > 0) {
      updateDataWithConfig(rawData, newConfig, baseHeaders)
    }
    // Update store with new config
    if (documentId) {
      updateRentRollConfig(documentId, newConfig)
    }
    // Notify parent component
    onConfigChange(newConfig)
  }, [rawData, baseHeaders, updateDataWithConfig, onConfigChange, documentId, updateRentRollConfig])

  // Trigger recalculation when dynamicConfig changes - only if config has actual floor plan data
  useEffect(() => {
    if (rawData && rawData.length > 0 && baseHeaders && baseHeaders.length > 0 && dynamicConfig && dynamicConfig.floorPlans && dynamicConfig.floorPlans.length > 0) {
      console.log("DynamicConfig changed, recalculating data with", dynamicConfig.floorPlans.length, "floor plans:", dynamicConfig.floorPlans.map(fp => fp.name))
      updateDataWithConfig(rawData, dynamicConfig, baseHeaders)
    }
  }, [dynamicConfig?.floorPlans, rawData?.length, baseHeaders?.length, updateDataWithConfig])

  const fetchRentRollData = async () => {
    try {
      setLoading(true)
      setError(null)
      setIsUsingFallbackData(false)
      if (documentId) {
        setStoreLoading(documentId, true)
        setStoreError(documentId, null)
      }

      if (!documentId) {
        throw new Error('No document ID provided')
      }

      const response = await fetch(`/api/documents/${documentId}`)

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const result = await response.json()

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
        const fetchedMetadata = result.document.extraction_result.data.metadataMappings as LocalMetadata

        // Map API data using headers as keys
        const mappedData: RentRollUnit[] = units?.map((unit: any[]) => {
          const unitMap: Record<string, any> = {}
          headers?.forEach((header: string, index: number) => {
            unitMap[header] = unit[index]
          })
          
          // Add new columns: bed, bath, renovated
          const floorPlan = unitMap["Floor Plan"]
          const floorPlanAnalysis = fetchedMetadata?.["Floor Plan Analysis"]?.floor_plans || {}
          
          if (floorPlan && floorPlanAnalysis[floorPlan]) {
            const fpData = floorPlanAnalysis[floorPlan]
            // Handle both singular (bedroom/bathroom) and plural (bedrooms/bathrooms) field names from API
            unitMap["bed"] = fpData.bedrooms ?? fpData.bedroom ?? 0
            unitMap["bath"] = fpData.bathrooms ?? fpData.bathroom ?? 0
            unitMap["renovated"] = fpData.renovation_status ?? "No"
            console.log(`[fetchRentRollData] Unit floor plan "${floorPlan}":`, { bed: unitMap["bed"], bath: unitMap["bath"], fpData })
          } else {
            unitMap["bed"] = 0
            unitMap["bath"] = 0
            unitMap["renovated"] = "No"
            console.log(`[fetchRentRollData] No floor plan match for "${floorPlan}". Available:`, Object.keys(floorPlanAnalysis))
          }
          
          return unitMap
        })

        // Add new columns to the headers array
        const updatedHeaders = [...headers, "bed", "bath", "renovated"]
        
        // Process metadata for charges mapping
        let normalized: Record<string, string[]> = {}
        let keyMap: Record<string, string> = {}
        let builtConfig: RentRollConfig = config
        let apiTransactionCodes: string[] = []
        
        if (fetchedMetadata) {
          const originalMapping = fetchedMetadata["Mapping for the charges"] || {}
          for (const [field, codes] of Object.entries(originalMapping)) {
            const normalizedKey = field.toLowerCase().replace(/\s+/g, "_")
            normalized[normalizedKey] = codes
            keyMap[normalizedKey] = field
          }
          builtConfig = buildConfigFromMetadata(fetchedMetadata, headers)
          
          // Extract Transaction Codes for dynamic Tenant Charges column group
          apiTransactionCodes = fetchedMetadata["Transaction Codes"] || []
          console.log('[fetchRentRollData] Transaction Codes from API:', apiTransactionCodes)
        }

        // Update local state
        setData(mappedData)
        setColumns(updatedHeaders)
        setBaseHeaders(headers)
        setRawData(units)
        setMetadata(fetchedMetadata)
        setChargesMapping(normalized)
        setNormalizedChargesMapping(keyMap)
        setTransactionCodes(apiTransactionCodes)
        setOriginalConfig(builtConfig)
        setDynamicConfig(builtConfig)

        // Save to Zustand store for caching
        if (documentId) {
          const cacheData: RentRollDocumentData = {
            data: mappedData,
            columns: updatedHeaders,
            rawData: units,
            baseHeaders: headers,
            metadata: fetchedMetadata,
            config: builtConfig,
            chargesMapping: normalized,
            normalizedChargesMapping: keyMap,
            transactionCodes: apiTransactionCodes,
            fetchedAt: Date.now(),
          }
          setRentRollData(documentId, cacheData)
          console.log('[RR Document] Data cached in Zustand store for documentId:', documentId)
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
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data"
      setError(errorMessage)
      if (documentId) {
        setStoreError(documentId, errorMessage)
      }
      
      // Use fallback/sample data from v0 environment
      console.log("Using fallback sample data...")
      setIsUsingFallbackData(true)
      
      const result = sampleRentRollDocument
      if (result.success && result.document?.extraction_result?.data?.extraction?.units) {
        const units = result.document.extraction_result.data.extraction.units
        const headers = result.document.extraction_result.data.extraction.headers
        const fallbackMetadata = result.document.extraction_result.data.metadataMappings as LocalMetadata

        // Map sample data using headers as keys
        const mappedData: RentRollUnit[] = units?.map((unit: any[]) => {
          const unitMap: Record<string, any> = {}
          headers?.forEach((header: string, index: number) => {
            unitMap[header] = unit[index]
          })
          
          // Add new columns: bed, bath, renovated
          const floorPlan = unitMap["Floor Plan"]
          const floorPlanAnalysis = fallbackMetadata?.["Floor Plan Analysis"]?.floor_plans || {}
          
          if (floorPlan && floorPlanAnalysis[floorPlan]) {
            const fpData = floorPlanAnalysis[floorPlan]
            // Handle both singular (bedroom/bathroom) and plural (bedrooms/bathrooms) field names from API
            unitMap["bed"] = fpData.bedrooms ?? fpData.bedroom ?? 0
            unitMap["bath"] = fpData.bathrooms ?? fpData.bathroom ?? 0
            unitMap["renovated"] = fpData.renovation_status ?? "No"
          } else {
            unitMap["bed"] = 0
            unitMap["bath"] = 0
            unitMap["renovated"] = "No"
          }
          
          return unitMap
        })

        const updatedHeaders = [...headers, "bed", "bath", "renovated"]
        
        // Process metadata
        let normalized: Record<string, string[]> = {}
        let keyMap: Record<string, string> = {}
        let builtConfig: RentRollConfig = config
        
        if (fallbackMetadata) {
          const originalMapping = fallbackMetadata["Mapping for the charges"] || {}
          for (const [field, codes] of Object.entries(originalMapping)) {
            const normalizedKey = field.toLowerCase().replace(/\s+/g, "_")
            normalized[normalizedKey] = codes
            keyMap[normalizedKey] = field
          }
          builtConfig = buildConfigFromMetadata(fallbackMetadata, headers)
        }

        // Update local state
        setData(mappedData)
        setColumns(updatedHeaders)
        setBaseHeaders(headers)
        setRawData(units)
        setMetadata(fallbackMetadata)
        setChargesMapping(normalized)
        setNormalizedChargesMapping(keyMap)
        setOriginalConfig(builtConfig)
        setDynamicConfig(builtConfig)

        // Cache fallback data too (so we don't re-fetch on tab switch)
        if (documentId) {
          const cacheData: RentRollDocumentData = {
            data: mappedData,
            columns: updatedHeaders,
            rawData: units,
            baseHeaders: headers,
            metadata: fallbackMetadata,
            config: builtConfig,
            chargesMapping: normalized,
            normalizedChargesMapping: keyMap,
            fetchedAt: Date.now(),
          }
          setRentRollData(documentId, cacheData)
          console.log('[RR Document] Fallback data cached in Zustand store for documentId:', documentId)
        }
      }
    } finally {
      setLoading(false)
      if (documentId) {
        setStoreLoading(documentId, false)
      }
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
  // Filter to only show allowed configured charge categories
  const getAllCategories = (): string[] => {
    // Return normalized keys from chargesMapping, filtered to only allowed categories
    const allKeys = Object.keys(chargesMapping)
    return allKeys.filter(key => {
      const normalizedKey = key.toLowerCase().replace(/\s+/g, "_")
      return ALLOWED_CONFIGURED_CHARGE_CATEGORIES.some(
        allowed => allowed.toLowerCase().replace(/\s+/g, "_") === normalizedKey
      )
    }).sort()
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

        // Update Zustand store with the row change
        if (documentId) {
          updateRentRollRow(documentId, rowIndex, columnName, newValue)
        }

        console.log("[RR Document] Row data saved successfully")
      } catch (error) {
        console.error("Error saving row data:", error)
        throw error
      }
    },
    [documentId, data, rawData, baseHeaders, updateRentRollRow]
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
                      {/* Group Header Row */}
                      <tr className="bg-gray-100">
                        <th className="p-2 text-left font-semibold border-r bg-gray-100 text-gray-700 min-w-[60px]" rowSpan={2}>
                          Unit
                        </th>
                        {/* Group headers with collapse toggle */}
                        {COLUMN_GROUPS.map((group) => {
                          const groupCols = getGroupColumns(group)
                          if (groupCols.length === 0) return null
                          const isCollapsed = collapsedGroups.has(group.id)
                          
                          return (
                            <th
                              key={`group-${group.id}`}
                              colSpan={isCollapsed ? 1 : groupCols.length}
                              className={`p-2 text-center font-bold border-r cursor-pointer hover:opacity-80 transition-opacity ${group.bgColor} ${group.color}`}
                              onClick={() => toggleGroupCollapse(group.id)}
                            >
                              <div className="flex items-center justify-center gap-2">
                                {isCollapsed ? (
                                  <ChevronRight className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                                <span>{group.name}</span>
                                {isCollapsed && (
                                  <span className="text-xs opacity-70">({groupCols.length})</span>
                                )}
                              </div>
                            </th>
                          )
                        })}
                        {/* Charge Category Columns Header - CHARGE TOTALS (collapsible) */}
                        {getAllCategories()?.length > 0 && (
                          <th 
                            colSpan={isGroupCollapsed("charge_totals") ? 1 : getAllCategories().length}
                            className="p-2 text-center font-bold border-r bg-indigo-100 text-indigo-800 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => toggleGroupCollapse("charge_totals")}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isGroupCollapsed("charge_totals") ? (
                                <ChevronRight className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              <span>Configured Charges</span>
                              {isGroupCollapsed("charge_totals") && (
                                <span className="text-xs opacity-70">({getAllCategories().length})</span>
                              )}
                            </div>
                          </th>
                        )}
                        {/* Ungrouped columns header - OTHER (at the very end) */}
                        {getUngroupedColumns().length > 0 && (
                          <th 
                            colSpan={isGroupCollapsed("other") ? 1 : getUngroupedColumns().length}
                            className="p-2 text-center font-bold border-r bg-gray-200 text-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => toggleGroupCollapse("other")}
                          >
                            <div className="flex items-center justify-center gap-2">
                              {isGroupCollapsed("other") ? (
                                <ChevronRight className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                              <span>OTHER</span>
                              {isGroupCollapsed("other") && (
                                <span className="text-xs opacity-70">({getUngroupedColumns().length})</span>
                              )}
                            </div>
                          </th>
                        )}
                      </tr>
                      {/* Column Names Row */}
                      <tr>
                        {/* Grouped columns */}
                        {COLUMN_GROUPS.map((group) => {
                          const groupCols = getGroupColumns(group)
                          if (groupCols.length === 0) return null
                          const isCollapsed = collapsedGroups.has(group.id)
                          const summaryConfig = COLLAPSED_SUMMARY_FIELDS[group.id]
                          
                          if (isCollapsed) {
                            return (
                              <th
                                key={`collapsed-${group.id}`}
                                className={`p-2 text-center font-semibold border-r ${group.bgColor} ${group.color} min-w-[100px] cursor-pointer`}
                                onClick={() => toggleGroupCollapse(group.id)}
                              >
                                <span className="text-xs">{summaryConfig?.label || 'Click to expand'}</span>
                              </th>
                            )
                          }
                          
                          return groupCols.map((column) => (
                            <th
                              key={column}
                              className={`p-2 text-left font-semibold border-r ${group.bgColor} ${group.color} min-w-[100px]`}
                            >
                              {formatHeaderName(column)}
                            </th>
                          ))
                        })}
                        {/* Charge Category Columns - CHARGE TOTALS */}
                        {getAllCategories()?.length > 0 && (
                          isGroupCollapsed("charge_totals") ? (
                            <th
                              key="collapsed-charge-totals"
                              className="p-2 text-center font-semibold border-r bg-indigo-50 text-indigo-600 min-w-[100px] cursor-pointer"
                              onClick={() => toggleGroupCollapse("charge_totals")}
                            >
                              <span className="text-xs">{COLLAPSED_SUMMARY_FIELDS.charge_totals?.label || 'Click to expand'}</span>
                            </th>
                          ) : (
                            getAllCategories()?.map((category) => (
                              <th
                                key={`category-${category}`}
                                className="p-2 text-right font-semibold border-r bg-indigo-50 text-indigo-700 min-w-[100px]"
                              >
                                {getCategoryDisplayName(category)}
                              </th>
                            ))
                          )
                        )}
                        {/* Ungrouped columns - OTHER (at the very end) */}
                        {getUngroupedColumns().length > 0 && (
                          isGroupCollapsed("other") ? (
                            <th
                              key="collapsed-other"
                              className="p-2 text-center font-semibold border-r bg-gray-100 text-gray-600 min-w-[100px] cursor-pointer"
                              onClick={() => toggleGroupCollapse("other")}
                            >
                              <span className="text-xs">{COLLAPSED_SUMMARY_FIELDS.other?.label || 'Click to expand'}</span>
                            </th>
                          ) : (
                            getUngroupedColumns()?.map((column) => (
                              <th
                                key={column}
                                className="p-2 text-left font-semibold border-r text-gray-700 min-w-[100px] bg-gray-50"
                              >
                                {formatHeaderName(column)}
                              </th>
                            ))
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedData?.map((row, index) => {
                        const globalIndex = startIndex + index
                        return (
                        <tr key={globalIndex} className="hover:bg-gray-50 transition-colors">
                          <td className="p-2 text-sm font-semibold text-gray-900 border-r bg-gray-50 sticky left-0 z-10 min-w-[60px]">
                            {globalIndex + 1}
                          </td>
                          {/* Grouped columns data */}
                          {COLUMN_GROUPS.map((group) => {
                            const groupCols = getGroupColumns(group)
                            if (groupCols.length === 0) return null
                            const isCollapsed = collapsedGroups.has(group.id)
                            const summaryConfig = COLLAPSED_SUMMARY_FIELDS[group.id]
                            
                            if (isCollapsed) {
                              // Show summary field value when collapsed
                              const summaryValue = summaryConfig ? row[summaryConfig.field] : null
                              const displaySummary = summaryValue === null || summaryValue === undefined || summaryValue === "NA" || summaryValue === "N/A"
                                ? "-"
                                : String(summaryValue)
                              return (
                                <td
                                  key={`collapsed-data-${group.id}-${globalIndex}`}
                                  className={`p-2 text-center text-sm border-r ${group.bgColor} ${group.color}`}
                                >
                                  {displaySummary}
                                </td>
                              )
                            }
                            
                            return groupCols.map((column) => {
                              const value = row[column]
                              const displayValue =
                                value === null ||
                                value === undefined ||
                                value === "NA" ||
                                value === "N/A" ||
                                String(value).toUpperCase() === "NA"
                                  ? "-"
                                  : String(value)

                              const isStatusColumn = column === "status"
                              const statusClass = isStatusColumn
                                ? `${getStatusColor(displayValue)} px-3 py-1 rounded-full font-medium inline-block text-xs`
                                : ""
                              
                              // Columns derived from Floor Plan Analysis are read-only
                              const isFloorPlanDerivedColumn = ["bed", "bath", "renovated"].includes(column.toLowerCase())

                              return (
                                <td
                                  key={`${globalIndex}-${column}`}
                                  className={`p-2 text-sm text-gray-900 border-r ${group.bgColor.replace('50', '50/30')}`}
                                >
                                  <EditableCell
                                    value={displayValue}
                                    rowIndex={globalIndex}
                                    columnName={column}
                                    isStatusColumn={isStatusColumn}
                                    statusClass={statusClass}
                                    isReadOnly={isFloorPlanDerivedColumn}
                                    onSave={(newValue) =>
                                      saveRowData(globalIndex, column, newValue)
                                    }
                                  />
                                </td>
                              )
                            })
                          })}
                          {/* Charge Category Totals - CHARGE TOTALS */}
                          {getAllCategories()?.length > 0 && (
                            isGroupCollapsed("charge_totals") ? (
                              (() => {
                                // Show Monthly Rent value when collapsed
                                const monthlyRentTotal = getTotalForCategory(row, "monthly_rent")
                                return (
                                  <td
                                    key={`collapsed-charge-totals-data-${globalIndex}`}
                                    className="p-2 text-center text-sm font-bold border-r bg-indigo-50 text-indigo-700"
                                  >
                                    {formatCurrency(monthlyRentTotal)}
                                  </td>
                                )
                              })()
                            ) : (
                              getAllCategories()?.map((category) => {
                                const total = getTotalForCategory(row, category)
                                
                                return (
                                  <td
                                    key={`${globalIndex}-category-${category}`}
                                    className="p-2 text-sm font-bold text-right text-indigo-700 border-r bg-indigo-50/30"
                                  >
                                    {formatCurrency(total)}
                                  </td>
                                )
                              })
                            )
                          )}
                          {/* Ungrouped columns data - OTHER (at the very end) */}
                          {getUngroupedColumns().length > 0 && (
                            isGroupCollapsed("other") ? (
                              (() => {
                                // Show Balance value when collapsed
                                const balanceValue = row["balance"] ?? row["Balance"]
                                const displayBalance = balanceValue === null || balanceValue === undefined || balanceValue === "NA" || balanceValue === "N/A"
                                  ? "-"
                                  : typeof balanceValue === "number" ? formatCurrency(balanceValue) : String(balanceValue)
                                return (
                                  <td
                                    key={`collapsed-other-data-${globalIndex}`}
                                    className="p-2 text-center text-sm border-r bg-gray-100 text-gray-700"
                                  >
                                    {displayBalance}
                                  </td>
                                )
                              })()
                            ) : (
                              getUngroupedColumns()?.map((column) => {
                                const value = row[column]
                                const displayValue =
                                  value === null ||
                                  value === undefined ||
                                  value === "NA" ||
                                  value === "N/A" ||
                                  String(value).toUpperCase() === "NA"
                                    ? "-"
                                    : String(value)

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
                              })
                            )
                          )}
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
