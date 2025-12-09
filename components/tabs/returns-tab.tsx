/**
 * Returns Tab Component - Investment Returns Analysis
 *
 * This component provides comprehensive investment returns analysis including
 * key return metrics (IRR, cash-on-cash, equity multiple), cash flow projections,
 * investment summary, and risk assessment for property investments.
 *
 * Key Features:
 * - Key return metrics display with color-coded icons
 * - Annual cash flow projections table with cumulative calculations
 * - Investment summary with ROI calculations
 * - Risk assessment with categorized risk levels
 * - Responsive design with mobile-optimized layouts
 * - Dynamic data handling with fallback calculations
 *
 * @component
 * @example
 * <ReturnsTab property={selectedProperty} />
 */

"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, DollarSign, Percent, Calendar, Building } from "lucide-react"
import type { PropertyData } from "@/lib/property-data"

/**
 * Props interface for ReturnsTab component
 */
interface ReturnsTabProps {
  /** Property data object containing returns information, or null if no property selected */
  property: PropertyData | null
}

/**
 * ReturnsTab Component - Comprehensive investment returns analysis
 *
 * Displays detailed investment returns including key metrics, cash flow projections,
 * investment summary calculations, and risk assessment for the selected property.
 */
export function ReturnsTab({ property }: ReturnsTabProps) {
  // Handle case where no property is selected
  if (!property) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-4 sm:p-6 lg:p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-4">Investment Returns</h2>
        <p className="text-xs sm:text-sm text-gray-600">Select a property to view return analysis.</p>
      </div>
    )
  }

  // Define key return metrics with fallback values and styling
  const returnMetrics = [
    {
      label: "IRR",
      value: property.returns?.irr || property.keyMetrics?.irr || "0.0%",
      icon: TrendingUp,
      color: "green",
    },
    {
      label: "Cash-on-Cash Return",
      value: property.returns?.cashOnCash || property.keyMetrics?.cocReturn || "0.0%",
      icon: DollarSign,
      color: "blue",
    },
    {
      label: "Equity Multiple",
      value: property.returns?.equityMultiple || property.keyMetrics?.emx || "0.0x",
      icon: Percent,
      color: "purple",
    },
    {
      label: "Hold Period",
      value: property.returns?.holdPeriod || property.holdPeriod || "0 Years",
      icon: Calendar,
      color: "orange",
    },
  ]

  // Use property cash flow data or create default 5-year projection
  const cashFlowData = property.chartData || [
    { year: "Year 1", cashFlow: 0, cumulative: 0 },
    { year: "Year 2", cashFlow: 0, cumulative: 0 },
    { year: "Year 3", cashFlow: 0, cumulative: 0 },
    { year: "Year 4", cashFlow: 0, cumulative: 0 },
    { year: "Year 5", cashFlow: 0, cumulative: 0 },
  ]

  // Calculate cumulative cash flow for each year
  const formattedCashFlowData = cashFlowData.map((item, index) => {
    const cumulative = cashFlowData.slice(0, index + 1).reduce((sum, year) => sum + year.cashFlow, 0)
    return {
      year: item.year,
      cashFlow: item.cashFlow,
      cumulative: cumulative,
    }
  })

  // Calculate investment summary metrics
  const totalCashFlow = formattedCashFlowData.reduce((sum, year) => sum + year.cashFlow, 0)
  const initialInvestment = property.sourcesUses?.sources.find((s) => s.item.includes("Equity"))?.amount || 500000
  const totalReturn = initialInvestment + totalCashFlow
  const netProfit = totalReturn - initialInvestment
  const roi = initialInvestment > 0 ? ((netProfit / initialInvestment) * 100).toFixed(0) : "0"

  return (
    <div className="space-y-6">
      {/* Header section with property information and performance badge */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Investment Returns</CardTitle>
                <p className="text-xs text-gray-600">{property.name}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              Strong Performance
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key return metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {returnMetrics.map((metric, index) => {
          const Icon = metric.icon
          // Define color classes for different metric types
          const colorClasses = {
            green: "bg-green-100 text-green-600",
            blue: "bg-blue-100 text-blue-600",
            purple: "bg-purple-100 text-purple-600",
            orange: "bg-orange-100 text-orange-600",
          }

          return (
            <Card key={index} className="bg-white rounded-2xl shadow-lg border-2 border-white">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses[metric.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{metric.label}</p>
                    <p className="text-xs font-bold text-gray-900">{metric.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Cash flow analysis table */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-gray-900">Annual Cash Flow Projections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Year</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Annual Cash Flow</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Cumulative Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {formattedCashFlowData.map((row, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-xs font-medium text-gray-900">{row.year}</td>
                    <td className="py-3 px-4 text-right text-xs text-green-600 font-semibold">
                      ${row.cashFlow.toLocaleString('en-US')}
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-gray-900 font-semibold">
                      ${row.cumulative.toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Investment summary and risk assessment grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Investment summary card with calculated metrics */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-900">Investment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600">Initial Investment</p>
                <p className="text-base font-semibold text-gray-900">${initialInvestment.toLocaleString('en-US')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Total Return</p>
                <p className="text-xs font-semibold text-green-600">${totalReturn.toLocaleString('en-US')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Net Profit</p>
                <p className="text-xs font-semibold text-green-600">${netProfit.toLocaleString('en-US')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">ROI</p>
                <p className="text-xs font-semibold text-green-600">{roi}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk assessment card with categorized risk levels */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardHeader>
            <CardTitle className="text-sm font-bold text-gray-900">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {/* Market risk assessment */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Market Risk</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-xs">
                  Medium
                </Badge>
              </div>
              {/* Liquidity risk assessment */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Liquidity Risk</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs">
                  High
                </Badge>
              </div>
              {/* Credit risk assessment */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Credit Risk</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Low
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
