"use client"

import React, { useEffect, useState } from "react"
import { X, Loader2 } from "lucide-react"

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

interface RRConfigureProps {
  isOpen: boolean
  onClose: () => void
  config: RentRollConfig
  onConfigChange: (config: RentRollConfig) => void
  originalConfig?: RentRollConfig
  documentId?: string
  processId?: string
}

type TabType = "tenant-charges" | "floor-plans" | "occupancy"

export function RRConfigure({ isOpen, onClose, config, onConfigChange, originalConfig, documentId, processId }: RRConfigureProps) {
  const defaultConfig: RentRollConfig = {
    tenantCharges: [],
    floorPlans: [],
    occupancyMappings: [],
    availableColumns: [],
  }

  const [localConfig, setLocalConfig] = useState<RentRollConfig>(config || defaultConfig)
  const [activeTab, setActiveTab] = useState<TabType>("floor-plans")
  const [showColumnSelector, setShowColumnSelector] = useState(false)
  const [columnSearchQuery, setColumnSearchQuery] = useState("")
  const [mapToSearchQuery, setMapToSearchQuery] = useState<{ [key: string]: string }>({})
  const [showMapToDropdown, setShowMapToDropdown] = useState<{ [key: string]: boolean }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)


  console.log('localconfig', config)
  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  // Reset local config when modal opens
  useEffect(() => {
    if (isOpen && config) {
      setLocalConfig(config)
      setMapToSearchQuery({})
      setShowMapToDropdown({})
    }
  }, [isOpen])

  // Dynamically get available columns and API fields from cofig
  const availableColumns = [
    "corporate_unit",
    "non_revenue_unit",
    "employee_discount",
    "month_to_month_fees",
    "pest_control_income",
    "cable_internet_income",
    "utility_reimbursement",
    "late_fee",
    "insurance",
    "concessions",
    "monthly_rent",
    "Rent Premium",
    "trash_income",
    "garage_income",
    "other_charges",
    "laundry",
    "parking",
    "pet_fee",
    "storage",
    "subsidy",
    "vacancy"
  ]

  const availableApiFields = [
    ...new Set([
      ...(localConfig?.tenantCharges || []).map(charge => charge.apiField),
      ...(availableColumns || []),
    ])
  ]

  const filteredColumns = availableColumns.filter((col: string) =>
    col.toLowerCase().includes(columnSearchQuery.toLowerCase())
  )

  const getFilteredApiFields = (chargeId: string) => {
    const searchQuery = mapToSearchQuery[chargeId] || ""
    return availableApiFields.filter((field: string) =>
      field.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  const handleAddColumn = (column: string) => {
    const newCharge: TenantChargeConfig = {
      id: Date.now().toString(),
      name: column.toUpperCase().replace("_", " "),
      apiField: column,
      frequency: "Monthly",
      targetFrequency: "Monthly",
      isActive: true
    }
    setLocalConfig(prev => ({
      ...prev,
      tenantCharges: [...prev.tenantCharges, newCharge]
    }))
    setShowColumnSelector(false)
    setColumnSearchQuery("")
  }

  const handleRemoveCharge = (chargeId: string) => {
    setLocalConfig(prev => ({
      ...prev,
      tenantCharges: prev.tenantCharges.filter(charge => charge.id !== chargeId)
    }))
  }


  const handleFloorPlanChange = (planId: string, field: string, value: any) => {
    setLocalConfig(prev => ({
      ...prev,
      floorPlans: prev.floorPlans.map(plan =>
        plan.id === planId ? { ...plan, [field]: value } : plan
      )
    }))
  }

  const handleOccupancyChange = (mappingId: string, newStatus: string) => {
    setLocalConfig(prev => ({
      ...prev,
      occupancyMappings: prev.occupancyMappings.map(mapping =>
        mapping.id === mappingId ? { ...mapping, normalizedStatus: newStatus } : mapping
      )
    }))
  }

  const handleSave = async () => {
    setSaveError(null)
    setIsSaving(true)

    try {
      if (!documentId) {
        throw new Error('Document ID is required')
      }

      console.log('[RRConfigure] Saving configuration changes for document:', documentId)

      // Convert internal floor plan array to API format
      const floorPlansData: any = {
        floor_plans: {}
      }

      if (localConfig.floorPlans && localConfig.floorPlans.length > 0) {
        localConfig.floorPlans.forEach((plan) => {
          floorPlansData.floor_plans[plan.name] = {
            bedrooms: plan.bedrooms,
            bathrooms: plan.bathrooms,
            base_floor_plan: plan.base_floor_plan,
            renovation_status: plan.renovation_status,
            bed_bath_confidence: plan.bed_bath_confidence,
          }
        })
      }

      // Convert tenant charges to API format (mapping)
      // Build complete mapping for all charges (mapped and unmapped)
      const tenantChargesData: Record<string, string[]> = {}

      if (localConfig.tenantCharges && localConfig.tenantCharges.length > 0) {
        // First, add all original transaction codes with empty arrays
        // This ensures all charges are included even if unmapped
        const allChargeNames = new Set(localConfig.tenantCharges.map(c => c.name))

        // Initialize all possible API fields with empty arrays to preserve structure
        const allApiFields = new Set<string>()
        localConfig.tenantCharges.forEach(charge => {
          if (charge.apiField) {
            allApiFields.add(charge.apiField)
          }
        })

        // Initialize each category with empty array
        allApiFields.forEach(field => {
          tenantChargesData[field] = []
        })

        // Now populate with actual mappings
        localConfig.tenantCharges.forEach((charge) => {
          if (charge.apiField && charge.apiField.trim() !== '') {
            // Only add charges that have a valid apiField
            if (!tenantChargesData[charge.apiField]) {
              tenantChargesData[charge.apiField] = []
            }
            tenantChargesData[charge.apiField].push(charge.name)
          }
        })

        // Remove empty categories (unmapped charges)
        Object.keys(tenantChargesData).forEach(key => {
          if (tenantChargesData[key].length === 0) {
            delete tenantChargesData[key]
          }
        })
      }

      // Convert occupancy mappings to API format
      const occupancyMappingsData: Record<string, string> = {}
      if (localConfig.occupancyMappings && localConfig.occupancyMappings.length > 0) {
        localConfig.occupancyMappings.forEach((mapping) => {
          occupancyMappingsData[mapping.rawStatus] = mapping.normalizedStatus
        })
      }

      // Save floor plans
      if (Object.keys(floorPlansData.floor_plans).length > 0) {
        console.log('[RRConfigure] Saving floor plan changes')
        const floorPlanResponse = await fetch('/api/documents/floor-plans/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            floorPlansData,
          }),
        })

        if (!floorPlanResponse.ok) {
          const error = await floorPlanResponse.json()
          throw new Error(error.error || 'Failed to save floor plan changes')
        }

        const result = await floorPlanResponse.json()
        console.log('[RRConfigure] Floor plan changes saved successfully:', result)
      }

      // Save rent roll configurations (tenant charges and occupancy mappings)
      if (Object.keys(tenantChargesData).length > 0 || Object.keys(occupancyMappingsData).length > 0) {
        console.log('[RRConfigure] Saving rent roll configurations')
        const configResponse = await fetch('/api/documents/rent-roll/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId,
            tenantChargesData: Object.keys(tenantChargesData).length > 0 ? tenantChargesData : undefined,
            occupancyMappingsData: Object.keys(occupancyMappingsData).length > 0 ? occupancyMappingsData : undefined,
          }),
        })

        if (!configResponse.ok) {
          const error = await configResponse.json()
          throw new Error(error.error || 'Failed to save rent roll configurations')
        }

        const result = await configResponse.json()
        console.log('[RRConfigure] Rent roll configurations saved successfully:', result)
      }

      // Notify parent component of config changes
      onConfigChange(localConfig)
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes'
      console.error('[RRConfigure] Save error:', errorMessage)
      setSaveError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    // Reset to original config if provided, otherwise reset to current config
    const resetTo = originalConfig || config
    const resetConfig = JSON.parse(JSON.stringify(resetTo))
    setLocalConfig(resetConfig)
    setMapToSearchQuery({})
    setShowMapToDropdown({})
    // Notify parent of the reset
    onConfigChange(resetConfig)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Modal - Now positioned within ResizablePanel */}
      {isOpen && (
        <div
          className="w-full h-full bg-white flex flex-col overflow-hidden"
        >
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 bg-white items-center justify-between px-3 py-2 border-b border-gray-200">
            <div className="flex justify-between items-center w-full">
              <h2 className="text-xl font-semibold text-gray-900">Configurations</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Map tenant charges, floor plans, and occupancy</p>

          </div>

          {/* Tabs - Sticky */}
          <div className="sticky top-[84px] z-10 flex gap-1 px-3 pt-2 bg-gray-50 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("tenant-charges")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "tenant-charges"
                  ? "bg-white text-gray-900 border-t border-x border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              Tenant Charges
            </button>
            <button
              onClick={() => setActiveTab("floor-plans")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "floor-plans"
                  ? "bg-white text-gray-900 border-t border-x border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              Floor Plan Configuration
            </button>
            <button
              onClick={() => setActiveTab("occupancy")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "occupancy"
                  ? "bg-white text-gray-900 border-t border-x border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
            >
              Occupancy Configuration
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto min-h-0">
            <div className="p-6">
              {activeTab === "tenant-charges" && (
                <div>
                  {/* Table */}
                  <div className="relative min-w-max">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Tenant Charge
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Map To
                          </th>

                          {/* //commenting now may use later */}
                          {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          <div className="flex items-center gap-1">
                            Frequency Conversion
                            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-gray-400 text-gray-500 text-xs">
                              i
                            </span>
                          </div>
                        </th> */}
                        </tr>
                        {/* <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2">
                          <div className="flex items-center gap-8 text-xs font-medium text-gray-600">
                            <span className="flex-1">PER DOC</span>
                            <span className="flex-1">NORMALIZED</span>
                          </div>
                        </th>
                      </tr> */}
                      </thead>
                      <tbody className="bg-white">
                        {(localConfig?.tenantCharges || []).map((charge, index) => (
                          <tr key={charge.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-2 h-2 rounded-full ${charge.isActive !== false ? "bg-green-500" : "bg-red-500"
                                    }`}
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{charge.name}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveCharge(charge.id)}
                                  className="ml-auto p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  title="Remove"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            <td className="px-4 py-3 relative">
                              <div className="relative">
                                <input
                                  type="text"
                                  value={mapToSearchQuery[charge.id] !== undefined ? mapToSearchQuery[charge.id] : charge.apiField}
                                  onChange={(e) => {
                                    setMapToSearchQuery(prev => ({
                                      ...prev,
                                      [charge.id]: e.target.value
                                    }))
                                  }}
                                  onFocus={() => {
                                    setMapToSearchQuery(prev => ({
                                      ...prev,
                                      [charge.id]: ""
                                    }))
                                    setShowMapToDropdown(prev => ({
                                      ...prev,
                                      [charge.id]: true
                                    }))
                                  }}
                                  placeholder="Search or select..."
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:border-blue-500"
                                />

                                {/* Dropdown */}
                                {showMapToDropdown[charge.id] && (
                                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                                    {getFilteredApiFields(charge.id).map((field: string) => (
                                      <button
                                        key={field}
                                        onClick={() => {
                                          setLocalConfig(prev => ({
                                            ...prev,
                                            tenantCharges: prev.tenantCharges.map(c =>
                                              c.id === charge.id ? { ...c, apiField: field } : c
                                            )
                                          }))
                                          setMapToSearchQuery(prev => ({
                                            ...prev,
                                            [charge.id]: field
                                          }))
                                          setShowMapToDropdown(prev => ({
                                            ...prev,
                                            [charge.id]: false
                                          }))
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                                      >
                                        {field}
                                      </button>
                                    ))}
                                    {getFilteredApiFields(charge.id).length === 0 && (
                                      <div className="px-3 py-2 text-sm text-gray-500">
                                        No matching fields
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                            {/* <td className="px-4 py-3">
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <span className="text-sm text-gray-700">{charge.frequency}</span>
                              </div>
                              <span className="text-gray-400">→</span>
                              <div className="flex-1">
                                <select
                                  value={charge.targetFrequency}
                                  onChange={(e) => handleFrequencyChange(charge.id, e.target.value)}
                                  className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:border-blue-500"
                                >
                                  <option value="Monthly">Monthly</option>
                                  <option value="Annual">Annual</option>
                                  <option value="One-Time">One-Time</option>
                                </select>
                              </div>
                            </div>
                          </td> */}
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Column Selector Dropdown */}
                    {showColumnSelector && (
                      <div className="absolute top-full left-4 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                        <div className="p-2">
                          <input
                            type="text"
                            placeholder="Search columns..."
                            value={columnSearchQuery}
                            onChange={(e) => setColumnSearchQuery(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                            autoFocus
                          />
                        </div>
                        <div className="border-t border-gray-200">
                          <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Available Columns</p>
                          <div className="max-h-64 overflow-y-auto">
                            <button
                              onClick={() => {
                                setShowColumnSelector(false)
                                setColumnSearchQuery("")
                              }}
                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <span className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center">
                                <X className="w-3 h-3" />
                              </span>
                              Clear Selection
                            </button>
                            {filteredColumns.map((column: string) => (
                              <button
                                key={column}
                                onClick={() => handleAddColumn(column)}
                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                              >
                                <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${column === 'laundry' ? 'border-orange-500 text-orange-500' : 'border-gray-300'
                                  }`}>
                                  {column === 'laundry' && '○'}
                                </span>
                                {column}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Info message with Add Column button */}
                  <div className="flex gap-2 text-sm text-gray-600 items-baseline">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-400 text-gray-500 text-xs flex-shrink-0 mt-0.5">
                      i
                    </span>
                    <span>Tip: Target frequency changes automatically recalculate values</span>
                  </div>
                </div>
              )}

              {activeTab === "floor-plans" && (
                <div>
                  <div className="min-w-max">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Floor Plan
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Bedrooms
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Bathrooms
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Renovation Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {(localConfig?.floorPlans || []).map((plan, index) => (
                          <tr key={plan.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="px-4 py-3">
                              <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.5"
                                value={plan.bedrooms}
                                onChange={(e) => handleFloorPlanChange(plan.id, 'bedrooms', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                step="0.5"
                                value={plan.bathrooms}
                                onChange={(e) => handleFloorPlanChange(plan.id, 'bathrooms', parseFloat(e.target.value) || 0)}
                                className="w-16 px-2 py-1.5 text-sm border border-gray-300 rounded bg-white text-gray-700"
                              />
                            </td>
<td className="px-4 py-3">
  <select
    value={plan.renovation_status === 'not_specified' ? 'no' : (plan.renovation_status || 'no')}
    onChange={(e) => handleFloorPlanChange(plan.id, 'renovation_status', e.target.value)}
    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:border-blue-500"
  >
    <option value="yes">Yes</option>
    <option value="no">No</option>
  </select>
</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "occupancy" && (
                <div>
                  <div className="min-w-max">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Document Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Normalized
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {(localConfig?.occupancyMappings || []).map((mapping, index) => (
                          <tr key={mapping.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                            <td className="px-4 py-3">
                              <span className="text-sm text-gray-900">{mapping.rawStatus}</span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={mapping.normalizedStatus}
                                onChange={(e) => handleOccupancyChange(mapping.id, e.target.value)}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded bg-white hover:border-gray-400 focus:outline-none focus:border-blue-500"
                              >
                                <option value="Occupied">Occupied</option>
                                <option value="Vacant">Vacant</option>
                                <option value="Admin/Down">Admin/Down</option>
                                <option value="Office">Office</option>
                                <option value="Model">Model</option>
                                <option value="Excluded">Excluded</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-4 text-sm text-gray-600">
                      <span className="font-medium">Validation:</span> All statuses mapped
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 z-10 border-t border-gray-200 px-6 py-4 flex justify-between items-center bg-gray-50">
            {saveError && (
              <div className="absolute left-6 bottom-full mb-2 px-4 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {saveError}
              </div>
            )}
            <button
              onClick={handleReset}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
