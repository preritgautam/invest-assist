/**
 * Summary Metrics Cards Component
 * Displays key financial metrics for sources and uses
 */

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, Percent, Calculator } from "lucide-react"

interface SummaryMetricsProps {
  totalSources: number
  totalUses: number
  netDebtFinancing: number
  equityContribution: number
  cashFlowFunded: number
}

export function SummaryMetrics({
  totalSources,
  totalUses,
  netDebtFinancing,
  equityContribution,
  cashFlowFunded,
}: SummaryMetricsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Total Sources</p>
              <p className="text-sm font-bold text-gray-900">${totalSources.toLocaleString()}</p>
              <p className="text-xs text-gray-500">100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Total Uses</p>
              <p className="text-sm font-bold text-gray-900">${totalUses.toLocaleString()}</p>
              <p className="text-xs text-gray-500">100%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Net Debt Financing</p>
              <p className="text-sm font-bold text-gray-900">${netDebtFinancing.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {totalSources > 0 ? ((netDebtFinancing / totalSources) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Percent className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Equity Contribution</p>
              <p className="text-sm font-bold text-gray-900">${equityContribution.toLocaleString()}</p>
              <p className="text-xs text-gray-500">
                {totalSources > 0 ? ((equityContribution / totalSources) * 100).toFixed(1) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calculator className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Cash Flow Funded</p>
              <p className="text-sm font-bold text-gray-900">${cashFlowFunded.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Hold Period</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
