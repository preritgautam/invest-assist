"use client"

/**
 * Assumptions Section Component
 *
 * Displays and allows editing of underwriting assumptions.
 */

import { DollarSign, TrendingUp, Calculator, Percent } from "lucide-react"
import { InputField } from "./input-field"
import type { UserAssumptions } from "./types"

interface AssumptionsSectionProps {
  data: Partial<UserAssumptions>
  setData: (updater: (prev: Partial<UserAssumptions>) => Partial<UserAssumptions>) => void
}

export function AssumptionsSection({ data, setData }: AssumptionsSectionProps) {
  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Underwriting Assumptions</h2>
        <p className="text-xs text-gray-600 mb-3">Enter your investment assumptions and underwriting parameters.</p>
      </div>

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
          />
          <InputField
            label="Hold Period"
            value={data.holdPeriod}
            onChange={(v) => updateField("holdPeriod", v)}
            suffix=" years"
          />
          <InputField
            label="Reversion Cap Rate"
            value={data.reversionCapRate}
            onChange={(v) => updateField("reversionCapRate", v)}
            suffix="%"
          />
          <InputField
            label="Exit Costs"
            value={data.exitCostsPercent}
            onChange={(v) => updateField("exitCostsPercent", v)}
            suffix="%"
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
          />
          <InputField
            label="Vacancy %"
            value={data.vacancyPercent}
            onChange={(v) => updateField("vacancyPercent", v)}
            suffix="%"
          />
          <InputField
            label="Credit Loss %"
            value={data.creditLossPercent}
            onChange={(v) => updateField("creditLossPercent", v)}
            suffix="%"
          />
          <InputField
            label="Concessions %"
            value={data.concessionsPercent}
            onChange={(v) => updateField("concessionsPercent", v)}
            suffix="%"
          />
          <InputField
            label="Other Income Growth %"
            value={data.otherIncomeGrowth}
            onChange={(v) => updateField("otherIncomeGrowth", v)}
            suffix="%"
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
          />
          <InputField
            label="Payroll per Unit"
            value={data.payrollPerUnit}
            onChange={(v) => updateField("payrollPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Repairs & Maintenance per Unit"
            value={data.repairsPerUnit}
            onChange={(v) => updateField("repairsPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Utilities per Unit"
            value={data.utilitiesPerUnit}
            onChange={(v) => updateField("utilitiesPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Insurance per Unit"
            value={data.insurancePerUnit}
            onChange={(v) => updateField("insurancePerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Replacement Reserves per Unit"
            value={data.replacementReservesPerUnit}
            onChange={(v) => updateField("replacementReservesPerUnit", v)}
            prefix="$"
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
          />
          <InputField label="LTV %" value={data.ltvPercent} onChange={(v) => updateField("ltvPercent", v)} suffix="%" />
          <InputField
            label="Interest Rate %"
            value={data.interestRate}
            onChange={(v) => updateField("interestRate", v)}
            suffix="%"
          />
          <InputField
            label="Amortization"
            value={data.amortizationYears}
            onChange={(v) => updateField("amortizationYears", v)}
            suffix=" years"
          />
          <InputField
            label="Loan Term"
            value={data.loanTermYears}
            onChange={(v) => updateField("loanTermYears", v)}
            suffix=" years"
          />
          <InputField
            label="Interest-Only Years"
            value={data.interestOnlyYears}
            onChange={(v) => updateField("interestOnlyYears", v)}
            suffix=" years"
          />
          <InputField
            label="DSCR Target"
            value={data.dscrTarget}
            onChange={(v) => updateField("dscrTarget", v)}
            suffix="x"
          />
          <InputField
            label="Initial Reserves"
            value={data.initialReserves}
            onChange={(v) => updateField("initialReserves", v)}
            prefix="$"
          />
          <InputField
            label="CapEx Reserve per Unit"
            value={data.capexReservePerUnit}
            onChange={(v) => updateField("capexReservePerUnit", v)}
            prefix="$"
          />
        </div>
      </div>
    </div>
  )
}
