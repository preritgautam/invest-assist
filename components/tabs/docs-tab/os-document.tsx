"use client"

import { useEffect, useState } from "react"
import {
  Building,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  Calculator,
  PiggyBank,
  Landmark,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OSDocumentProps {
  propertyId?: string
}

// Monthly data interface
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

// Line item interface
interface LineItem {
  id: string
  name: string
  annualAmount: number
  perUnit: number
  notes: string
  isExpanded?: boolean
  isCalculated?: boolean
  hasChildren?: boolean
  hasFormula?: boolean
  formula?: string
  docTotal?: number
  monthlyData?: MonthlyData
  label?: string
  isMajorTotal?: boolean
  children?: LineItem[]
}

// OS Extraction Result interface
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
  documentFilename?: string
  extractedAt?: string
  source?: string
  message?: string
}

// Format currency
function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  const absValue = Math.abs(value)
  const prefix = value < 0 ? "-" : ""
  if (absValue >= 1000000) {
    return `${prefix}$${(absValue / 1000000).toFixed(2)}M`
  }
  if (absValue >= 1000) {
    return `${prefix}$${(absValue / 1000).toFixed(1)}K`
  }
  return `${prefix}$${absValue.toLocaleString()}`
}

// Format number with commas
function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return value.toLocaleString()
}

// Section card component
function SectionCard({
  title,
  icon,
  children,
  className = "",
  headerAction,
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  className?: string
  headerAction?: React.ReactNode
}) {
  return (
    <Card className={`bg-white shadow-sm border border-gray-200 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">{icon}</div>
            {title}
          </CardTitle>
          {headerAction}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// Line item row component
function LineItemRow({
  item,
  depth = 0,
  expanded,
  onToggle,
  showMonthly = false,
}: {
  item: LineItem
  depth?: number
  expanded: Set<string>
  onToggle: (id: string) => void
  showMonthly?: boolean
}) {
  const hasChildren = item.children && item.children.length > 0
  const isExpanded = expanded.has(item.id)
  const isNegative = item.annualAmount < 0
  const isCalculated = item.isCalculated
  const isMajorTotal = item.isMajorTotal

  // Get display name - prefer label over name
  const displayName = item.label || item.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

  return (
    <>
      <tr
        className={cn(
          "border-b border-gray-100 last:border-0 transition-colors",
          isMajorTotal && "bg-gray-50 font-semibold",
          isCalculated && !isMajorTotal && "bg-gray-50/50",
          !hasChildren && !isCalculated && "hover:bg-gray-50"
        )}
      >
        {/* Line Item Name */}
        <td
          className="py-2 px-3"
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              <button
                onClick={() => onToggle(item.id)}
                className="p-0.5 hover:bg-gray-200 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>
            ) : (
              <span className="w-5" />
            )}
            <span
              className={cn(
                "text-sm",
                isMajorTotal ? "font-semibold text-gray-900" : "text-gray-700",
                isCalculated && !isMajorTotal && "italic text-gray-600"
              )}
            >
              {displayName}
            </span>
            {item.hasFormula && (
              <Calculator className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </td>

        {/* Annual Amount */}
        <td className="py-2 px-3 text-right">
          <span
            className={cn(
              "text-sm font-medium",
              isNegative ? "text-red-600" : "text-gray-900",
              isMajorTotal && "font-semibold"
            )}
          >
            {formatCurrency(item.annualAmount)}
          </span>
        </td>

        {/* Per Unit */}
        <td className="py-2 px-3 text-right">
          <span className="text-sm text-gray-600">
            {formatCurrency(item.perUnit)}
          </span>
        </td>

        {/* Doc Total (for validation) */}
        {showMonthly && (
          <td className="py-2 px-3 text-right">
            <span className="text-sm text-gray-500">
              {item.docTotal ? formatCurrency(item.docTotal) : "-"}
            </span>
          </td>
        )}
      </tr>

      {/* Monthly breakdown row */}
      {showMonthly && item.monthlyData && isExpanded && !hasChildren && (
        <tr className="bg-gray-50/30">
          <td colSpan={4} className="py-2 px-3" style={{ paddingLeft: `${32 + depth * 20}px` }}>
            <div className="grid grid-cols-12 gap-1 text-xs">
              {Object.entries(item.monthlyData).map(([month, value]) => (
                <div key={month} className="text-center">
                  <div className="text-gray-400 uppercase">{month}</div>
                  <div className={cn("font-medium", value < 0 ? "text-red-500" : "text-gray-600")}>
                    {formatCurrency(value)}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}

      {/* Render children if expanded */}
      {hasChildren && isExpanded && item.children?.map((child) => (
        <LineItemRow
          key={child.id}
          item={child}
          depth={depth + 1}
          expanded={expanded}
          onToggle={onToggle}
          showMonthly={showMonthly}
        />
      ))}
    </>
  )
}

// Line items table component
function LineItemsTable({
  items,
  title,
  icon,
  colorClass = "text-blue-600 bg-blue-50",
  showMonthly = false,
}: {
  items: LineItem[]
  title: string
  icon: React.ReactNode
  colorClass?: string
  showMonthly?: boolean
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(["income", "operating-expenses", "capital-items", "debt-service"]))

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const expandAll = () => {
    const allIds = new Set<string>()
    const collectIds = (items: LineItem[]) => {
      items.forEach((item) => {
        allIds.add(item.id)
        if (item.children) collectIds(item.children)
      })
    }
    collectIds(items)
    setExpanded(allIds)
  }

  const collapseAll = () => {
    setExpanded(new Set())
  }

  if (!items || items.length === 0) return null

  return (
    <SectionCard
      title={title}
      icon={<span className={colorClass.split(" ")[0]}>{icon}</span>}
      className="overflow-hidden"
      headerAction={
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Expand all"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={collapseAll}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
            title="Collapse all"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      }
    >
      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-2 px-3 font-medium text-gray-600">Line Item</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 w-32">Annual</th>
              <th className="text-right py-2 px-3 font-medium text-gray-600 w-28">Per Unit</th>
              {showMonthly && (
                <th className="text-right py-2 px-3 font-medium text-gray-600 w-28">Doc Total</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <LineItemRow
                key={item.id}
                item={item}
                expanded={expanded}
                onToggle={toggleExpand}
                showMonthly={showMonthly}
              />
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

// Summary card component
function SummaryCard({
  label,
  value,
  icon,
  colorClass,
  trend,
}: {
  label: string
  value: number | null
  icon: React.ReactNode
  colorClass: string
  trend?: "up" | "down"
}) {
  return (
    <div className={cn("rounded-xl p-4 border", colorClass)}>
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg bg-white/80">{icon}</div>
        {trend && (
          <div className={cn("flex items-center text-xs font-medium", trend === "up" ? "text-green-600" : "text-red-600")}>
            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900">{formatCurrency(value)}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </div>
  )
}

export function OSDocument({ propertyId }: OSDocumentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [osData, setOSData] = useState<OSDataResponse | null>(null)
  const [showMonthly, setShowMonthly] = useState(false)

  useEffect(() => {
    if (!propertyId) {
      setOSData(null)
      return
    }

    const fetchOSData = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/properties/${propertyId}/os-data`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch OS data")
        }

        setOSData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load OS data")
      } finally {
        setLoading(false)
      }
    }

    fetchOSData()
  }, [propertyId])

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="flex items-center gap-3 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading Operating Statement data...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Error Loading OS Data</h3>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  // No property selected
  if (!propertyId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Operating Statement</h3>
          <p className="text-sm text-gray-500">Select a property to view T-12 / Operating Statement data</p>
        </div>
      </div>
    )
  }

  // No OS data available
  if (!osData?.hasOSData || !osData.osExtraction) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Operating Statement Data</h3>
          <p className="text-sm text-gray-500 max-w-md">
            {osData?.message || "Upload a T-12 or Operating Statement to extract income, expense, and NOI details."}
          </p>
        </div>
      </div>
    )
  }

  const { osExtraction, documentFilename, extractedAt } = osData
  const { property_info, income_items, expense_items, capital_items, debt_items, summary } = osExtraction

  // Calculate NOI if not provided
  const calculatedNOI = summary.net_operating_income ?? 
    ((summary.effective_gross_income ?? 0) - (summary.total_operating_expenses ?? 0))

  // Calculate cash flow after debt if not provided
  const calculatedCashFlow = summary.cash_flow_after_debt ??
    (calculatedNOI - (summary.total_capital_expenses ?? 0) - (summary.total_debt_service ?? 0))

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto">
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Operating Statement Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Extracted from: {documentFilename || "T-12 Document"}
              {extractedAt && ` on ${new Date(extractedAt).toLocaleDateString()}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showMonthly}
                onChange={(e) => setShowMonthly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Show Doc Totals
            </label>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Extracted
            </Badge>
          </div>
        </div>

        {/* Property Info */}
        {(property_info.property_name || property_info.total_units || property_info.period_start) && (
          <SectionCard title="Property Information" icon={<Building className="w-4 h-4" />}>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {property_info.property_name && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Property Name</div>
                  <div className="text-sm font-medium text-gray-900">{property_info.property_name}</div>
                </div>
              )}
              {property_info.total_units && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Total Units</div>
                  <div className="text-sm font-medium text-gray-900">{formatNumber(property_info.total_units)}</div>
                </div>
              )}
              {property_info.fiscal_year && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Fiscal Year</div>
                  <div className="text-sm font-medium text-gray-900">{property_info.fiscal_year}</div>
                </div>
              )}
              {property_info.period_start && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Period Start</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(property_info.period_start).toLocaleDateString()}
                  </div>
                </div>
              )}
              {property_info.period_end && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">Period End</div>
                  <div className="text-sm font-medium text-gray-900">
                    {new Date(property_info.period_end).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <SummaryCard
            label="Effective Gross Income"
            value={summary.effective_gross_income}
            icon={<TrendingUp className="w-5 h-5 text-green-600" />}
            colorClass="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
            trend="up"
          />
          <SummaryCard
            label="Operating Expenses"
            value={summary.total_operating_expenses}
            icon={<TrendingDown className="w-5 h-5 text-red-600" />}
            colorClass="bg-gradient-to-br from-red-50 to-rose-50 border-red-200"
            trend="down"
          />
          <SummaryCard
            label="Net Operating Income"
            value={calculatedNOI}
            icon={<DollarSign className="w-5 h-5 text-blue-600" />}
            colorClass="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
          />
          <SummaryCard
            label="Capital Expenses"
            value={summary.total_capital_expenses}
            icon={<PiggyBank className="w-5 h-5 text-purple-600" />}
            colorClass="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200"
          />
          <SummaryCard
            label="Debt Service"
            value={summary.total_debt_service}
            icon={<Landmark className="w-5 h-5 text-amber-600" />}
            colorClass="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200"
          />
          <SummaryCard
            label="Cash Flow After Debt"
            value={calculatedCashFlow}
            icon={<CreditCard className="w-5 h-5 text-teal-600" />}
            colorClass="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200"
            trend={calculatedCashFlow && calculatedCashFlow > 0 ? "up" : "down"}
          />
        </div>

        {/* Income Items Table */}
        <LineItemsTable
          items={income_items}
          title="Income"
          icon={<TrendingUp className="w-4 h-4" />}
          colorClass="text-green-600 bg-green-50"
          showMonthly={showMonthly}
        />

        {/* Expense Items Table */}
        <LineItemsTable
          items={expense_items}
          title="Operating Expenses"
          icon={<TrendingDown className="w-4 h-4" />}
          colorClass="text-red-600 bg-red-50"
          showMonthly={showMonthly}
        />

        {/* Capital Items Table */}
        {capital_items && capital_items.length > 0 && (
          <LineItemsTable
            items={capital_items}
            title="Capital Items"
            icon={<PiggyBank className="w-4 h-4" />}
            colorClass="text-purple-600 bg-purple-50"
            showMonthly={showMonthly}
          />
        )}

        {/* Debt Items Table */}
        {debt_items && debt_items.length > 0 && (
          <LineItemsTable
            items={debt_items}
            title="Debt Service"
            icon={<Landmark className="w-4 h-4" />}
            colorClass="text-amber-600 bg-amber-50"
            showMonthly={showMonthly}
          />
        )}

        {/* NOI Summary Card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">
          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-blue-200 text-sm mb-1">Effective Gross Income</div>
                <div className="text-2xl font-bold">{formatCurrency(summary.effective_gross_income)}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-200 text-sm mb-1">(-) Operating Expenses</div>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_operating_expenses)}</div>
              </div>
              <div className="text-center border-l border-r border-blue-400 px-6">
                <div className="text-blue-200 text-sm mb-1">(=) Net Operating Income</div>
                <div className="text-3xl font-bold">{formatCurrency(calculatedNOI)}</div>
              </div>
              <div className="text-center">
                <div className="text-blue-200 text-sm mb-1">Cash Flow After Debt</div>
                <div className="text-2xl font-bold">{formatCurrency(calculatedCashFlow)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
