"use client"

/**
 * Document Data Section Component
 *
 * Displays and allows editing of data extracted from property documents.
 */

import { FileText, Home, Loader2, Save, Check, RotateCcw } from "lucide-react"
import { InputField } from "./input-field"
import type { DocumentData } from "./types"
import { useParams } from 'next/navigation'
import { useEffect, useState, useCallback, useRef } from "react"

// Types for OS response
interface MonthlyData {
  jan: number
  feb: number
  mar: number
  apr: number
  may: number
  jun: number
  jul: number
  aug: number
  sep: number
  oct: number
  nov: number
  dec: number
}

interface LineItem {
  id: string
  name: string
  label?: string
  notes: string
  perUnit: number
  docTotal?: number
  annualAmount?: number
  monthlyData?: MonthlyData
  children?: LineItem[]
  isExpanded?: boolean
  hasChildren?: boolean
  isCalculated?: boolean
  hasFormula?: boolean
  formula?: string
}

interface OSExtractionResult {
  property_info: {
    property_name: string | null
    total_units: number | null
    period_start: string | null
    period_end: string | null
    fiscal_year: number | null
  }
  income_items: LineItem[]
  expense_items: LineItem[]
  capital_items: LineItem[]
  debt_items: LineItem[]
  summary: {
    effective_gross_income: number | null
    total_operating_expenses: number | null
    net_operating_income: number | null
    total_capital_expenses: number | null
    total_debt_service: number | null
    cash_flow_after_debt: number | null
  }
}

interface OSDataResponse {
  success: boolean
  propertyId: string
  propertyName: string
  hasOSData: boolean
  osExtraction: OSExtractionResult | null
  source?: string
}

// Types for OM response
interface OMExtractionResult {
  property_info: {
    property_name: string | null
    property_address: string | null
    city: string | null
    state: string | null
    zip_code: string | null
    year_built: number | null
    total_units: number | null
    avg_unit_size: number | null
    occupancy_rate: number | null
    property_type: string | null
    unit_mix_breakdown?: Array<{
      unit_type: string
      count: number
      avg_rent: number
      avg_sqft: number
    }>
  }
  financial_info: {
    noi: number | null
    cap_rate: number | null
    effective_gross_income: number | null
    total_operating_expenses: number | null
    market_rent_unit: number | null
    market_rent_psf: number | null
  }
}

interface OMDataResponse {
  success: boolean
  propertyId: string
  propertyName: string
  hasOMData: boolean
  omExtraction: OMExtractionResult | null
  source?: string
}

interface DocumentDataSectionProps {
  data: Partial<DocumentData>
  setData: (updater: (prev: Partial<DocumentData>) => Partial<DocumentData>) => void
}

// Helper function to find a line item by id recursively
function findLineItemById(items: LineItem[], id: string): LineItem | null {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const found = findLineItemById(item.children, id)
      if (found) return found
    }
  }
  return null
}

// Helper function to find line items by name pattern recursively
function findLineItemsByName(items: LineItem[], pattern: string): LineItem[] {
  const results: LineItem[] = []
  for (const item of items) {
    if (item.name.toLowerCase().includes(pattern.toLowerCase()) || 
        (item.label && item.label.toLowerCase().includes(pattern.toLowerCase()))) {
      results.push(item)
    }
    if (item.children) {
      results.push(...findLineItemsByName(item.children, pattern))
    }
  }
  return results
}

// Helper to sum all leaf items in a category
function sumLeafItems(items: LineItem[]): number {
  let total = 0
  for (const item of items) {
    if (item.children && item.children.length > 0) {
      total += sumLeafItems(item.children)
    } else if (item.annualAmount !== undefined) {
      total += item.annualAmount
    } else if (item.docTotal !== undefined) {
      total += item.docTotal
    }
  }
  return total
}

export function DocumentDataSection({ data, setData }: DocumentDataSectionProps) {
  const params = useParams()
  const propertyId = params.id as string 

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
  }

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [osData, setOSData] = useState<OSDataResponse | null>(null)
  const [omData, setOmData] = useState<OMDataResponse | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [savedData, setSavedData] = useState<Partial<DocumentData> | null>(null)
  const [isEdited, setIsEdited] = useState(false) // Tracks if data was previously edited/saved
  const [dataSource, setDataSource] = useState<'original' | 'edited'>('original')
  const initialLoadDone = useRef(false)

  // Save data to database
  const saveToDatabase = useCallback(async () => {
    if (!propertyId || saving) return

    setSaving(true)
    setSaveSuccess(false)
    
    try {
      const response = await fetch(`/api/properties/${propertyId}/analysis-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save')
      }

      setSavedData({ ...data })
      setHasUnsavedChanges(false)
      setIsEdited(true)
      setDataSource('edited')
      setSaveSuccess(true)
      
      // Clear success indicator after 2 seconds
      setTimeout(() => setSaveSuccess(false), 2000)
    } catch (err) {
      console.error('Save error:', err)
      setError(err instanceof Error ? err.message : 'Failed to save data')
    } finally {
      setSaving(false)
    }
  }, [propertyId, data, saving])

  // Extract values from OS data
  const extractOSValues = useCallback((os: OSExtractionResult) => {
    const values: Partial<DocumentData> = {}

    // Find rental income
    const rentalIncome = findLineItemById(os.income_items, 'rental-income-line')
    if (rentalIncome) {
      values.actualRentCollected = rentalIncome.annualAmount || rentalIncome.docTotal || 0
    }

    // Find other income
    const otherIncome = findLineItemById(os.income_items, 'total-other-income')
    if (otherIncome) {
      values.otherIncome = otherIncome.annualAmount || 0
    }

    // Total operating expenses from summary or expense_items
    if (os.summary.total_operating_expenses) {
      values.totalOperatingExpenses = os.summary.total_operating_expenses
    } else if (os.expense_items.length > 0) {
      values.totalOperatingExpenses = sumLeafItems(os.expense_items)
    }

    // Find property taxes
    const taxItems = findLineItemsByName(os.expense_items, 'tax')
    if (taxItems.length > 0) {
      values.propertyTaxes = taxItems.reduce((sum, item) => 
        sum + (item.annualAmount || item.docTotal || 0), 0)
    }

    // Find insurance
    const insuranceItems = findLineItemsByName(os.expense_items, 'insurance')
    if (insuranceItems.length > 0) {
      values.insurance = insuranceItems.reduce((sum, item) => 
        sum + (item.annualAmount || item.docTotal || 0), 0)
    }

    // NOI from summary or calculate
    if (os.summary.net_operating_income) {
      values.totalNOI = os.summary.net_operating_income
    } else if (os.summary.effective_gross_income && os.summary.total_operating_expenses) {
      values.totalNOI = os.summary.effective_gross_income - os.summary.total_operating_expenses
    }

    // Vacancy loss
    const vacancyLoss = findLineItemById(os.income_items, 'vacancy-loss')
    if (vacancyLoss) {
      values.vacancyLoss = Math.abs(vacancyLoss.annualAmount || vacancyLoss.docTotal || 0)
    }

    // Loss to lease percentage
    const gainToLease = findLineItemById(os.income_items, 'gain-to-lease')
    const netRentalIncome = findLineItemById(os.income_items, 'net-rental-income-line')
    if (gainToLease && netRentalIncome && netRentalIncome.annualAmount) {
      const ltl = (Math.abs(gainToLease.annualAmount || 0) / netRentalIncome.annualAmount) * 100
      values.lossToLeasePercent = Math.round(ltl * 100) / 100
    }

    return values
  }, [])

  // Extract values from OM data
  const extractOMValues = useCallback((om: OMExtractionResult) => {
    const values: Partial<DocumentData> = {}

    if (om.property_info) {
      values.propertyName = om.property_info.property_name || undefined
      values.yearBuilt = om.property_info.year_built || undefined
      values.unitCount = om.property_info.total_units || undefined

      // Calculate total square footage
      if (om.property_info.avg_unit_size && om.property_info.total_units) {
        values.squareFootage = om.property_info.avg_unit_size * om.property_info.total_units
      }

      // Occupancy
      if (om.property_info.occupancy_rate) {
        values.occupancyPercent = om.property_info.occupancy_rate * 100
      }

      // Average rent from unit mix
      if (om.property_info.unit_mix_breakdown && om.property_info.unit_mix_breakdown.length > 0) {
        const totalRent = om.property_info.unit_mix_breakdown.reduce(
          (sum, unit) => sum + (unit.avg_rent * unit.count), 0
        )
        const totalUnits = om.property_info.unit_mix_breakdown.reduce(
          (sum, unit) => sum + unit.count, 0
        )
        if (totalUnits > 0) {
          values.avgRentPerUnit = Math.round(totalRent / totalUnits)
        }
      }
    }

    if (om.financial_info) {
      // Market rent
      if (om.financial_info.market_rent_unit) {
        values.marketRentPerUnit = om.financial_info.market_rent_unit
        values.marketRentComparable = om.financial_info.market_rent_unit
      }

      // NOI from OM if not from OS
      if (om.financial_info.noi) {
        values.totalNOI = om.financial_info.noi
      }

      // Operating expenses from OM if not from OS
      if (om.financial_info.total_operating_expenses) {
        values.totalOperatingExpenses = om.financial_info.total_operating_expenses
      }
    }

    return values
  }, [])

  // Reset to original API data
  const resetToOriginal = useCallback(() => {
    if (!osData && !omData) return

    const newData: Partial<DocumentData> = {}

    // Extract from OS data
    if (osData?.hasOSData && osData.osExtraction) {
      Object.assign(newData, extractOSValues(osData.osExtraction))
    }

    // Extract from OM data
    if (omData?.hasOMData && omData.omExtraction) {
      const omValues = extractOMValues(omData.omExtraction)
      Object.keys(omValues).forEach((key) => {
        const k = key as keyof DocumentData
        if (omValues[k] !== undefined && (newData[k] === undefined || newData[k] === 0)) {
          (newData as any)[k] = omValues[k]
        }
      })
      if (omValues.propertyName) newData.propertyName = omValues.propertyName
      if (omValues.yearBuilt) newData.yearBuilt = omValues.yearBuilt
      if (omValues.squareFootage) newData.squareFootage = omValues.squareFootage
      if (omValues.marketRentComparable) newData.marketRentComparable = omValues.marketRentComparable
    }

    setData((prev) => ({ ...prev, ...newData }))
    setDataSource('original')
    setHasUnsavedChanges(true) // Mark as having changes so user can save
  }, [osData, omData, extractOSValues, extractOMValues, setData])

  useEffect(() => {
    if (!propertyId) {
      setOSData(null)
      setOmData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch all three in parallel: saved data, OS data, and OM data
        const [savedResponse, osResponse, omResponse] = await Promise.all([
          fetch(`/api/properties/${propertyId}/analysis-data`),
          fetch(`/api/properties/${propertyId}/os-data`),
          fetch(`/api/properties/${propertyId}/om-data`)
        ])

        const savedResult = await savedResponse.json()
        const osResult = await osResponse.json()
        const omResult = await omResponse.json()

        // Check if we have saved data first AND it's been edited (user's edits take priority)
        if (savedResponse.ok && savedResult.hasData && savedResult.isEdited && savedResult.data) {
          setSavedData(savedResult.data)
          setIsEdited(true)
          setDataSource('edited')
          setData((prev) => ({ ...prev, ...savedResult.data }))
          initialLoadDone.current = true
        }

        if (!osResponse.ok) {
          console.warn('OS data fetch warning:', osResult.error)
        } else {
          setOSData(osResult)
        }

        if (!omResponse.ok) {
          console.warn('OM data fetch warning:', omResult.error)
        } else {
          setOmData(omResult)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [propertyId, setData])

  // Update form data when OS/OM data changes (only if no saved data)
  useEffect(() => {
    // Skip if we already loaded saved data from DB
    if (savedData && initialLoadDone.current) return

    const newData: Partial<DocumentData> = {}

    // Extract from OS data
    if (osData?.hasOSData && osData.osExtraction) {
      Object.assign(newData, extractOSValues(osData.osExtraction))
    }

    // Extract from OM data (OM values can supplement or override OS where appropriate)
    if (omData?.hasOMData && omData.omExtraction) {
      const omValues = extractOMValues(omData.omExtraction)
      // Only assign OM values if they exist and OS didn't provide them
      Object.keys(omValues).forEach((key) => {
        const k = key as keyof DocumentData
        if (omValues[k] !== undefined && (newData[k] === undefined || newData[k] === 0)) {
          (newData as any)[k] = omValues[k]
        }
      })
      // Always use OM for these fields
      if (omValues.propertyName) newData.propertyName = omValues.propertyName
      if (omValues.yearBuilt) newData.yearBuilt = omValues.yearBuilt
      if (omValues.squareFootage) newData.squareFootage = omValues.squareFootage
      if (omValues.marketRentComparable) newData.marketRentComparable = omValues.marketRentComparable
    }

    // Update the parent state if we have new data
    if (Object.keys(newData).length > 0) {
      setData((prev) => ({ ...prev, ...newData }))
    }
  }, [osData, omData, extractOSValues, extractOMValues, setData, savedData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-sm text-gray-600">Loading document data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-bold text-gray-900">Extracted from Documents</h2>
            {/* Data Source Badge */}
            {dataSource === 'edited' ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                User Edited
              </span>
            ) : (osData?.hasOSData || omData?.hasOMData) ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                Original from API
              </span>
            ) : null}
          </div>
          <p className="text-xs text-gray-600">
            {dataSource === 'edited' 
              ? 'Showing your saved edits. Edit and save again to update.'
              : 'Data automatically parsed from Operating Statement, Rent Roll, and Offering Memorandum.'}
          </p>
          {error && (
            <p className="text-xs text-amber-600 mt-1">Note: {error}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Reset to Original button - only show if edited */}
          {dataSource === 'edited' && (osData?.hasOSData || omData?.hasOMData) && (
            <button
              onClick={resetToOriginal}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Original
            </button>
          )}
          <button
            onClick={saveToDatabase}
            disabled={saving || !hasUnsavedChanges}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              saveSuccess
                ? 'bg-green-100 text-green-700 border border-green-300'
                : hasUnsavedChanges
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Saving...
            </>
          ) : saveSuccess ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Saved
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              Save Changes
            </>
          )}
          </button>
        </div>
      </div>

      {/* Operating Statement Data */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <FileText className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Operating Statement (OS)</h3>
          {osData?.hasOSData && (
            <span className="text-xs text-green-600 ml-auto">✓ Data loaded</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Actual Rent Collected"
            value={data.actualRentCollected}
            onChange={(v) => updateField("actualRentCollected", v)}
            prefix="$"
          />
          <InputField
            label="Other Income"
            value={data.otherIncome}
            onChange={(v) => updateField("otherIncome", v)}
            prefix="$"
          />
          <InputField
            label="Total Operating Expenses"
            value={data.totalOperatingExpenses}
            onChange={(v) => updateField("totalOperatingExpenses", v)}
            prefix="$"
          />
          <InputField
            label="Property Taxes"
            value={data.propertyTaxes}
            onChange={(v) => updateField("propertyTaxes", v)}
            prefix="$"
          />
          <InputField
            label="Insurance Expense"
            value={data.insurance}
            onChange={(v) => updateField("insurance", v)}
            prefix="$"
          />
          <InputField
            label="Total NOI"
            value={data.totalNOI}
            onChange={(v) => updateField("totalNOI", v)}
            prefix="$"
            highlighted
          />
        </div>
      </div>

      {/* Rent Roll Data */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <Home className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Rent Roll (RR)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField label="Unit Count" value={data.unitCount} onChange={(v) => updateField("unitCount", v)} />
          <InputField
            label="Average Rent per Unit"
            value={data.avgRentPerUnit}
            onChange={(v) => updateField("avgRentPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Market Rent per Unit"
            value={data.marketRentPerUnit}
            onChange={(v) => updateField("marketRentPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Occupancy %"
            value={data.occupancyPercent}
            onChange={(v) => updateField("occupancyPercent", v)}
            suffix="%"
          />
          <InputField
            label="Loss-to-Lease %"
            value={data.lossToLeasePercent}
            onChange={(v) => updateField("lossToLeasePercent", v)}
            suffix="%"
          />
          <InputField
            label="Vacancy Loss"
            value={data.vacancyLoss}
            onChange={(v) => updateField("vacancyLoss", v)}
            prefix="$"
          />
        </div>
      </div>

      {/* Offering Memorandum Data */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <FileText className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Offering Memorandum (OM)</h3>
          {omData?.hasOMData && (
            <span className="text-xs text-green-600 ml-auto">✓ Data loaded</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="col-span-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">Property Name</label>
            <input
              type="text"
              value={data.propertyName || ""}
              onChange={(e) => updateField("propertyName", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <InputField label="Year Built" value={data.yearBuilt} onChange={(v) => updateField("yearBuilt", v)} />
          <InputField
            label="Square Footage"
            value={data.squareFootage}
            onChange={(v) => updateField("squareFootage", v)}
            suffix=" SF"
          />
          <InputField
            label="Market Rent (Comparable)"
            value={data.marketRentComparable}
            onChange={(v) => updateField("marketRentComparable", v)}
            prefix="$"
          />
        </div>
      </div>
    </div>
  )
}
