/**
 * Sources & Uses of Funds Tab Component
 *
 * A comprehensive financial analysis interface for tracking sources and uses of capital
 * in real estate investment transactions. Provides detailed breakdown of funding sources
 * and capital deployment at closing and throughout the hold period.
 *
 * Key Features:
 * - Interactive editable tables for all line items
 * - Real-time percentage calculations and totals
 * - Separate tracking for closing vs. hold period transactions
 * - Visual balance verification between sources and uses
 * - Per-unit calculations for relevant line items
 * - Edit history tracking with visual indicators
 * - Responsive design with mobile-optimized tables
 *
 * Financial Structure:
 * - Sources At Closing: Equity capital, debt financing, refinancing proceeds
 * - Uses At Closing: Purchase price, closing costs, reserves, loan costs
 * - Sources Over Hold: Additional equity, cash flow funding
 * - Uses Over Hold: CapEx, renovations, reserves, distributions
 *
 * @module OutlayTab
 * @requires React
 * @requires lucide-react - Icons for financial categories and actions
 * @requires @/components/ui/card - Card layout components
 * @requires @/components/ui/table - Data table components
 * @requires @/components/ui/button - Interactive buttons
 * @requires @/components/ui/textarea - Notes input
 * @requires @/components/ui/input - Inline editing inputs
 * @requires @/lib/property-data - Property data types
 */

"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  ArrowLeftRight,
  DollarSign,
  PieChart,
  Calculator,
  Building,
  TrendingUp,
  Percent,
  Edit3,
  History,
} from "lucide-react"
import type { PropertyData } from "@/lib/property-data"
import { useState } from "react"

/**
 * Props interface for the OutlayTab component
 * @interface SourcesUsesTabProps
 * @property {PropertyData | null} property - Selected property data or null if none selected
 */
interface SourcesUsesTabProps {
  property: PropertyData | null
}

/**
 * Interface representing a financial line item in sources and uses tables
 * @interface LineItem
 * @property {string} id - Unique line item identifier
 * @property {string} item - Description of the line item
 * @property {number} amount - Dollar amount for this line item
 * @property {number} [perUnit] - Optional per-unit calculation
 * @property {number} percentage - Percentage of total for this category
 * @property {boolean} [isEdited] - Flag indicating if item has been manually edited
 */
interface LineItem {
  id: string
  item: string
  amount: number
  perUnit?: number
  percentage: number
  isEdited?: boolean
}

/**
 * OutlayTab Component
 *
 * Renders a comprehensive sources and uses of funds analysis interface.
 * Provides interactive tables for tracking capital sources and deployment
 * with real-time calculations and balance verification.
 *
 * @param {SourcesUsesTabProps} props - Component props
 * @returns {JSX.Element} Rendered sources and uses analysis interface
 */
export function OutlayTab({ property }: SourcesUsesTabProps) {
  const [sourcesAtClosing, setSourcesAtClosing] = useState<LineItem[]>([
    { id: "1", item: "Equity Capital", amount: 5100000, percentage: 15.0 },
    { id: "2", item: "Sr. Debt", amount: 11900000, percentage: 35.0 },
    { id: "3", item: "Refinance", amount: 0, percentage: 0 },
    { id: "4", item: "Other", amount: 0, percentage: 0 },
    { id: "5", item: "Less: Proceeds Used for Refinancing", amount: 0, percentage: 0 },
    { id: "6", item: "Less: Loan Proceeds Distributed", amount: 0, percentage: 0 },
  ])

  const [usesAtClosing, setUsesAtClosing] = useState<LineItem[]>([
    { id: "1", item: "Purchase Price", amount: 17000000, perUnit: 425000, percentage: 47.0 },
    { id: "2", item: "Closing Costs (excl. financing)", amount: 340000, perUnit: 8500, percentage: 0.9 },
    { id: "3", item: "Reserve for Projected Capital Expenditures", amount: 760000, percentage: 2.1 },
    { id: "4", item: "Loan Closing Costs", amount: 150000, percentage: 0.4 },
    { id: "5", item: "Funding of Reserves", amount: 200000, percentage: 0.6 },
  ])

  const [sourcesOverHold, setSourcesOverHold] = useState<LineItem[]>([
    { id: "1", item: "Equity Capital", amount: 850000, percentage: 5.0 },
    { id: "2", item: "Cash Flow (Funded Through Operations)", amount: 1200000, percentage: 7.0 },
  ])

  const [usesOverHold, setUsesOverHold] = useState<LineItem[]>([
    { id: "1", item: "Other CapEx", amount: 500000, percentage: 2.9 },
    { id: "2", item: "Unit Renovation", amount: 800000, perUnit: 20000, percentage: 4.7 },
    { id: "3", item: "Replacement Reserves (per unit)", amount: 300000, perUnit: 7500, percentage: 1.8 },
    { id: "4", item: "TI/LC (Tenant Improvements / Leasing Commissions)", amount: 200000, percentage: 1.2 },
    { id: "5", item: "Operating Deficit", amount: 150000, percentage: 0.9 },
    { id: "6", item: "Loan Paydown With Equity", amount: 0, percentage: 0 },
    { id: "7", item: "Distributions to Investors", amount: 100000, percentage: 0.6 },
  ])

  const [notes, setNotes] = useState("")
  const [editingCell, setEditingCell] = useState<string | null>(null)

  /**
   * Updates a line item in the specified array with new values
   * Marks the item as edited and triggers re-render
   * @param {LineItem[]} items - Current array of line items
   * @param {React.Dispatch<React.SetStateAction<LineItem[]>>} setItems - State setter function
   * @param {string} id - ID of item to update
   * @param {keyof LineItem} field - Field to update
   * @param {string | number} value - New value for the field
   */
  const updateLineItem = (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    field: keyof LineItem,
    value: string | number,
  ) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value, isEdited: true } : item)))
  }

  /**
   * Formats a number as currency with comma separators
   * @param {number} value - Numeric value to format
   * @returns {string} Formatted currency string
   */
  const formatCurrency = (value: number) => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\\d))/g, ",")
  }

  /**
   * Parses a currency string back to numeric value
   * @param {string} value - Currency string with commas
   * @returns {number} Parsed numeric value
   */
  const parseCurrency = (value: string) => {
    return Number.parseInt(value.replace(/,/g, "")) || 0
  }

  const totalSourcesAtClosing = sourcesAtClosing.reduce((sum, item) => sum + item.amount, 0)
  const totalUsesAtClosing = usesAtClosing.reduce((sum, item) => sum + item.amount, 0)
  const totalSourcesOverHold = sourcesOverHold.reduce((sum, item) => sum + item.amount, 0)
  const totalUsesOverHold = usesOverHold.reduce((sum, item) => sum + item.amount, 0)

  const totalSources = totalSourcesAtClosing + totalSourcesOverHold
  const totalUses = totalUsesAtClosing + totalUsesOverHold
  const netDebtFinancing = sourcesAtClosing.find((s) => s.item.includes("Sr. Debt"))?.amount || 0
  const equityContribution = sourcesAtClosing.find((s) => s.item.includes("Equity"))?.amount || 0
  const cashFlowFunded = sourcesOverHold.find((s) => s.item.includes("Cash Flow"))?.amount || 0

  const isBalanced = Math.abs(totalSources - totalUses) < 1000 // Allow for small rounding differences

  /**
   * Editable Cell Component
   *
   * Provides inline editing functionality for table cells with different data types.
   * Supports text, currency, and number inputs with appropriate formatting.
   *
   * @param {object} props - Component props
   * @param {string | number} props.value - Current cell value
   * @param {"text" | "currency" | "number"} [props.type] - Input type for formatting
   * @param {string} props.cellId - Unique identifier for this cell
   * @param {function} props.onUpdate - Callback function when value changes
   * @returns {JSX.Element} Editable cell component
   */
  const EditableCell = ({
    value,
    type = "text",
    cellId,
    onUpdate,
  }: {
    value: string | number
    type?: "text" | "currency" | "number"
    cellId: string
    onUpdate: (value: string | number) => void
  }) => {
    const isEditing = editingCell === cellId

    if (isEditing) {
      return (
        <Input
          type={type === "currency" || type === "number" ? "text" : "text"}
          value={type === "currency" ? formatCurrency(Number(value)) : value}
          onChange={(e) => {
            const newValue = type === "currency" ? parseCurrency(e.target.value) : e.target.value
            onUpdate(newValue)
          }}
          onBlur={() => setEditingCell(null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === "Escape") {
              setEditingCell(null)
            }
          }}
          className="h-8 text-xs"
          autoFocus
        />
      )
    }

    return (
      <div className="cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => setEditingCell(cellId)}>
        {type === "currency" ? `$${formatCurrency(Number(value))}` : value}
      </div>
    )
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg border-2 sm:border-4 border-white p-4 sm:p-6 lg:p-8 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-sm sm:text-base font-bold text-gray-900 mb-2 sm:mb-4">Sources & Uses</h2>
        <p className="text-xs sm:text-sm text-gray-600">Select a property to view sources and uses breakdown.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">Sources & Uses of Funds</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">
                Funding breakdown and deployment of capital at closing and during the hold period.
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Total Sources</p>
                <p className="text-sm font-bold text-gray-900">${totalSources.toLocaleString('en-US')}</p>
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
                <p className="text-sm font-bold text-gray-900">${totalUses.toLocaleString('en-US')}</p>
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
                <p className="text-sm font-bold text-gray-900">${netDebtFinancing.toLocaleString('en-US')}</p>
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
                <p className="text-sm font-bold text-gray-900">${equityContribution.toLocaleString('en-US')}</p>
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
                <p className="text-sm font-bold text-gray-900">${cashFlowFunded.toLocaleString('en-US')}</p>
                <p className="text-xs text-gray-500">Hold Period</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources and Uses Tables - At Closing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources At Closing Table */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900">Sources At Closing</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Line Item</TableHead>
                    <TableHead className="text-xs font-semibold text-right">$ Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-right">% Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcesAtClosing.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium">
                        <EditableCell
                          value={item.item}
                          cellId={`sources-closing-${item.id}-item`}
                          onUpdate={(value) =>
                            updateLineItem(sourcesAtClosing, setSourcesAtClosing, item.id, "item", value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditableCell
                            value={item.amount}
                            type="currency"
                            cellId={`sources-closing-${item.id}-amount`}
                            onUpdate={(value) =>
                              updateLineItem(sourcesAtClosing, setSourcesAtClosing, item.id, "amount", Number(value))
                            }
                          />
                          {item.isEdited && <Edit3 className="w-3 h-3 text-blue-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {totalSourcesAtClosing > 0 ? ((item.amount / totalSourcesAtClosing) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-gray-200 font-bold">
                    <TableCell className="text-xs font-bold">Total Sources At Closing</TableCell>
                    <TableCell className="text-xs font-bold text-right">
                      ${totalSourcesAtClosing.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-right">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Uses At Closing Table */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-red-600" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900">Uses At Closing</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Line Item</TableHead>
                    <TableHead className="text-xs font-semibold text-right">$ Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-right">$/Unit</TableHead>
                    <TableHead className="text-xs font-semibold text-right">% Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usesAtClosing.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium">
                        <EditableCell
                          value={item.item}
                          cellId={`uses-closing-${item.id}-item`}
                          onUpdate={(value) => updateLineItem(usesAtClosing, setUsesAtClosing, item.id, "item", value)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditableCell
                            value={item.amount}
                            type="currency"
                            cellId={`uses-closing-${item.id}-amount`}
                            onUpdate={(value) =>
                              updateLineItem(usesAtClosing, setUsesAtClosing, item.id, "amount", Number(value))
                            }
                          />
                          {item.isEdited && <Edit3 className="w-3 h-3 text-blue-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.perUnit ? (
                          <EditableCell
                            value={item.perUnit}
                            type="currency"
                            cellId={`uses-closing-${item.id}-perunit`}
                            onUpdate={(value) =>
                              updateLineItem(usesAtClosing, setUsesAtClosing, item.id, "perUnit", Number(value))
                            }
                          />
                        ) : (
                          <span className="text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {totalUsesAtClosing > 0 ? ((item.amount / totalUsesAtClosing) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-gray-200 font-bold">
                    <TableCell className="text-xs font-bold">Total Uses At Closing</TableCell>
                    <TableCell className="text-xs font-bold text-right">
                      ${totalUsesAtClosing.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-right">-</TableCell>
                    <TableCell className="text-xs font-bold text-right">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources and Uses Over Hold Period */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sources Over Hold Period Table */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900">Sources Over Hold Period</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Line Item</TableHead>
                    <TableHead className="text-xs font-semibold text-right">$ Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-right">% Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sourcesOverHold.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium">
                        <EditableCell
                          value={item.item}
                          cellId={`sources-hold-${item.id}-item`}
                          onUpdate={(value) =>
                            updateLineItem(sourcesOverHold, setSourcesOverHold, item.id, "item", value)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditableCell
                            value={item.amount}
                            type="currency"
                            cellId={`sources-hold-${item.id}-amount`}
                            onUpdate={(value) =>
                              updateLineItem(sourcesOverHold, setSourcesOverHold, item.id, "amount", Number(value))
                            }
                          />
                          {item.isEdited && <Edit3 className="w-3 h-3 text-blue-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {totalSourcesOverHold > 0 ? ((item.amount / totalSourcesOverHold) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-gray-200 font-bold">
                    <TableCell className="text-xs font-bold">Total Sources Over Hold Period</TableCell>
                    <TableCell className="text-xs font-bold text-right">
                      ${totalSourcesOverHold.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-right">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Uses Over Hold Period Table */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calculator className="w-5 h-5 text-red-600" />
                </div>
                <CardTitle className="text-sm font-bold text-gray-900">Uses Over Hold Period</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <History className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-semibold">Line Item</TableHead>
                    <TableHead className="text-xs font-semibold text-right">$ Amount</TableHead>
                    <TableHead className="text-xs font-semibold text-right">$/Unit</TableHead>
                    <TableHead className="text-xs font-semibold text-right">% Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usesOverHold.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs font-medium">
                        <EditableCell
                          value={item.item}
                          cellId={`uses-hold-${item.id}-item`}
                          onUpdate={(value) => updateLineItem(usesOverHold, setUsesOverHold, item.id, "item", value)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <EditableCell
                            value={item.amount}
                            type="currency"
                            cellId={`uses-hold-${item.id}-amount`}
                            onUpdate={(value) =>
                              updateLineItem(usesOverHold, setUsesOverHold, item.id, "amount", Number(value))
                            }
                          />
                          {item.isEdited && <Edit3 className="w-3 h-3 text-blue-500" />}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.perUnit ? (
                          <EditableCell
                            value={item.perUnit}
                            type="currency"
                            cellId={`uses-hold-${item.id}-perunit`}
                            onUpdate={(value) =>
                              updateLineItem(usesOverHold, setUsesOverHold, item.id, "perUnit", Number(value))
                            }
                          />
                        ) : (
                          <span className="text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-right">
                        {totalUsesOverHold > 0 ? ((item.amount / totalUsesOverHold) * 100).toFixed(1) : 0}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 border-gray-200 font-bold">
                    <TableCell className="text-xs font-bold">Total Uses Over Hold Period</TableCell>
                    <TableCell className="text-xs font-bold text-right">
                      ${totalUsesOverHold.toLocaleString('en-US')}
                    </TableCell>
                    <TableCell className="text-xs font-bold text-right">-</TableCell>
                    <TableCell className="text-xs font-bold text-right">100.0%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyst Notes Section */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-gray-900">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add analyst comments and notes about the sources and uses assumptions..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-24"
          />
        </CardContent>
      </Card>
    </div>
  )
}
