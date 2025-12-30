"use client"

/**
 * Assumptions Section Component
 *
 * Displays and allows editing of underwriting assumptions.
 * Supports freezing assumptions to lock values in the database.
 */

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { DollarSign, TrendingUp, Calculator, Percent, Lock, Unlock, Save, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { InputField } from "./input-field"
import type { UserAssumptions } from "./types"
import { useTabData } from "@/hooks/use-tab-data"

interface AssumptionsSectionProps {
  data: Partial<UserAssumptions>
  setData: (updater: (prev: Partial<UserAssumptions>) => Partial<UserAssumptions>) => void
}

export function AssumptionsSection({ data, setData }: AssumptionsSectionProps) {
  const params = useParams()
  const propertyId = params?.id as string | undefined
  
  // Get prefetched assumptions data
  const { 
    data: prefetchedData, 
    isInitialLoading: prefetchLoading,
    prefetched 
  } = useTabData(propertyId || '', 'assumptions')
  
  const [isFrozen, setIsFrozen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [hasLoadedFromPrefetch, setHasLoadedFromPrefetch] = useState(false)

  console.log('[AssumptionsSection] Property ID from params:', propertyId)

  // Use prefetched data when available
  useEffect(() => {
    if (!propertyId) return
    
    // If we have prefetched data, use it immediately
    if (prefetched && prefetchedData && !hasLoadedFromPrefetch) {
      if (prefetchedData.data) {
        setData(() => prefetchedData.data)
        setIsFrozen(prefetchedData.isFrozen || false)
      }
      setHasLoadedFromPrefetch(true)
      return
    }

    // Fallback: fetch if not prefetched
    if (!prefetched && !prefetchLoading && !hasLoadedFromPrefetch) {
      const loadAssumptions = async () => {
        setIsLoading(true)
        try {
          const response = await fetch(`/api/properties/${propertyId}/assumptions`)
          if (response.ok) {
            const result = await response.json()
            if (result.data) {
              setData(() => result.data)
              setIsFrozen(result.isFrozen || false)
            }
          }
        } catch (error) {
          console.error('[AssumptionsSection] Error loading assumptions:', error)
        } finally {
          setIsLoading(false)
        }
      }
      loadAssumptions()
      setHasLoadedFromPrefetch(true)
    }
  }, [propertyId, setData, prefetched, prefetchedData, prefetchLoading, hasLoadedFromPrefetch])

  const updateField = (field: string, value: any) => {
    if (isFrozen) return // Don't allow updates if frozen
    setData((prev: any) => ({ ...prev, [field]: value }))
    setHasUnsavedChanges(true)
    setSaveStatus('idle')
  }

  const handleSave = useCallback(async () => {
    if (!propertyId) return

    setIsSaving(true)
    setSaveStatus('idle')
    try {
      const response = await fetch(`/api/properties/${propertyId}/assumptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSaveStatus('success')
        setHasUnsavedChanges(false)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('[AssumptionsSection] Error saving assumptions:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [propertyId, data])

  const handleFreeze = useCallback(async () => {
    if (!propertyId) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/assumptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, freeze: true }),
      })

      if (response.ok) {
        setIsFrozen(true)
        setHasUnsavedChanges(false)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('[AssumptionsSection] Error freezing assumptions:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [propertyId, data])

  const handleUnfreeze = useCallback(async () => {
    if (!propertyId) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/assumptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, unfreeze: true }),
      })

      if (response.ok) {
        setIsFrozen(false)
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('[AssumptionsSection] Error unfreezing assumptions:', error)
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
    }
  }, [propertyId, data])

  console.log('[AssumptionsSection] Rendering with data:', data)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        <span className="ml-2 text-sm text-gray-600">Loading assumptions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      <div className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-1">Underwriting Assumptions</h2>
          <p className="text-xs text-gray-600 mb-3">Enter your investment assumptions and underwriting parameters.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Status Indicator */}
          {saveStatus === 'success' && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle className="w-3.5 h-3.5" />
              Error
            </span>
          )}

          {/* Frozen Status Badge */}
          {isFrozen && (
            <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
              <Lock className="w-3 h-3" />
              Frozen
            </span>
          )}

          {/* Save Button - Only show when not frozen and has changes */}
          {!isFrozen && hasUnsavedChanges && propertyId && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          )}

          {/* Freeze/Unfreeze Button */}
          {propertyId && (
            isFrozen ? (
              <button
                onClick={handleUnfreeze}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Unlock className="w-3.5 h-3.5" />}
                Unfreeze
              </button>
            ) : (
              <button
                onClick={handleFreeze}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                Freeze
              </button>
            )
          )}
        </div>
      </div>

      {/* Show frozen overlay message */}
      {isFrozen && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-700 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Assumptions are frozen. Click "Unfreeze" to make changes.
          </p>
        </div>
      )}
      

      {/* Deal Overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <DollarSign className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Deal Overview</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <InputField
            label="Purchase Price"
            value={data.purchasePrice}
            onChange={(v) => updateField("purchasePrice", v)}
            prefix="$"
            highlighted
            disabled={isFrozen}
          />
          <InputField
            label="Hold Period"
            value={data.holdPeriod}
            onChange={(v) => updateField("holdPeriod", v)}
            suffix=" years"
            disabled={isFrozen}
          />
          <InputField
            label="Reversion Cap Rate"
            value={data.reversionCapRate}
            onChange={(v) => updateField("reversionCapRate", v)}
            suffix="%"
            disabled={isFrozen}
          />
          <InputField
            label="Exit Costs"
            value={data.exitCostsPercent}
            onChange={(v) => updateField("exitCostsPercent", v)}
            suffix="%"
            disabled={isFrozen}
          />
        </div>
      </div>

      {/* Market & Income Assumptions */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <TrendingUp className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Market & Income Assumptions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Rent Growth (Annual)"
            value={data.rentGrowth}
            onChange={(v) => updateField("rentGrowth", v)}
            suffix="%"
            disabled={isFrozen}
          />
          <InputField
            label="Vacancy %"
            value={data.vacancyPercent}
            onChange={(v) => updateField("vacancyPercent", v)}
            suffix="%"
            disabled={isFrozen}
          />
          <InputField
            label="Credit Loss %"
            value={data.creditLossPercent}
            onChange={(v) => updateField("creditLossPercent", v)}
            suffix="%"
            disabled={isFrozen}
          />
          <InputField
            label="Concessions %"
            value={data.concessionsPercent}
            onChange={(v) => updateField("concessionsPercent", v)}
            suffix="%"
            disabled={isFrozen}
          />
          <InputField
            label="Other Income Growth %"
            value={data.otherIncomeGrowth}
            onChange={(v) => updateField("otherIncomeGrowth", v)}
            suffix="%"
            disabled={isFrozen}
          />
        </div>
      </div>

      {/* Expense Assumptions */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <Calculator className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Expense Assumptions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Management Fee % of EGI"
            value={data.managementFeePercent}
            onChange={(v) => updateField("managementFeePercent", v)}
            suffix="%"
            disabled={isFrozen}
          />
          <InputField
            label="Payroll per Unit"
            value={data.payrollPerUnit}
            onChange={(v) => updateField("payrollPerUnit", v)}
            prefix="$"
            disabled={isFrozen}
          />
          <InputField
            label="Repairs & Maintenance per Unit"
            value={data.repairsPerUnit}
            onChange={(v) => updateField("repairsPerUnit", v)}
            prefix="$"
            disabled={isFrozen}
          />
          <InputField
            label="Utilities per Unit"
            value={data.utilitiesPerUnit}
            onChange={(v) => updateField("utilitiesPerUnit", v)}
            prefix="$"
            disabled={isFrozen}
          />
          <InputField
            label="Insurance per Unit"
            value={data.insurancePerUnit}
            onChange={(v) => updateField("insurancePerUnit", v)}
            prefix="$"
            disabled={isFrozen}
          />
          <InputField
            label="Replacement Reserves per Unit"
            value={data.replacementReservesPerUnit}
            onChange={(v) => updateField("replacementReservesPerUnit", v)}
            prefix="$"
            disabled={isFrozen}
          />
        </div>
      </div>

      {/* Capital & Debt */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <Percent className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Capital & Debt</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Loan Amount"
            value={data.loanAmount}
            onChange={(v) => updateField("loanAmount", v)}
            prefix="$"
            highlighted
            disabled={isFrozen}
          />
          <InputField label="LTV %" value={data.ltvPercent} onChange={(v) => updateField("ltvPercent", v)} suffix="%" disabled={isFrozen} />
          <InputField
            label="Interest Rate %"
            value={data.interestRate}
            onChange={(v) => updateField("interestRate", v)}
            suffix="%"
            disabled={isFrozen}
          />
          <InputField
            label="Amortization"
            value={data.amortizationYears}
            onChange={(v) => updateField("amortizationYears", v)}
            suffix=" years"
            disabled={isFrozen}
          />
          <InputField
            label="Loan Term"
            value={data.loanTermYears}
            onChange={(v) => updateField("loanTermYears", v)}
            suffix=" years"
            disabled={isFrozen}
          />
          <InputField
            label="Interest-Only Years"
            value={data.interestOnlyYears}
            onChange={(v) => updateField("interestOnlyYears", v)}
            suffix=" years"
            disabled={isFrozen}
          />
          <InputField
            label="DSCR Target"
            value={data.dscrTarget}
            onChange={(v) => updateField("dscrTarget", v)}
            suffix="x"
            disabled={isFrozen}
          />
          <InputField
            label="Initial Reserves"
            value={data.initialReserves}
            onChange={(v) => updateField("initialReserves", v)}
            prefix="$"
            disabled={isFrozen}
          />
          <InputField
            label="CapEx Reserve per Unit"
            value={data.capexReservePerUnit}
            onChange={(v) => updateField("capexReservePerUnit", v)}
            prefix="$"
            disabled={isFrozen}
          />
        </div>
      </div>
    </div>
  )
}
