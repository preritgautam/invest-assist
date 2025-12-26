"use client"

/**
 * Document Data Section Component
 *
 * Displays and allows editing of data extracted from property documents.
 */

import { FileText, Home } from "lucide-react"
import { InputField } from "./input-field"
import type { DocumentData } from "./types"
import { useParams } from 'next/navigation'
import { useEffect, useState } from "react"

interface DocumentDataSectionProps {
  data: Partial<DocumentData>
  setData: (updater: (prev: Partial<DocumentData>) => Partial<DocumentData>) => void
}

export function DocumentDataSection({ data, setData }: DocumentDataSectionProps) {
  const params = useParams()
  const propertyId = params.id as string 

  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
  }

 const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [osData, setOSData] = useState(null)
const [omData, setOmData] = useState(null) // Add state for OM data
const [showMonthly, setShowMonthly] = useState(false)

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
      // Fetch both in parallel
      const [osResponse, omResponse] = await Promise.all([
        fetch(`/api/properties/${propertyId}/os-data`),
        fetch(`/api/properties/${propertyId}/om-data`)
      ])

      const osData = await osResponse.json()
      const omData = await omResponse.json()

      if (!osResponse.ok) {
        throw new Error(osData.error || "Failed to fetch OS data")
      }

      if (!omResponse.ok) {
        throw new Error(omData.error || "Failed to fetch OM data")
      }

      setOSData(osData)
      setOmData(omData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  fetchData()
}, [propertyId])


  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Extracted from Documents</h2>
        <p className="text-xs text-gray-600 mb-3">
          Data automatically parsed from Operating Statement, Rent Roll, and Offering Memorandum.
        </p>
      </div>

      {/* Operating Statement Data */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <FileText className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Operating Statement (OS)</h3>
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
