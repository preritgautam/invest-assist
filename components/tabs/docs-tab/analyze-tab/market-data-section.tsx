"use client"

/**
 * Market Data Section Component
 *
 * Displays market data from public sources with data attribution.
 */

import { AlertCircle } from "lucide-react"
import { InputField } from "./input-field"
import type { MarketData } from "./types"

interface MarketDataSectionProps {
  data: Partial<MarketData>
  setData: (updater: (prev: Partial<MarketData>) => Partial<MarketData>) => void
}

export function MarketDataSection({ data, setData }: MarketDataSectionProps) {
  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Market Data from Public Sources</h2>
        <p className="text-xs text-gray-600 mb-3">
          Data automatically fetched from public APIs. Confirm accuracy and update if needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <InputField
          label="Market Rent (Submarket Avg)"
          value={data.marketRentSubmarket}
          onChange={(v) => updateField("marketRentSubmarket", v)}
          prefix="$"
          source="Rentometer / Zillow API"
        />
        <InputField
          label="Market Vacancy Rate"
          value={data.marketVacancyRate}
          onChange={(v) => updateField("marketVacancyRate", v)}
          suffix="%"
          source="CoStar / Census"
        />
        <InputField
          label="Cap Rate Benchmark"
          value={data.capRateBenchmark}
          onChange={(v) => updateField("capRateBenchmark", v)}
          suffix="%"
          source="CBRE / RCA"
        />
        <InputField
          label="Property Tax Mill Rate"
          value={data.propertyTaxMillRate}
          onChange={(v) => updateField("propertyTaxMillRate", v)}
          suffix="%"
          source="County Assessor"
        />
        <InputField
          label="Insurance Cost Benchmark"
          value={data.insuranceCostBenchmark}
          onChange={(v) => updateField("insuranceCostBenchmark", v)}
          prefix="$"
          source="Regional Database"
        />
        <InputField
          label="Expense Ratio Benchmark"
          value={data.expenseRatioBenchmark}
          onChange={(v) => updateField("expenseRatioBenchmark", v)}
          suffix="%"
          source="Freddie Mac"
        />
        <InputField
          label="Economic Growth %"
          value={data.economicGrowthPercent}
          onChange={(v) => updateField("economicGrowthPercent", v)}
          suffix="%"
          source="BLS / Federal Reserve"
        />
        <InputField
          label="Inflation Rate"
          value={data.inflationRate}
          onChange={(v) => updateField("inflationRate", v)}
          suffix="%"
          source="BLS CPI"
        />
        <InputField
          label="Population Growth"
          value={data.populationGrowth}
          onChange={(v) => updateField("populationGrowth", v)}
          suffix="%"
          source="Census / CoStar"
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900 mb-1">Data Source Information</h4>
            <p className="text-xs text-blue-700">
              Market data is automatically refreshed from public APIs. Last updated: {new Date().toLocaleDateString()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
