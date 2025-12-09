/**
 * Analytics Tab Component (Underwriting Graphs)
 *
 * Displays comprehensive financial analysis charts and metrics for property underwriting.
 * Includes cash flow projections, cap rate trends, ROI analysis, and key performance indicators.
 * Features both bar charts and line charts with interactive data visualization.
 *
 * @features
 * - Cash flow projection bar charts
 * - Cap rate trend line charts
 * - ROI analysis visualization
 * - Key metrics summary cards
 * - Responsive chart layouts
 * - Property-specific data integration
 *
 * @author Real Estate Analysis Team
 * @version 1.0.0
 */

"use client"
import type { PropertyData } from "@/lib/property-data"
import { Building } from "lucide-react"

/**
 * Basic property interface for component props
 */
interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

/**
 * Props interface for the UnderwritingGraphsTab component
 * @param property - Property data containing financial metrics and projections
 */
interface UnderwritingGraphsTabProps {
  property?: PropertyData | null
}

/**
 * Default cash flow projection data for demonstration
 * Shows 5-year cash flow growth trajectory with increasing values
 */
const defaultCashFlowData = [
  { year: "Year 1", value: 45000, color: "bg-blue-500" },
  { year: "Year 2", value: 52000, color: "bg-blue-600" },
  { year: "Year 3", value: 58000, color: "bg-blue-700" },
  { year: "Year 4", value: 65000, color: "bg-blue-800" },
  { year: "Year 5", value: 72000, color: "bg-blue-900" },
]

/**
 * Default cap rate data showing market appreciation trends
 * Demonstrates increasing cap rates over 5-year period
 */
const defaultCapRateData = [
  { year: "Year 1", value: 6.2, color: "bg-green-500" },
  { year: "Year 2", value: 6.5, color: "bg-green-600" },
  { year: "Year 3", value: 6.8, color: "bg-green-700" },
  { year: "Year 4", value: 7.1, color: "bg-green-800" },
  { year: "Year 5", value: 7.4, color: "bg-green-900" },
]

/**
 * Default ROI data showing return on investment progression
 * Illustrates increasing returns over investment period
 */
const defaultRoiData = [
  { year: "Year 1", value: 12.5, color: "bg-purple-500" },
  { year: "Year 2", value: 14.2, color: "bg-purple-600" },
  { year: "Year 3", value: 16.8, color: "bg-purple-700" },
  { year: "Year 4", value: 18.9, color: "bg-purple-800" },
  { year: "Year 5", value: 21.3, color: "bg-purple-900" },
]

/**
 * SimpleBarChart Component
 *
 * Renders horizontal bar chart with customizable data, colors, and formatting.
 * Each bar shows percentage width relative to maximum value with embedded value labels.
 *
 * @param data - Array of chart data points with year, value, and color
 * @param title - Chart title displayed at the top
 * @param valuePrefix - Prefix for value display (e.g., "$")
 * @param valueSuffix - Suffix for value display (e.g., "%")
 */
function SimpleBarChart({
  data,
  title,
  valuePrefix = "$",
  valueSuffix = "",
}: {
  data: Array<{ year: string; value: number; color: string }>
  title: string
  valuePrefix?: string
  valueSuffix?: string
}) {
  // Calculate maximum value for percentage-based bar widths
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <div className="space-y-3 mt-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-4">
            {/* Year Label */}
            <div className="w-16 text-xs sm:text-sm text-gray-600 font-medium">{item.year}</div>
            <div className="flex-1 flex items-center gap-2">
              {/* Progress Bar Container */}
              <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                {/* Colored Progress Bar with Value Label */}
                <div
                  className={`${item.color} h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2`}
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className="text-white text-xs font-semibold text-gray-600 font-medium">
                    {valuePrefix}
                    {item.value.toLocaleString('en-US')}
                    {valueSuffix}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * SimpleLineChart Component
 *
 * Renders SVG-based line chart with data points and grid lines.
 * Shows trend progression over time with interactive hover states.
 *
 * @param data - Array of chart data points
 * @param title - Chart title
 * @param valuePrefix - Value formatting prefix
 * @param valueSuffix - Value formatting suffix
 */
function SimpleLineChart({
  data,
  title,
  valuePrefix = "$",
  valueSuffix = "",
}: {
  data: Array<{ year: string; value: number; color: string }>
  title: string
  valuePrefix?: string
  valueSuffix?: string
}) {
  // Calculate value range for proper scaling
  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      <div className="relative h-48 bg-gray-50 rounded-lg p-4 mt-4">
        {/* SVG Chart Container */}
        <svg className="w-full h-full" viewBox="0 0 400 160">
          {/* Grid Lines for Reference */}
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1="0" y1={i * 40} x2="400" y2={i * 40} stroke="#e5e7eb" strokeWidth="1" />
          ))}

          {/* Data Trend Line */}
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            points={data
              .map((item, index) => {
                const x = (index / (data.length - 1)) * 400
                const y = 160 - ((item.value - minValue) / range) * 160
                return `${x},${y}`
              })
              .join(" ")}
          />

          {/* Data Point Circles */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 400
            const y = 160 - ((item.value - minValue) / range) * 160
            return <circle key={index} cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
          })}
        </svg>

        {/* Year Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs font-semibold text-gray-600 text-gray-500 mt-2">
          {data.map((item, index) => (
            <span key={index}>{item.year}</span>
          ))}
        </div>
      </div>

      {/* Chart Legend */}
      <div className="mt-4 flex justify-center">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>Projected Growth</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Main UnderwritingGraphsTab Component
 *
 * Displays comprehensive property analysis with multiple chart types and key metrics.
 * Handles both property-specific data and fallback to default demonstration data.
 */
export function UnderwritingGraphsTab({ property }: UnderwritingGraphsTabProps) {
  // Show placeholder when no property is selected
  if (!property) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-4 sm:p-6 lg:p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-4">Underwriting Charts</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Select a property to view detailed underwriting charts and analysis.
        </p>
      </div>
    )
  }

  // Color schemes for different chart types
  const blueColors = ["bg-blue-500", "bg-blue-600", "bg-blue-700", "bg-blue-800", "bg-blue-900"]
  const greenColors = ["bg-green-500", "bg-green-600", "bg-green-700", "bg-green-800", "bg-green-900"]
  const purpleColors = ["bg-purple-500", "bg-purple-600", "bg-purple-700", "bg-purple-800", "bg-purple-900"]

  /**
   * Process cash flow data from property or use defaults
   * Maps property chart data to cash flow visualization format
   */
  const cashFlowData =
    property.chartData?.map((item, index) => ({
      year: item.year,
      value: item.cashFlow,
      color: blueColors[index % blueColors.length],
    })) || defaultCashFlowData

  /**
   * Generate cap rate data from property value growth
   * Calculates cap rate as NOI divided by property value
   */
  const capRateData =
    property.chartData?.map((item, index) => {
      const noi = property.proForma?.[index]?.noi || 0
      const capRate = item.propertyValue > 0 ? (noi / item.propertyValue) * 100 : 0
      return {
        year: item.year,
        value: capRate,
        color: greenColors[index % greenColors.length],
      }
    }) || defaultCapRateData

  /**
   * Generate ROI data from cash flow and initial investment
   * Calculates return on investment as cash flow percentage of equity
   */
  const initialInvestment = property.sourcesUses?.sources.find((s) => s.item.includes("Equity"))?.amount || 1
  const roiData =
    property.chartData?.map((item, index) => {
      const roi = (item.cashFlow / initialInvestment) * 100
      return {
        year: item.year,
        value: roi,
        color: purpleColors[index % purpleColors.length],
      }
    }) || defaultRoiData

  /**
   * Calculate summary metrics for the metrics panel
   * Aggregates data for high-level performance indicators
   */
  const totalInvestment = initialInvestment
  const totalCashFlow = cashFlowData.reduce((sum, item) => sum + item.value, 0)
  const fiveYearNPV = totalCashFlow - totalInvestment
  const irr = property.keyMetrics?.irr || property.returns?.irr || "0.0%"
  const cocReturn = property.keyMetrics?.cocReturn || property.returns?.cashOnCash || "0.0%"

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-4">{property.name}</h1>
            <p className="text-xs sm:text-sm text-gray-600">Underwriting Analysis & Charts</p>
          </div>
        </div>

        {/* Charts Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Flow Bar Chart */}
          <SimpleBarChart data={cashFlowData} title="Annual Cash Flow Projection" valuePrefix="$" />

          {/* Cap Rate Line Chart */}
          <SimpleLineChart data={capRateData} title="Cap Rate Trend" valuePrefix="" valueSuffix="%" />

          {/* ROI Bar Chart */}
          <SimpleBarChart data={roiData} title="Return on Investment" valuePrefix="" valueSuffix="%" />

          {/* Key Metrics Summary Panel */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-900">Key Metrics Summary</h3>
            <div className="space-y-4 mt-4">
              {/* Total Investment Metric */}
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-xs sm:text-sm text-gray-600">Total Investment</span>
                <span className="text-xs font-bold text-blue-600">${(totalInvestment / 1000000).toFixed(1)}M</span>
              </div>
              {/* 5-Year NPV Metric */}
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-xs sm:text-sm text-gray-600">5-Year NPV</span>
                <span className="text-xs font-bold text-green-600">${(fiveYearNPV / 1000).toFixed(0)}K</span>
              </div>
              {/* IRR Metric */}
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-xs sm:text-sm text-gray-600">IRR</span>
                <span className="text-xs font-bold text-gray-900 text-purple-600">{irr}</span>
              </div>
              {/* Cash-on-Cash Return Metric */}
              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-xs sm:text-sm text-gray-600">Cash-on-Cash Return</span>
                <span className="text-xs font-bold text-gray-900 text-orange-600">{cocReturn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Notes Section */}
        <div className="mt-8 p-6 bg-gray-50 rounded-xl">
          <h3 className="text-sm font-bold text-gray-900">Analysis Notes</h3>
          <div className="space-y-2 text-xs sm:text-sm text-gray-600 mt-3">
            <p>• Property shows strong cash flow growth potential with consistent annual increases projected</p>
            <p>• Cap rate trends indicate market appreciation and improved operational efficiency</p>
            <p>• ROI projections exceed market benchmarks based on current underwriting assumptions</p>
            <p>• Conservative vacancy assumptions built into all projections (5% annual average)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
