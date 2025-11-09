/**
 * Enhanced Pro Forma Tab - Seller OS vs Your Underwriting Comparison
 *
 * This component displays comprehensive pro forma financial analysis for properties,
 * allowing for a side-by-side comparison between the Seller's Operating Statement (OS)
 * and your Underwritten projections. It provides insights into variances, growth assumptions,
 * and projected future performance.
 *
 * Key Features:
 * - Side-by-side comparison: Seller's OS vs Your Underwriting
 * - Variance indicators with color coding (positive for income, negative for expenses)
 * - Dual input modes: Per Unit ⇄ Total for global view
 * - Flexible input types: $ Amount ⇄ % of Revenue for individual line items
 * - Multi-year projections with growth assumptions applied to underwriting
 * - Mobile-responsive design for accessibility on various devices
 * - Interactive editing for underwriting figures
 *
 * @component
 * @example
 * <ProFormaTab property={selectedProperty} />
 */

"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calculator,
  Percent,
  DollarSign,
  Users,
  Download,
  Info,
  Plus,
  Minus,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import type { PropertyData } from "@/lib/property-data"
import { cn } from "@/lib/utils"

interface MonthlyData {
  month: string
  value: number
}

interface LineItemData {
  id: string
  label: string
  category: string
  inPlace: number
  yourUnderwriting: number
  inputMode: InputMode // Kept from original, but not explicitly used in this version's UI
  inputType: InputType
  percentBase?: "EGI" | "PGI" | "NOI"
  isEditable: boolean
  isSubtotal?: boolean
  formula?: string
  growthRate?: number
  monthlyData?: MonthlyData[]
  documentTotal?: number // Total as stated in the document
}

interface CategoryData {
  id: string
  title: string
  items: LineItemData[]
  expanded: boolean
  color: string
}

interface ProFormaTabProps {
  property: PropertyData | null
}

type InputMode = "total" | "perUnit"
type InputType = "dollar" | "percent"

export function ProFormaTab({ property }: ProFormaTabProps) {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [globalInputMode, setGlobalInputMode] = useState<InputMode>("total")
  const [holdPeriod, setHoldPeriod] = useState(5)
  const [showProjections, setShowProjections] = useState(true)
  const [editingCell, setEditingCell] = useState<{ itemId: string; field: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [expandedT12, setExpandedT12] = useState<Set<string>>(new Set())

  const units = property?.units || 100

  useEffect(() => {
    if (property) {
      const data = initializeProFormaData(property)
      setCategories(data)
    }
  }, [property])

  const initializeProFormaData = (prop: PropertyData): CategoryData[] => {
    const units = prop.units || 100
    const marketRent = prop.unitMix?.[1]?.marketRent || 2000

    const generateMonthlyData = (annualTotal: number): MonthlyData[] => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
      return months.map((month) => ({
        month,
        value: annualTotal / 12 + (Math.random() - 0.5) * (annualTotal / 12) * 0.1, // Add some variance
      }))
    }

    return [
      {
        id: "income",
        title: "GROSS POTENTIAL INCOME",
        expanded: true,
        color: "border-green-500",
        items: [
          {
            id: "market-rent",
            label: "Market Rent",
            category: "Rental Income",
            inPlace: marketRent * units * 12,
            yourUnderwriting: marketRent * 1.05 * units * 12,
            inputMode: "perUnit",
            inputType: "dollar",
            isEditable: true,
            growthRate: 3.0,
            monthlyData: generateMonthlyData(marketRent * units * 12),
            documentTotal: marketRent * units * 12,
          },
          {
            id: "loss-to-lease",
            label: "Loss to Lease",
            category: "Rental Income",
            inPlace: -marketRent * units * 12 * 0.02,
            yourUnderwriting: -marketRent * units * 12 * 0.03,
            inputMode: "total",
            inputType: "percent",
            percentBase: "PGI",
            isEditable: true,
            growthRate: 0,
            monthlyData: generateMonthlyData(-marketRent * units * 12 * 0.02),
            documentTotal: -marketRent * units * 12 * 0.02,
          },
          {
            id: "vacancy",
            label: "Vacancy Loss",
            category: "Rental Income",
            inPlace: -marketRent * units * 12 * 0.03,
            yourUnderwriting: -marketRent * units * 12 * 0.05,
            inputMode: "total",
            inputType: "percent",
            percentBase: "PGI",
            isEditable: true,
            growthRate: 0,
            monthlyData: generateMonthlyData(-marketRent * units * 12 * 0.03),
            documentTotal: -marketRent * units * 12 * 0.03,
          },
          {
            id: "concessions",
            label: "Concessions",
            category: "Rental Income",
            inPlace: -marketRent * units * 12 * 0.01,
            yourUnderwriting: -marketRent * units * 12 * 0.02,
            inputMode: "total",
            inputType: "dollar",
            isEditable: true,
            growthRate: 0,
            monthlyData: generateMonthlyData(-marketRent * units * 12 * 0.01),
            documentTotal: -marketRent * units * 12 * 0.01,
          },
          {
            id: "other-income",
            label: "Other Income",
            category: "Other Income",
            inPlace: units * 300 * 12,
            yourUnderwriting: units * 350 * 12,
            inputMode: "perUnit",
            inputType: "dollar",
            isEditable: true,
            growthRate: 2.0,
            monthlyData: generateMonthlyData(units * 300 * 12),
            documentTotal: units * 300 * 12,
          },
          {
            id: "egi",
            label: "EFFECTIVE GROSS INCOME",
            category: "",
            inPlace: marketRent * units * 12 * 0.94 + units * 300 * 12,
            yourUnderwriting: marketRent * 1.05 * units * 12 * 0.95 + units * 350 * 12,
            inputMode: "total",
            inputType: "dollar",
            isEditable: false,
            isSubtotal: true,
            formula: "= Market Rent - Loss to Lease - Vacancy - Concessions + Other Income",
          },
        ],
      },
      {
        id: "expenses",
        title: "OPERATING EXPENSES",
        expanded: true,
        color: "border-red-500",
        items: [
          {
            id: "property-taxes",
            label: "Property Taxes",
            category: "Non-Controllable",
            inPlace: units * 1200,
            yourUnderwriting: units * 1400,
            inputMode: "perUnit",
            inputType: "dollar",
            isEditable: true,
            growthRate: 3.0,
            monthlyData: generateMonthlyData(units * 1200),
            documentTotal: units * 1200,
          },
          {
            id: "insurance",
            label: "Insurance",
            category: "Non-Controllable",
            inPlace: units * 400,
            yourUnderwriting: units * 500,
            inputMode: "perUnit",
            inputType: "dollar",
            isEditable: true,
            growthRate: 5.0,
            monthlyData: generateMonthlyData(units * 400),
            documentTotal: units * 400,
          },
          {
            id: "management-fee",
            label: "Management Fee",
            category: "Controllable",
            inPlace: marketRent * units * 12 * 0.94 * 0.025,
            yourUnderwriting: marketRent * 1.05 * units * 12 * 0.95 * 0.03,
            inputMode: "total",
            inputType: "percent",
            percentBase: "EGI",
            isEditable: true,
            growthRate: 0,
            monthlyData: generateMonthlyData(marketRent * units * 12 * 0.94 * 0.025),
            documentTotal: marketRent * units * 12 * 0.94 * 0.025,
          },
          {
            id: "repairs-maintenance",
            label: "Repairs & Maintenance",
            category: "Controllable",
            inPlace: units * 800,
            yourUnderwriting: units * 900,
            inputMode: "perUnit",
            inputType: "dollar",
            isEditable: true,
            growthRate: 2.5,
            monthlyData: generateMonthlyData(units * 800),
            documentTotal: units * 800,
          },
          {
            id: "utilities",
            label: "Utilities",
            category: "Controllable",
            inPlace: units * 600,
            yourUnderwriting: units * 650,
            inputMode: "perUnit",
            inputType: "dollar",
            isEditable: true,
            growthRate: 3.5,
            monthlyData: generateMonthlyData(units * 600),
            documentTotal: units * 600,
          },
          {
            id: "payroll",
            label: "Payroll",
            category: "Controllable",
            inPlace: units * 500,
            yourUnderwriting: units * 550,
            inputMode: "perUnit",
            inputType: "dollar",
            isEditable: true,
            growthRate: 3.0,
            monthlyData: generateMonthlyData(units * 500),
            documentTotal: units * 500,
          },
          {
            id: "total-expenses",
            label: "TOTAL OPERATING EXPENSES",
            category: "",
            inPlace: units * (1200 + 400 + 800 + 600 + 500) + marketRent * units * 12 * 0.94 * 0.025,
            yourUnderwriting: units * (1400 + 500 + 900 + 650 + 550) + marketRent * 1.05 * units * 12 * 0.95 * 0.03,
            inputMode: "total",
            inputType: "dollar",
            isEditable: false,
            isSubtotal: true,
            formula: "= Sum of all operating expenses",
          },
        ],
      },
      {
        id: "noi",
        title: "NET OPERATING INCOME",
        expanded: true,
        color: "border-blue-500",
        items: [
          {
            id: "noi-value",
            label: "NET OPERATING INCOME",
            category: "",
            inPlace:
              marketRent * units * 12 * 0.94 +
              units * 300 * 12 -
              (units * (1200 + 400 + 800 + 600 + 500) + marketRent * units * 12 * 0.94 * 0.025),
            yourUnderwriting:
              marketRent * 1.05 * units * 12 * 0.95 +
              units * 350 * 12 -
              (units * (1400 + 500 + 900 + 650 + 550) + marketRent * 1.05 * units * 12 * 0.95 * 0.03),
            inputMode: "total",
            inputType: "dollar",
            isEditable: false,
            isSubtotal: true,
            formula: "= Effective Gross Income - Total Operating Expenses",
          },
        ],
      },
    ]
  }

  const toggleCategory = (categoryId: string) => {
    setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat)))
  }

  const formatCurrency = (value: number, compact = false): string => {
    const absValue = Math.abs(value)
    if (compact && absValue >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`
    }
    if (compact && absValue >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`
    }
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
  }

  const formatPerUnit = (value: number, units: number): string => {
    return `$${(value / units).toFixed(0)}/unit`
  }

  const toggleT12 = (itemId: string) => {
    setExpandedT12((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  const calculateMonthlySum = (monthlyData?: MonthlyData[]): number => {
    if (!monthlyData) return 0
    return monthlyData.reduce((sum, month) => sum + month.value, 0)
  }

  const validateTotal = (monthlyData?: MonthlyData[], documentTotal?: number): boolean => {
    if (!monthlyData || documentTotal === undefined) return true
    const calculatedTotal = calculateMonthlySum(monthlyData)
    const tolerance = Math.abs(documentTotal) * 0.01 // 1% tolerance
    return Math.abs(calculatedTotal - documentTotal) <= tolerance
  }

  const calculateVariance = (inPlace: number, yourUnderwriting: number) => {
    if (inPlace === 0) return { dollar: yourUnderwriting, percent: 0 }
    const dollar = yourUnderwriting - inPlace
    const percent = (dollar / Math.abs(inPlace)) * 100
    return { dollar, percent }
  }

  const getVarianceColor = (variance: number, isExpense: boolean) => {
    // For expenses: negative variance (lower) is good (green)
    // For income: positive variance (higher) is good (green)
    if (isExpense) {
      return variance < 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
    } else {
      return variance > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
    }
  }

  const calculateProjection = (baseValue: number, growthRate: number, year: number) => {
    return baseValue * Math.pow(1 + growthRate / 100, year)
  }

  const handleCellEdit = (itemId: string, field: string, value: string) => {
    setEditingCell({ itemId, field })
    setEditValue(value)
  }

  const handleCellSave = () => {
    if (!editingCell) return

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((item) =>
          item.id === editingCell.itemId ? { ...item, [editingCell.field]: Number.parseFloat(editValue) || 0 } : item,
        ),
      })),
    )

    setEditingCell(null)
    setEditValue("")
  }

  if (!property) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-600">Select a property to view pro forma analysis.</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header Card with Controls */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-lg font-bold text-gray-900">Pro Forma Analysis</CardTitle>
                <p className="text-sm text-gray-600 mt-1">Compare In-Place Financials vs Your Underwriting</p>
              </div>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={globalInputMode === "total" ? "default" : "outline"}
                      onClick={() => setGlobalInputMode("total")}
                      className="text-xs"
                    >
                      <DollarSign className="h-3 w-3 mr-1" />
                      Total
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View values as totals</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={globalInputMode === "perUnit" ? "default" : "outline"}
                      onClick={() => setGlobalInputMode("perUnit")}
                      className="text-xs"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Per Unit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View values per unit</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowProjections(!showProjections)}
                      className="text-xs"
                    >
                      <Calculator className="h-3 w-3 mr-1" />
                      {showProjections ? "Hide" : "Show"} Projections
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Toggle multi-year projections</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" variant="outline" className="text-xs bg-transparent">
                      <Download className="h-3 w-3 mr-1" />
                      Export
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export to Excel</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Pro Forma Table */}
        <Card className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[800px]">
                <thead className="sticky top-0 bg-gray-900 text-white z-10">
                  <tr>
                    <th className="sticky left-0 z-20 bg-gray-900 text-left py-3 px-4 text-xs font-semibold border-r border-gray-700 min-w-[200px]">
                      Line Item
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[130px]">
                      <div className="flex flex-col items-end">
                        <span>In-Place</span>
                        <span className="text-[10px] text-gray-400 font-normal">T-12 Actual</span>
                      </div>
                    </th>
                    <th className="text-right py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[130px]">
                      <div className="flex flex-col items-end">
                        <span>Your UW</span>
                        <span className="text-[10px] text-gray-400 font-normal">Adjusted</span>
                      </div>
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[110px]">
                      <div className="flex flex-col items-center">
                        <span>Variance</span>
                        <span className="text-[10px] text-gray-400 font-normal">$ / %</span>
                      </div>
                    </th>
                    {showProjections &&
                      Array.from({ length: holdPeriod }, (_, i) => i + 1).map((year) => (
                        <th
                          key={year}
                          className="text-right py-3 px-3 text-xs font-semibold border-r border-gray-700 w-[110px]"
                        >
                          <div className="flex flex-col items-end">
                            <span>Year {year}</span>
                            <span className="text-[10px] text-gray-400 font-normal">Projected</span>
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category) => (
                    <React.Fragment key={category.id}>
                      {/* Category Header */}
                      <tr className="border-t-2 border-gray-300 bg-gray-50">
                        <td
                          colSpan={4 + (showProjections ? holdPeriod : 0)}
                          className={cn("py-2 px-4 border-l-4", category.color)}
                        >
                          <button
                            onClick={() => toggleCategory(category.id)}
                            className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 transition-colors w-full"
                          >
                            {category.expanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="text-sm font-bold text-gray-900">{category.title}</span>
                          </button>
                        </td>
                      </tr>

                      {/* Category Items */}
                      {category.expanded &&
                        category.items.map((item) => {
                          const variance = calculateVariance(item.inPlace, item.yourUnderwriting)
                          const isExpense = category.id === "expenses"
                          const isIncome = category.id === "income"
                          const isT12Expanded = expandedT12.has(item.id)
                          const hasMonthlyData = item.monthlyData && item.monthlyData.length > 0
                          const isValidated = validateTotal(item.monthlyData, item.documentTotal)
                          const calculatedTotal = calculateMonthlySum(item.monthlyData)

                          return (
                            <React.Fragment key={item.id}>
                              <tr
                                className={cn(
                                  "border-b border-gray-100 hover:bg-gray-50 transition-colors",
                                  item.isSubtotal && "bg-blue-50 font-semibold border-b-2 border-blue-200",
                                )}
                              >
                                {/* Line Item Name */}
                                <td className="sticky left-0 z-10 bg-white py-2 px-4 text-xs border-r border-gray-100">
                                  <div className="flex items-center gap-2">
                                    {hasMonthlyData && !item.isSubtotal && (
                                      <button
                                        onClick={() => toggleT12(item.id)}
                                        className="p-0.5 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                                      >
                                        {isT12Expanded ? (
                                          <Minus className="h-3 w-3 text-gray-600" />
                                        ) : (
                                          <Plus className="h-3 w-3 text-gray-600" />
                                        )}
                                      </button>
                                    )}
                                    <div className="flex flex-col flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className={cn(item.isSubtotal && "font-bold text-sm")}>{item.label}</span>
                                        {item.inputType === "percent" && (
                                          <Badge variant="outline" className="text-[9px] px-1 py-0">
                                            <Percent className="h-2 w-2 mr-0.5" />
                                            {item.percentBase}
                                          </Badge>
                                        )}
                                        {hasMonthlyData && !item.isSubtotal && (
                                          <Tooltip>
                                            <TooltipTrigger>
                                              {isValidated ? (
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                              ) : (
                                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                                              )}
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <div className="text-xs">
                                                <div>Document Total: {formatCurrency(item.documentTotal || 0)}</div>
                                                <div>Calculated Total: {formatCurrency(calculatedTotal)}</div>
                                                <div className="mt-1 font-semibold">
                                                  {isValidated ? "✓ Totals match" : "⚠ Totals differ - check OCR"}
                                                </div>
                                              </div>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                      {item.formula && (
                                        <span className="text-[9px] text-gray-500 italic mt-0.5">{item.formula}</span>
                                      )}
                                      {item.growthRate !== undefined && item.growthRate > 0 && (
                                        <span className="text-[9px] text-blue-600 mt-0.5">
                                          Growth: {item.growthRate}% annually
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                {/* In-Place (formerly Seller's OS) */}
                                <td className="py-2 px-3 text-xs text-right border-r border-gray-100">
                                  <div className="flex flex-col items-end">
                                    <span className={cn(item.inPlace < 0 && "text-red-600")}>
                                      {globalInputMode === "perUnit" && !item.isSubtotal
                                        ? formatPerUnit(item.inPlace, units)
                                        : formatCurrency(item.inPlace)}
                                    </span>
                                    {item.inputType === "percent" && (
                                      <span className="text-[9px] text-gray-500">
                                        {/* This calculation needs a proper base, defaulting to a large number for demonstration */}
                                        {((item.inPlace / (item.inPlace + 1000000)) * 100).toFixed(1)}%
                                      </span>
                                    )}
                                  </div>
                                </td>

                                {/* Your Underwriting */}
                                <td className="py-2 px-3 text-xs text-right border-r border-gray-100">
                                  {editingCell?.itemId === item.id && editingCell?.field === "yourUnderwriting" ? (
                                    <Input
                                      value={editValue}
                                      onChange={(e) => setEditValue(e.target.value)}
                                      onBlur={handleCellSave}
                                      onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
                                      className="h-7 text-xs text-right"
                                      autoFocus
                                    />
                                  ) : (
                                    <div
                                      className="flex flex-col items-end"
                                      onDoubleClick={() =>
                                        item.isEditable &&
                                        handleCellEdit(item.id, "yourUnderwriting", item.yourUnderwriting.toString())
                                      }
                                    >
                                      <span
                                        className={cn(
                                          item.yourUnderwriting < 0 && "text-red-600",
                                          item.isEditable && "cursor-pointer hover:bg-yellow-50 px-1 rounded",
                                        )}
                                      >
                                        {globalInputMode === "perUnit" && !item.isSubtotal
                                          ? formatPerUnit(item.yourUnderwriting, units)
                                          : formatCurrency(item.yourUnderwriting)}
                                      </span>
                                      {item.inputType === "percent" && (
                                        <span className="text-[9px] text-gray-500">
                                          {/* This calculation needs a proper base, defaulting to a large number for demonstration */}
                                          {((item.yourUnderwriting / (item.yourUnderwriting + 1000000)) * 100).toFixed(
                                            1,
                                          )}
                                          %
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>

                                {/* Variance */}
                                <td className="py-2 px-3 text-xs text-center border-r border-gray-100">
                                  <div
                                    className={cn(
                                      "inline-flex flex-col items-center px-2 py-1 rounded",
                                      getVarianceColor(variance.dollar, isExpense),
                                    )}
                                  >
                                    <div className="flex items-center gap-1">
                                      {variance.dollar > 0 ? (
                                        <TrendingUp className="h-3 w-3" />
                                      ) : variance.dollar < 0 ? (
                                        <TrendingDown className="h-3 w-3" />
                                      ) : null}
                                      <span className="font-semibold">
                                        {variance.dollar > 0 && "+"}
                                        {formatCurrency(variance.dollar, true)}
                                      </span>
                                    </div>
                                    <span className="text-[9px]">
                                      {variance.percent > 0 && "+"}
                                      {variance.percent.toFixed(1)}%
                                    </span>
                                  </div>
                                </td>

                                {/* Year Projections */}
                                {showProjections &&
                                  Array.from({ length: holdPeriod }, (_, i) => i + 1).map((year) => {
                                    const projectedValue = calculateProjection(
                                      item.yourUnderwriting,
                                      item.growthRate || 0,
                                      year,
                                    )
                                    return (
                                      <td
                                        key={year}
                                        className="py-2 px-3 text-xs text-right border-r border-gray-100 bg-blue-50/30"
                                      >
                                        <span className={cn(projectedValue < 0 && "text-red-600")}>
                                          {globalInputMode === "perUnit" && !item.isSubtotal
                                            ? formatPerUnit(projectedValue, units)
                                            : formatCurrency(projectedValue)}
                                        </span>
                                      </td>
                                    )
                                  })}
                              </tr>

                              {isT12Expanded && hasMonthlyData && (
                                <tr className="bg-gray-50">
                                  <td
                                    colSpan={4 + (showProjections ? holdPeriod : 0)}
                                    className="py-2 px-4 border-b border-gray-200"
                                  >
                                    <div className="ml-8 p-3 bg-white rounded border border-gray-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs font-semibold text-gray-700">
                                          Trailing 12 Months Breakdown
                                        </h4>
                                        <div className="flex items-center gap-2 text-xs">
                                          <span className="text-gray-600">
                                            Document: {formatCurrency(item.documentTotal || 0)}
                                          </span>
                                          <span className="text-gray-400">|</span>
                                          <span className="text-gray-600">
                                            Calculated: {formatCurrency(calculatedTotal)}
                                          </span>
                                          {isValidated ? (
                                            <CheckCircle className="h-3 w-3 text-green-600 ml-1" />
                                          ) : (
                                            <AlertTriangle className="h-3 w-3 text-amber-600 ml-1" />
                                          )}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-6 gap-2">
                                        {item.monthlyData?.map((month) => (
                                          <div
                                            key={month.month}
                                            className="flex flex-col items-center p-2 bg-gray-50 rounded"
                                          >
                                            <span className="text-[10px] text-gray-500 font-medium">{month.month}</span>
                                            <span className="text-xs font-semibold text-gray-900 mt-1">
                                              {formatCurrency(month.value, true)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          )
                        })}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                <Info className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Pro Forma Tips</h3>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li>
                    • <strong>Double-click</strong> any "Your UW" cell to edit values
                  </li>
                  <li>
                    • Toggle between <strong>Total</strong> and <strong>Per Unit</strong> views
                  </li>
                  <li>
                    • <strong>Green variance</strong> = better than in-place, <strong>Red</strong> = worse
                  </li>
                  <li>
                    • Click <strong>+</strong> icon to expand T-12 monthly breakdown and validate OCR accuracy
                  </li>
                  <li>
                    • <CheckCircle className="h-3 w-3 inline text-green-600" /> = totals match,{" "}
                    <AlertTriangle className="h-3 w-3 inline text-amber-600" /> = check for OCR errors
                  </li>
                  <li>• Projections use growth rates shown under each line item</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
