"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"
import { FileX, Building, RefreshCw, CreditCard, ChevronDown, Copy, Trash2, RotateCcw, Edit3 } from "lucide-react"
import { useState } from "react"

/**
 * Basic property interface for component identification
 */
interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

/**
 * Props interface for the CapitalTab component
 * @param property - Selected property for debt analysis
 */
interface DebtAssumptionsTabProps {
  property: Property | null
}

/**
 * Interface for loan card configuration
 * Represents different types of debt instruments
 */
interface LoanCard {
  id: string
  title: string
  icon: React.ReactNode
  nickname: string
  includeInModel: boolean
}

/**
 * CapitalTab Component
 *
 * Main component for managing financing terms, debt assumptions, and loan analysis.
 * Provides comprehensive interface for loan setup, amortization tracking, and lender matching.
 */
export function CapitalTab({ property }: DebtAssumptionsTabProps) {
  const { toast } = useToast()

  /**
   * State for managing multiple loan cards
   * Each card represents a different debt instrument with unique configuration
   */
  const [loanCards, setLoanCards] = useState<LoanCard[]>([
    {
      id: "senior",
      title: "Senior Debt",
      icon: <Building className="w-4 h-4" />,
      nickname: "Primary Loan",
      includeInModel: true,
    },
    {
      id: "refinance",
      title: "Refinance Debt",
      icon: <RefreshCw className="w-4 h-4" />,
      nickname: "Refi Loan",
      includeInModel: false,
    },
    {
      id: "other",
      title: "Other Debt",
      icon: <CreditCard className="w-4 h-4" />,
      nickname: "Mezzanine",
      includeInModel: false,
    },
  ])

  /**
   * State for managing accordion open/closed states
   * Organized by card ID and section name for granular control
   */
  const [openAccordions, setOpenAccordions] = useState<Record<string, Record<string, boolean>>>({})

  /**
   * State for inline cell editing in amortization grid
   * Tracks which cell is currently being edited
   */
  const [editingCell, setEditingCell] = useState<string | null>(null)

  /**
   * Comprehensive amortization schedule data
   * Tracks loan balance, payments, and cash flows over 10-year period
   */
  const [amortizationData, setAmortizationData] = useState<Record<string, Record<string, number>>>({
    "At Close": {
      beginningBalance: 11900000,
      drawdowns: 11900000,
      interestExpense: 0,
      amortization: 0,
      repayments: 0,
      endingBalance: 11900000,
    },
    "Year 1": {
      beginningBalance: 11900000,
      drawdowns: 0,
      interestExpense: 505750,
      amortization: 119000,
      repayments: 624750,
      endingBalance: 11781000,
    },
    "Year 2": {
      beginningBalance: 11781000,
      drawdowns: 0,
      interestExpense: 500693,
      amortization: 124057,
      repayments: 624750,
      endingBalance: 11656943,
    },
    "Year 3": {
      beginningBalance: 11656943,
      drawdowns: 0,
      interestExpense: 495420,
      amortization: 129330,
      repayments: 624750,
      endingBalance: 11527613,
    },
    "Year 4": {
      beginningBalance: 11527613,
      drawdowns: 0,
      interestExpense: 489924,
      amortization: 134826,
      repayments: 624750,
      endingBalance: 11392787,
    },
    "Year 5": {
      beginningBalance: 11392787,
      drawdowns: 0,
      interestExpense: 484193,
      amortization: 140557,
      repayments: 624750,
      endingBalance: 11252230,
    },
    "Year 6": {
      beginningBalance: 11252230,
      drawdowns: 0,
      interestExpense: 478220,
      amortization: 146530,
      repayments: 624750,
      endingBalance: 11105700,
    },
    "Year 7": {
      beginningBalance: 11105700,
      drawdowns: 0,
      interestExpense: 471992,
      amortization: 152758,
      repayments: 624750,
      endingBalance: 10952942,
    },
    "Year 8": {
      beginningBalance: 10952942,
      drawdowns: 0,
      interestExpense: 465500,
      amortization: 159250,
      repayments: 624750,
      endingBalance: 10793692,
    },
    "Year 9": {
      beginningBalance: 10793692,
      drawdowns: 0,
      interestExpense: 458732,
      amortization: 166018,
      repayments: 624750,
      endingBalance: 10627674,
    },
    "Year 10": {
      beginningBalance: 10627674,
      drawdowns: 0,
      interestExpense: 451676,
      amortization: 173074,
      repayments: 624750,
      endingBalance: 10454600,
    },
  })

  /**
   * State for mobile view period selection
   * Allows users to view specific periods on smaller screens
   */
  const [selectedPeriod, setSelectedPeriod] = useState("At Close")
  const [isMobile, setIsMobile] = useState(false)

  /**
   * Toggle accordion section open/closed state
   * @param cardId - ID of the loan card
   * @param section - Name of the accordion section
   */
  const toggleAccordion = (cardId: string, section: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        [section]: !prev[cardId]?.[section],
      },
    }))
  }

  /**
   * Update loan card properties
   * @param id - Loan card ID to update
   * @param updates - Partial updates to apply
   */
  const updateLoanCard = (id: string, updates: Partial<LoanCard>) => {
    setLoanCards((prev) => prev.map((card) => (card.id === id ? { ...card, ...updates } : card)))
  }

  /**
   * Handle inline cell editing in amortization grid
   * @param period - Time period being edited
   * @param field - Data field being modified
   * @param value - New value to set
   */
  const handleCellEdit = (period: string, field: string, value: string) => {
    const numValue = Number.parseFloat(value.replace(/[$,]/g, "")) || 0
    setAmortizationData((prev) => ({
      ...prev,
      [period]: {
        ...prev[period],
        [field]: numValue,
      },
    }))
  }

  /**
   * Format numeric values as currency
   * @param value - Numeric value to format
   * @returns Formatted currency string
   */
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Show placeholder when no property is selected
  if (!property) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileX className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">Financing Terms</h2>
        <p className="text-sm text-gray-600">Select a property to view debt assumptions and analysis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Section */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileX className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-gray-900">Financing Terms</CardTitle>
              <p className="text-xs sm:text-sm text-gray-600">Loan details, lender terms, and financing assumptions.</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Metrics Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Loan Amount Tile */}
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Building className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Total Loan Amount</p>
                <p className="text-sm font-bold text-gray-900">$11,900,000</p>
                <p className="text-xs text-gray-500">Primary</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-gray-200 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Weighted Avg Interest Rate</p>
                <p className="text-sm font-bold text-gray-900">4.25%</p>
                <p className="text-xs text-gray-500">Annual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-gray-300 rounded-lg">
                <RefreshCw className="w-5 h-5 text-gray-800" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Weighted Avg Term</p>
                <p className="text-sm font-bold text-gray-900">10 Years</p>
                <p className="text-xs text-gray-500">Maturity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileX className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Total Financing Costs</p>
                <p className="text-sm font-bold text-gray-900">$144,000</p>
                <p className="text-xs text-gray-500">At Close</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="p-2 bg-gray-200 rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600">Next 12M Interest</p>
                <p className="text-sm font-bold text-gray-900">$505,750</p>
                <p className="text-xs text-gray-500">Year 1</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Cards Section */}
      <div className="space-y-4 sm:space-y-6">
        {loanCards.map((loanCard) => (
          <Card key={loanCard.id} className="bg-white rounded-2xl shadow-lg border-2 border-white">
            {/* Loan Card Header */}
            <CardHeader className="p-4 sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">{loanCard.icon}</div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">{loanCard.title}</h3>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={loanCard.includeInModel}
                        onCheckedChange={(checked) => updateLoanCard(loanCard.id, { includeInModel: checked })}
                      />
                      <Label className="text-xs text-gray-600">Include in Model</Label>
                    </div>
                  </div>
                </div>
                {/* Loan Card Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    value={loanCard.nickname}
                    onChange={(e) => updateLoanCard(loanCard.id, { nickname: e.target.value })}
                    className="w-full sm:w-32 h-10 sm:h-8 text-sm sm:text-xs"
                    placeholder="Loan nickname"
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-10 w-10 sm:h-8 sm:w-8 p-0 bg-transparent">
                      <Copy className="w-4 h-4 sm:w-3 sm:h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-10 w-10 sm:h-8 sm:w-8 p-0 bg-transparent">
                      <RotateCcw className="w-4 h-4 sm:w-3 sm:h-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="h-10 w-10 sm:h-8 sm:w-8 p-0 bg-transparent">
                      <Trash2 className="w-4 h-4 sm:w-3 sm:h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Loan Card Content with Collapsible Sections */}
            <CardContent className="space-y-4 p-4 sm:p-6">
              {/* Loan Setup Accordion */}
              <Collapsible
                open={openAccordions[loanCard.id]?.setup}
                onOpenChange={() => toggleAccordion(loanCard.id, "setup")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Loan Setup</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Loan setup form fields */}
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Origination Month</Label>
                      <Select>
                        <SelectTrigger className="h-10 sm:h-8 text-sm sm:text-xs">
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jan">January</SelectItem>
                          <SelectItem value="feb">February</SelectItem>
                          <SelectItem value="mar">March</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Loan Term (months)</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="120" inputMode="numeric" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Amortization Period (years)</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="30" inputMode="numeric" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Interest-Only Period (months)</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="12" inputMode="numeric" />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Sizing Limits Accordion */}
              <Collapsible
                open={openAccordions[loanCard.id]?.sizing}
                onOpenChange={() => toggleAccordion(loanCard.id, "sizing")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Sizing Limits</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">LTV Limit (%)</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="75.0" inputMode="numeric" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">DSCR Limit (x)</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="1.25" inputMode="numeric" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Cap Rate (%)</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="5.5" inputMode="numeric" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Min DSCR Month</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="Month 24" disabled />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Amount & Fees Accordion */}
              <Collapsible
                open={openAccordions[loanCard.id]?.amount}
                onOpenChange={() => toggleAccordion(loanCard.id, "amount")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Amount & Fees</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Loan Amount</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="$11,900,000" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Points (%)</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="1.0" inputMode="numeric" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Other Closing Costs</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="$25,000" inputMode="numeric" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold text-gray-600">Total Financing Costs</Label>
                      <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="$144,000" disabled />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Timing & Status Accordion */}
              <Collapsible
                open={openAccordions[loanCard.id]?.timing}
                onOpenChange={() => toggleAccordion(loanCard.id, "timing")}
              >
                <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Timing & Status</span>
                  <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Period</th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Draws</th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Repayments</th>
                          <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {["At Close", "Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7", "Y8", "Y9", "Y10"].map((period) => (
                          <tr key={period} className="border-b border-gray-100">
                            <td className="py-2 px-2 text-xs text-gray-900 font-medium">{period}</td>
                            <td className="py-2 px-2">
                              <Input className="h-6 text-xs" placeholder="$0" />
                            </td>
                            <td className="py-2 px-2">
                              <Input className="h-6 text-xs" placeholder="$0" />
                            </td>
                            <td className="py-2 px-2">
                              <Input className="h-6 text-xs" placeholder="Notes..." />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              {/* Notes Section */}
              <div>
                <Label className="text-xs font-semibold text-gray-600">Notes</Label>
                <Textarea
                  className="mt-1 text-sm sm:text-xs min-h-[80px]"
                  placeholder="Add notes about this loan..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Amortization Grid Section */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-gray-900">Amortization Grid</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {/* Mobile View - Stacked with Period Selector */}
          <div className="block sm:hidden">
            <div className="mb-4">
              <Label className="text-xs font-semibold text-gray-600">Select Period</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(amortizationData).map((period) => (
                    <SelectItem key={period} value={period}>
                      {period}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mobile Period Data Display */}
            <div className="space-y-3">
              {Object.entries(amortizationData[selectedPeriod] || {}).map(([field, value]) => {
                const fieldLabels: Record<string, string> = {
                  beginningBalance: "Beginning Balance",
                  drawdowns: "Drawdowns",
                  interestExpense: "Interest Expense",
                  amortization: "Amortization",
                  repayments: "Repayments",
                  endingBalance: "Ending Balance",
                }

                return (
                  <div key={field} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{fieldLabels[field]}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${value < 0 ? "text-red-600" : "text-gray-900"}`}>
                        {formatCurrency(value)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setEditingCell(`${selectedPeriod}-${field}`)}
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desktop View - Full Amortization Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Period
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Beginning Balance
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Drawdowns
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Interest Expense
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Amortization
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900 border-r border-gray-200">
                    Repayments
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-900">Ending Balance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(amortizationData).map(([period, data]) => (
                  <tr key={period} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 border-r border-gray-100">{period}</td>
                    {/* Editable data cells with inline editing functionality */}
                    {(
                      [
                        "beginningBalance",
                        "drawdowns",
                        "interestExpense",
                        "amortization",
                        "repayments",
                        "endingBalance",
                      ] as const
                    ).map((field) => {
                      const cellId = `${period}-${field}`
                      const value = data[field]
                      const isNegative = value < 0
                      const isEditing = editingCell === cellId

                      return (
                        <td
                          key={field}
                          className="py-3 px-4 text-sm text-right border-r border-gray-100 last:border-r-0 relative group"
                        >
                          {isEditing ? (
                            <Input
                              className="h-8 text-sm text-right"
                              defaultValue={value.toString()}
                              onBlur={(e) => {
                                handleCellEdit(period, field, e.target.value)
                                setEditingCell(null)
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleCellEdit(period, field, e.currentTarget.value)
                                  setEditingCell(null)
                                }
                                if (e.key === "Escape") {
                                  setEditingCell(null)
                                }
                              }}
                              autoFocus
                            />
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <span className={`font-medium ${isNegative ? "text-red-600" : "text-gray-900"}`}>
                                {formatCurrency(value)}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setEditingCell(cellId)}
                              >
                                <Edit3 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Usage Instructions */}
          <div className="mt-4 text-xs text-gray-500">
            <p>• Click the pencil icon to edit any cell</p>
            <p>• Negative balances are highlighted in red</p>
            <p>• Press Enter to save or Escape to cancel</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
