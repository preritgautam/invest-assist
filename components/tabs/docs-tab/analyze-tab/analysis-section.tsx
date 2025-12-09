/**
 * Analysis Section Component
 *
 * Displays comprehensive financial analysis and metrics.
 */

import { Percent, DollarSign, TrendingUp, Calculator, BarChart3, AlertCircle } from "lucide-react"
import { MetricCard } from "./metric-card"

interface AnalysisSectionProps {
  metrics: {
    capRate: string
    noi: string
    cashFlow: string
    cocReturn: string
    dscr: string
  }
  documentData: any
  assumptions: any
}

export function AnalysisSection({ metrics, documentData, assumptions }: AnalysisSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Financial Analysis & Metrics</h2>
        <p className="text-xs text-gray-600 mb-3">
          Comprehensive analysis based on document data, market insights, and your underwriting assumptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          title="Capitalization Rate"
          value={`${metrics.capRate}%`}
          description="NOI / Purchase Price"
          icon={<Percent className="w-4 h-4" />}
          color="blue"
        />
        <MetricCard
          title="Net Operating Income"
          value={`$${metrics.noi}`}
          description="Annual NOI"
          icon={<DollarSign className="w-4 h-4" />}
          color="emerald"
        />
        <MetricCard
          title="Cash Flow"
          value={`$${metrics.cashFlow}`}
          description="After Debt Service"
          icon={<TrendingUp className="w-4 h-4" />}
          color="emerald"
        />
        <MetricCard
          title="Cash-on-Cash Return"
          value={`${metrics.cocReturn}%`}
          description="Annual Return on Equity"
          icon={<Percent className="w-4 h-4" />}
          color="blue"
        />
        <MetricCard
          title="DSCR"
          value={`${metrics.dscr}x`}
          description="Debt Service Coverage"
          icon={<Calculator className="w-4 h-4" />}
          color="amber"
        />
        <MetricCard
          title="Equity Multiple"
          value="1.85x"
          description="5-Year Projection"
          icon={<BarChart3 className="w-4 h-4" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-900 mb-3">5-Year Cash Flow Projection</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {[1, 2, 3, 4, 5].map((year) => {
              const height = 40 + year * 10
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-bold text-slate-700">${(45000 + year * 7000).toLocaleString('en-US')}</div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500 shadow-sm"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-slate-600">Y{year}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Property Value Growth</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {[1, 2, 3, 4, 5].map((year) => {
              const height = 50 + year * 8
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-bold text-slate-700">${(3.5 + year * 0.2).toFixed(1)}M</div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500 shadow-sm"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-slate-600">Y{year}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-amber-50 rounded border border-amber-200">
        <h3 className="text-xs font-bold text-amber-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Risk Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-emerald-800 mb-2">Strengths</h4>
            <ul className="text-xs text-slate-700 space-y-1">
              <li>• Strong DSCR above lender requirements</li>
              <li>• Below-market rents with upside potential</li>
              <li>• Stable occupancy rate</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-800 mb-2">Considerations</h4>
            <ul className="text-xs text-slate-700 space-y-1">
              <li>• Market vacancy rate trending up</li>
              <li>• Property age may require CapEx</li>
              <li>• Interest rate sensitivity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
