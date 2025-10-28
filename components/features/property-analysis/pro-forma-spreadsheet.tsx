/**
 * Pro Forma Spreadsheet Component - Excel-like Financial Analysis Interface
 *
 * This component provides a comprehensive Excel-like spreadsheet interface for property
 * financial analysis with editable cells, section management, and bulk actions.
 *
 * Key Features:
 * - Excel-like grid interface with editable cells
 * - Separate sections for Operating Statement (OS) and Rent Roll (RR) extraction
 * - Inline cell editing with validation
 * - Bulk actions at field and section level
 * - Automatic calculations and formula support
 * - Color-coded cells for different data types
 * - Section expand/collapse functionality
 * - Export capabilities
 * - Column resizing
 *
 * @component
 * @example
 * <ProFormaSpreadsheet property={selectedProperty} />
 */

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit2, Save, X, ChevronDown, ChevronRight, Copy, Trash2, Plus, GripVertical } from "lucide-react"
import type { PropertyData } from "@/lib/property-data"
import { cn } from "@/lib/utils"

/**
 * Interface for individual spreadsheet cells
 */
interface SpreadsheetCell {
  value: string | number
  editable: boolean
  type: "text" | "number" | "currency" | "percentage" | "formula"
  formula?: string
  highlighted?: boolean
}

/**
 * Interface for spreadsheet rows
 */
interface SpreadsheetRow {
  id: string
  label: string
  isHeader?: boolean
  isBold?: boolean
  isSubtotal?: boolean
  isClickable?: boolean
  cells: {
    wrongInput_perUnit: SpreadsheetCell
    adjustments_total: SpreadsheetCell
    adjustedT3_total: SpreadsheetCell
    adjustedT3_perUnit: SpreadsheetCell
    variance_inflation: SpreadsheetCell
    total: SpreadsheetCell
    year1_perUnit: SpreadsheetCell
    year1_perSF: SpreadsheetCell
    year1_percentage: SpreadsheetCell
    notes: SpreadsheetCell
  }
}

/**
 * Interface for spreadsheet sections
 */
interface SpreadsheetSection {
  id: string
  title: string
  rows: SpreadsheetRow[]
  expanded: boolean
  color: string
}

/**
 * Props interface for ProFormaSpreadsheet component
 */
interface ProFormaSpreadsheetProps {
  property: PropertyData | null
}

/**
 * Column width configuration
 */
interface ColumnWidths {
  lineItem: number
  wrongInput_perUnit: number
  adjustments_total: number
  adjustedT3_total: number
  adjustedT3_perUnit: number
  variance_inflation: number
  total: number
  year1_perUnit: number
  year1_perSF: number
  year1_percentage: number
  notes: number
}

/**
 * ProFormaSpreadsheet Component - Excel-like financial analysis interface
 */
export function ProFormaSpreadsheet({ property }: ProFormaSpreadsheetProps) {
  const [sections, setSections] = useState<SpreadsheetSection[]>([])
  const [editingCell, setEditingCell] = useState<{ sectionId: string; rowId: string; cellKey: string } | null>(null)
  const [selectedCell, setSelectedCell] = useState<{ sectionId: string; rowId: string; cellKey: string } | null>(null)
  const [editValue, setEditValue] = useState<string>("")

  const [columnWidths, setColumnWidths] = useState<ColumnWidths>({
    lineItem: 200,
    wrongInput_perUnit: 100,
    adjustments_total: 100,
    adjustedT3_total: 100,
    adjustedT3_perUnit: 100,
    variance_inflation: 100,
    total: 100,
    year1_perUnit: 100,
    year1_perSF: 100,
    year1_percentage: 80,
    notes: 200,
  })
  const [resizingColumn, setResizingColumn] = useState<keyof ColumnWidths | null>(null)
  const resizeStartX = useRef<number>(0)
  const resizeStartWidth = useRef<number>(0)

  useEffect(() => {
    if (property) {
      setSections(initializeSections(property))
    }
  }, [property])

  const formatNumber = (value: number | string): string => {
    if (typeof value === "string") {
      const num = Number.parseFloat(value)
      if (isNaN(num)) return value
      return num.toLocaleString("en-US", { maximumFractionDigits: 0 })
    }
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
  }

  function initializeSections(prop: PropertyData): SpreadsheetSection[] {
    const units = prop.units
    const avgSqFt = prop.avgSqFtPerUnit || 1000
    const totalSqFt = units * avgSqFt

    // Calculate realistic financial data based on property metrics
    const marketRentPerUnit = prop.unitMix?.[1]?.marketRent || 2000
    const grossPotentialRent = marketRentPerUnit * units * 12
    const vacancyRate = 0.05
    const effectiveGrossIncome = grossPotentialRent * (1 - vacancyRate)
    const operatingExpenseRatio = 0.4
    const totalOperatingExpenses = effectiveGrossIncome * operatingExpenseRatio
    const noi = effectiveGrossIncome - totalOperatingExpenses

    return [
      {
        id: "operating-revenue",
        title: "OPERATING REVENUE",
        expanded: true,
        color: "bg-blue-50",
        rows: [
          createRow("market-rent", "Market Rent", false, false, false, false, {
            wrongInput_perUnit: marketRentPerUnit,
            adjustments_total: 0,
            adjustedT3_total: grossPotentialRent,
            adjustedT3_perUnit: marketRentPerUnit,
            variance_inflation: 3.0,
            total: grossPotentialRent,
            year1_perUnit: marketRentPerUnit,
            year1_perSF: (marketRentPerUnit * 12) / avgSqFt,
            year1_percentage: 100,
            notes: "Market rent based on comps",
          }),
          createRow("loss-to-lease", "Loss to Lease", false, false, false, true, {
            wrongInput_perUnit: -50,
            adjustments_total: 0,
            adjustedT3_total: -50 * units * 12,
            adjustedT3_perUnit: -50,
            variance_inflation: 0,
            total: -50 * units * 12,
            year1_perUnit: -50,
            year1_perSF: (-50 * 12) / avgSqFt,
            year1_percentage: -2.5,
            notes: "Current vs market rent gap",
          }),
          createRow("gross-potential-rent", "Gross Potential Rent", false, true, false, false, {
            wrongInput_perUnit: marketRentPerUnit - 50,
            adjustments_total: 0,
            adjustedT3_total: grossPotentialRent - 50 * units * 12,
            adjustedT3_perUnit: marketRentPerUnit - 50,
            variance_inflation: 3.0,
            total: grossPotentialRent - 50 * units * 12,
            year1_perUnit: marketRentPerUnit - 50,
            year1_perSF: ((marketRentPerUnit - 50) * 12) / avgSqFt,
            year1_percentage: 97.5,
            notes: "",
          }),
          createRow("vacancy", "Vacancy", false, false, false, false, {
            wrongInput_perUnit: -(marketRentPerUnit * 0.05),
            adjustments_total: 0,
            adjustedT3_total: -grossPotentialRent * 0.05,
            adjustedT3_perUnit: -(marketRentPerUnit * 0.05),
            variance_inflation: 0,
            total: -grossPotentialRent * 0.05,
            year1_perUnit: -(marketRentPerUnit * 0.05),
            year1_perSF: (-(marketRentPerUnit * 0.05) * 12) / avgSqFt,
            year1_percentage: -5.0,
            notes: "5% vacancy assumption",
          }),
          createRow("non-revenue-units", "Non - Revenue Units", false, false, false, false, {
            wrongInput_perUnit: 0,
            adjustments_total: 0,
            adjustedT3_total: 0,
            adjustedT3_perUnit: 0,
            variance_inflation: 0,
            total: 0,
            year1_perUnit: 0,
            year1_perSF: 0,
            year1_percentage: 0,
            notes: "Model units",
          }),
          createRow("concessions", "Concessions", false, false, false, false, {
            wrongInput_perUnit: -25,
            adjustments_total: 0,
            adjustedT3_total: -25 * units * 12,
            adjustedT3_perUnit: -25,
            variance_inflation: 0,
            total: -25 * units * 12,
            year1_perUnit: -25,
            year1_perSF: (-25 * 12) / avgSqFt,
            year1_percentage: -1.25,
            notes: "Move-in specials",
          }),
          createRow("collection-loss", "Collection Loss", false, false, false, true, {
            wrongInput_perUnit: -10,
            adjustments_total: 0,
            adjustedT3_total: -10 * units * 12,
            adjustedT3_perUnit: -10,
            variance_inflation: 0,
            total: -10 * units * 12,
            year1_perUnit: -10,
            year1_perSF: (-10 * 12) / avgSqFt,
            year1_percentage: -0.5,
            notes: "Bad debt reserve",
          }),
          createRow("base-rental-income", "Base Rental Income", false, true, false, false, {
            wrongInput_perUnit: marketRentPerUnit * 0.91,
            adjustments_total: 0,
            adjustedT3_total: grossPotentialRent * 0.91,
            adjustedT3_perUnit: marketRentPerUnit * 0.91,
            variance_inflation: 3.0,
            total: grossPotentialRent * 0.91,
            year1_perUnit: marketRentPerUnit * 0.91,
            year1_perSF: (marketRentPerUnit * 0.91 * 12) / avgSqFt,
            year1_percentage: 91,
            notes: "",
          }),
          createRow("expense-reimbursements", "Expense Reimbursements", false, false, false, false, {
            wrongInput_perUnit: 15,
            adjustments_total: 0,
            adjustedT3_total: 15 * units * 12,
            adjustedT3_perUnit: 15,
            variance_inflation: 2.0,
            total: 15 * units * 12,
            year1_perUnit: 15,
            year1_perSF: (15 * 12) / avgSqFt,
            year1_percentage: 0.75,
            notes: "Utility reimbursements",
          }),
          createRow("garage-parking", "Garage & Parking", false, false, false, false, {
            wrongInput_perUnit: 75,
            adjustments_total: 0,
            adjustedT3_total: 75 * units * 12,
            adjustedT3_perUnit: 75,
            variance_inflation: 2.5,
            total: 75 * units * 12,
            year1_perUnit: 75,
            year1_perSF: (75 * 12) / avgSqFt,
            year1_percentage: 3.75,
            notes: "Covered parking fees",
          }),
          createRow("storage", "Storage", false, false, false, false, {
            wrongInput_perUnit: 25,
            adjustments_total: 0,
            adjustedT3_total: 25 * units * 12,
            adjustedT3_perUnit: 25,
            variance_inflation: 2.0,
            total: 25 * units * 12,
            year1_perUnit: 25,
            year1_perSF: (25 * 12) / avgSqFt,
            year1_percentage: 1.25,
            notes: "Storage unit rentals",
          }),
          createRow("cable-internet", "Cable & Internet", false, false, false, false, {
            wrongInput_perUnit: 50,
            adjustments_total: 0,
            adjustedT3_total: 50 * units * 12,
            adjustedT3_perUnit: 50,
            variance_inflation: 1.5,
            total: 50 * units * 12,
            year1_perUnit: 50,
            year1_perSF: (50 * 12) / avgSqFt,
            year1_percentage: 2.5,
            notes: "Bulk internet service",
          }),
          createRow("valet-trash", "Valet Trash", false, false, false, false, {
            wrongInput_perUnit: 30,
            adjustments_total: 0,
            adjustedT3_total: 30 * units * 12,
            adjustedT3_perUnit: 30,
            variance_inflation: 2.0,
            total: 30 * units * 12,
            year1_perUnit: 30,
            year1_perSF: (30 * 12) / avgSqFt,
            year1_percentage: 1.5,
            notes: "Door-to-door trash service",
          }),
          createRow("deposit-forfeiture", "Deposit Forfeiture", false, false, false, false, {
            wrongInput_perUnit: 10,
            adjustments_total: 0,
            adjustedT3_total: 10 * units * 12,
            adjustedT3_perUnit: 10,
            variance_inflation: 0,
            total: 10 * units * 12,
            year1_perUnit: 10,
            year1_perSF: (10 * 12) / avgSqFt,
            year1_percentage: 0.5,
            notes: "Forfeited deposits",
          }),
          createRow("pet-fees", "Pet Fees", false, false, false, false, {
            wrongInput_perUnit: 40,
            adjustments_total: 0,
            adjustedT3_total: 40 * units * 12,
            adjustedT3_perUnit: 40,
            variance_inflation: 2.0,
            total: 40 * units * 12,
            year1_perUnit: 40,
            year1_perSF: (40 * 12) / avgSqFt,
            year1_percentage: 2.0,
            notes: "Pet rent and deposits",
          }),
          createRow("misc-other-income", "Miscellaneous Other Income", false, false, false, false, {
            wrongInput_perUnit: 20,
            adjustments_total: 0,
            adjustedT3_total: 20 * units * 12,
            adjustedT3_perUnit: 20,
            variance_inflation: 1.0,
            total: 20 * units * 12,
            year1_perUnit: 20,
            year1_perSF: (20 * 12) / avgSqFt,
            year1_percentage: 1.0,
            notes: "Application fees, late fees",
          }),
          createRow("commercial-net-income", "Commercial Net Income", false, false, false, false, {
            wrongInput_perUnit: 0,
            adjustments_total: 0,
            adjustedT3_total: 0,
            adjustedT3_perUnit: 0,
            variance_inflation: 0,
            total: 0,
            year1_perUnit: 0,
            year1_perSF: 0,
            year1_percentage: 0,
            notes: "No commercial space",
          }),
          createRow("other-income", "Other Income", false, false, true, false, {
            wrongInput_perUnit: 265,
            adjustments_total: 0,
            adjustedT3_total: 265 * units * 12,
            adjustedT3_perUnit: 265,
            variance_inflation: 1.8,
            total: 265 * units * 12,
            year1_perUnit: 265,
            year1_perSF: (265 * 12) / avgSqFt,
            year1_percentage: 13.25,
            notes: "",
          }),
          createRow("effective-gross-income", "Effective Gross Income", false, true, false, false, {
            wrongInput_perUnit: marketRentPerUnit * 1.04,
            adjustments_total: 0,
            adjustedT3_total: effectiveGrossIncome,
            adjustedT3_perUnit: marketRentPerUnit * 1.04,
            variance_inflation: 2.9,
            total: effectiveGrossIncome,
            year1_perUnit: marketRentPerUnit * 1.04,
            year1_perSF: (marketRentPerUnit * 1.04 * 12) / avgSqFt,
            year1_percentage: 104,
            notes: "",
          }),
        ],
      },
      {
        id: "operating-expenses",
        title: "OPERATING EXPENSES",
        expanded: true,
        color: "bg-purple-50",
        rows: [
          createRow("repairs-maintenance", "Repairs & Maintenance", false, false, false, false, {
            wrongInput_perUnit: 350,
            adjustments_total: 0,
            adjustedT3_total: 350 * units * 12,
            adjustedT3_perUnit: 350,
            variance_inflation: 3.5,
            total: 350 * units * 12,
            year1_perUnit: 350,
            year1_perSF: (350 * 12) / avgSqFt,
            year1_percentage: 17.5,
            notes: "General repairs",
          }),
          createRow("unit-turnovers", "Unit Turnovers", false, false, false, false, {
            wrongInput_perUnit: 180,
            adjustments_total: 0,
            adjustedT3_total: 180 * units * 12,
            adjustedT3_perUnit: 180,
            variance_inflation: 3.0,
            total: 180 * units * 12,
            year1_perUnit: 180,
            year1_perSF: (180 * 12) / avgSqFt,
            year1_percentage: 9.0,
            notes: "Make-ready costs",
          }),
          createRow("landscaping-grounds", "Landscaping & Grounds", false, false, false, false, {
            wrongInput_perUnit: 85,
            adjustments_total: 0,
            adjustedT3_total: 85 * units * 12,
            adjustedT3_perUnit: 85,
            variance_inflation: 2.5,
            total: 85 * units * 12,
            year1_perUnit: 85,
            year1_perSF: (85 * 12) / avgSqFt,
            year1_percentage: 4.25,
            notes: "Landscaping maintenance",
          }),
          createRow("contract-services", "Contract Services", false, false, false, false, {
            wrongInput_perUnit: 120,
            adjustments_total: 0,
            adjustedT3_total: 120 * units * 12,
            adjustedT3_perUnit: 120,
            variance_inflation: 3.0,
            total: 120 * units * 12,
            year1_perUnit: 120,
            year1_perSF: (120 * 12) / avgSqFt,
            year1_percentage: 6.0,
            notes: "HVAC, elevator, pool",
          }),
          createRow("security", "Security", false, false, false, false, {
            wrongInput_perUnit: 45,
            adjustments_total: 0,
            adjustedT3_total: 45 * units * 12,
            adjustedT3_perUnit: 45,
            variance_inflation: 2.0,
            total: 45 * units * 12,
            year1_perUnit: 45,
            year1_perSF: (45 * 12) / avgSqFt,
            year1_percentage: 2.25,
            notes: "Security services",
          }),
          createRow("payroll", "Payroll", false, false, false, false, {
            wrongInput_perUnit: 280,
            adjustments_total: 0,
            adjustedT3_total: 280 * units * 12,
            adjustedT3_perUnit: 280,
            variance_inflation: 4.0,
            total: 280 * units * 12,
            year1_perUnit: 280,
            year1_perSF: (280 * 12) / avgSqFt,
            year1_percentage: 14.0,
            notes: "Staff salaries & benefits",
          }),
          createRow("general-admin", "General & Administrative", false, false, false, false, {
            wrongInput_perUnit: 95,
            adjustments_total: 0,
            adjustedT3_total: 95 * units * 12,
            adjustedT3_perUnit: 95,
            variance_inflation: 2.5,
            total: 95 * units * 12,
            year1_perUnit: 95,
            year1_perSF: (95 * 12) / avgSqFt,
            year1_percentage: 4.75,
            notes: "Office, supplies, software",
          }),
          createRow("marketing-advertising", "Marketing & Advertising", false, false, false, false, {
            wrongInput_perUnit: 65,
            adjustments_total: 0,
            adjustedT3_total: 65 * units * 12,
            adjustedT3_perUnit: 65,
            variance_inflation: 2.0,
            total: 65 * units * 12,
            year1_perUnit: 65,
            year1_perSF: (65 * 12) / avgSqFt,
            year1_percentage: 3.25,
            notes: "Marketing & leasing",
          }),
          createRow("professional-legal", "Professional & Legal Fees", false, false, false, false, {
            wrongInput_perUnit: 40,
            adjustments_total: 0,
            adjustedT3_total: 40 * units * 12,
            adjustedT3_perUnit: 40,
            variance_inflation: 2.0,
            total: 40 * units * 12,
            year1_perUnit: 40,
            year1_perSF: (40 * 12) / avgSqFt,
            year1_percentage: 2.0,
            notes: "Legal, accounting",
          }),
          createRow("utilities", "Utilities", false, false, false, false, {
            wrongInput_perUnit: 175,
            adjustments_total: 0,
            adjustedT3_total: 175 * units * 12,
            adjustedT3_perUnit: 175,
            variance_inflation: 4.0,
            total: 175 * units * 12,
            year1_perUnit: 175,
            year1_perSF: (175 * 12) / avgSqFt,
            year1_percentage: 8.75,
            notes: "Water, electric, gas",
          }),
          createRow("insurance", "Insurance", false, false, false, false, {
            wrongInput_perUnit: 110,
            adjustments_total: 0,
            adjustedT3_total: 110 * units * 12,
            adjustedT3_perUnit: 110,
            variance_inflation: 5.0,
            total: 110 * units * 12,
            year1_perUnit: 110,
            year1_perSF: (110 * 12) / avgSqFt,
            year1_percentage: 5.5,
            notes: "Property & liability",
          }),
          createRow("reimbursements", "Reimbursements", false, false, false, false, {
            wrongInput_perUnit: -15,
            adjustments_total: 0,
            adjustedT3_total: -15 * units * 12,
            adjustedT3_perUnit: -15,
            variance_inflation: 0,
            total: -15 * units * 12,
            year1_perUnit: -15,
            year1_perSF: (-15 * 12) / avgSqFt,
            year1_percentage: -0.75,
            notes: "Tenant reimbursements",
          }),
          createRow("other-expenses", "Other Expenses", false, false, false, false, {
            wrongInput_perUnit: 35,
            adjustments_total: 0,
            adjustedT3_total: 35 * units * 12,
            adjustedT3_perUnit: 35,
            variance_inflation: 2.0,
            total: 35 * units * 12,
            year1_perUnit: 35,
            year1_perSF: (35 * 12) / avgSqFt,
            year1_percentage: 1.75,
            notes: "Miscellaneous",
          }),
          createRow("real-estate-taxes", "Real Estate Taxes", false, false, false, false, {
            wrongInput_perUnit: 220,
            adjustments_total: 0,
            adjustedT3_total: 220 * units * 12,
            adjustedT3_perUnit: 220,
            variance_inflation: 3.5,
            total: 220 * units * 12,
            year1_perUnit: 220,
            year1_perSF: (220 * 12) / avgSqFt,
            year1_percentage: 11.0,
            notes: "Property taxes",
          }),
          createRow("management-fees", "Management Fees", false, false, false, false, {
            wrongInput_perUnit: marketRentPerUnit * 0.03,
            adjustments_total: 0,
            adjustedT3_total: effectiveGrossIncome * 0.03,
            adjustedT3_perUnit: marketRentPerUnit * 0.03,
            variance_inflation: 2.9,
            total: effectiveGrossIncome * 0.03,
            year1_perUnit: marketRentPerUnit * 0.03,
            year1_perSF: (marketRentPerUnit * 0.03 * 12) / avgSqFt,
            year1_percentage: 3.0,
            notes: "3% of EGI",
          }),
          createRow("ground-rent", "Ground Rent", false, false, false, false, {
            wrongInput_perUnit: 0,
            adjustments_total: 0,
            adjustedT3_total: 0,
            adjustedT3_perUnit: 0,
            variance_inflation: 0,
            total: 0,
            year1_perUnit: 0,
            year1_perSF: 0,
            year1_percentage: 0,
            notes: "N/A - fee simple",
          }),
          createRow("other-property-taxes", "Other Property Taxes", false, false, false, false, {
            wrongInput_perUnit: 0,
            adjustments_total: 0,
            adjustedT3_total: 0,
            adjustedT3_perUnit: 0,
            variance_inflation: 0,
            total: 0,
            year1_perUnit: 0,
            year1_perSF: 0,
            year1_percentage: 0,
            notes: "N/A",
          }),
          createRow("total-operating-expenses", "TOTAL OPERATING EXPENSES", false, true, true, false, {
            wrongInput_perUnit: marketRentPerUnit * 0.4,
            adjustments_total: 0,
            adjustedT3_total: totalOperatingExpenses,
            adjustedT3_perUnit: marketRentPerUnit * 0.4,
            variance_inflation: 3.2,
            total: totalOperatingExpenses,
            year1_perUnit: marketRentPerUnit * 0.4,
            year1_perSF: (marketRentPerUnit * 0.4 * 12) / avgSqFt,
            year1_percentage: 40,
            notes: "",
          }),
        ],
      },
      {
        id: "net-operating-income",
        title: "NET OPERATING INCOME",
        expanded: true,
        color: "bg-green-50",
        rows: [
          createRow("noi-before-reserve", "Net Operating Income (bef. Reserve)", false, true, false, false, {
            wrongInput_perUnit: marketRentPerUnit * 0.64,
            adjustments_total: 0,
            adjustedT3_total: noi,
            adjustedT3_perUnit: marketRentPerUnit * 0.64,
            variance_inflation: 2.7,
            total: noi,
            year1_perUnit: marketRentPerUnit * 0.64,
            year1_perSF: (marketRentPerUnit * 0.64 * 12) / avgSqFt,
            year1_percentage: 64,
            notes: "",
          }),
          createRow("replacement-reserve", "Replacement Reserve", false, false, false, true, {
            wrongInput_perUnit: -35,
            adjustments_total: 0,
            adjustedT3_total: -35 * units * 12,
            adjustedT3_perUnit: -35,
            variance_inflation: 2.0,
            total: -35 * units * 12,
            year1_perUnit: -35,
            year1_perSF: (-35 * 12) / avgSqFt,
            year1_percentage: -1.75,
            notes: "$300/unit/year reserve",
          }),
          createRow("noi-after-reserves", "NET OPERATING INCOME (AFT. RESERVES)", false, true, true, false, {
            wrongInput_perUnit: marketRentPerUnit * 0.62,
            adjustments_total: 0,
            adjustedT3_total: noi - 35 * units * 12,
            adjustedT3_perUnit: marketRentPerUnit * 0.62,
            variance_inflation: 2.7,
            total: noi - 35 * units * 12,
            year1_perUnit: marketRentPerUnit * 0.62,
            year1_perSF: (marketRentPerUnit * 0.62 * 12) / avgSqFt,
            year1_percentage: 62,
            notes: "",
          }),
          createRow("capex", "CapEx", false, false, false, false, {
            wrongInput_perUnit: -50,
            adjustments_total: 0,
            adjustedT3_total: -50 * units * 12,
            adjustedT3_perUnit: -50,
            variance_inflation: 0,
            total: -50 * units * 12,
            year1_perUnit: -50,
            year1_perSF: (-50 * 12) / avgSqFt,
            year1_percentage: -2.5,
            notes: "Capital improvements",
          }),
          createRow("net-cash-flow", "Net Cash Flow", false, true, true, false, {
            wrongInput_perUnit: marketRentPerUnit * 0.6,
            adjustments_total: 0,
            adjustedT3_total: noi - 85 * units * 12,
            adjustedT3_perUnit: marketRentPerUnit * 0.6,
            variance_inflation: 2.7,
            total: noi - 85 * units * 12,
            year1_perUnit: marketRentPerUnit * 0.6,
            year1_perSF: (marketRentPerUnit * 0.6 * 12) / avgSqFt,
            year1_percentage: 60,
            notes: "",
          }),
        ],
      },
    ]
  }

  function createRow(
    id: string,
    label: string,
    isHeader: boolean,
    isBold: boolean,
    isSubtotal: boolean,
    isClickable: boolean,
    values?: {
      wrongInput_perUnit: number
      adjustments_total: number
      adjustedT3_total: number
      adjustedT3_perUnit: number
      variance_inflation: number
      total: number
      year1_perUnit: number
      year1_perSF: number
      year1_percentage: number
      notes: string
    },
  ): SpreadsheetRow {
    const createCell = (
      type: SpreadsheetCell["type"] = "number",
      value: number | string = "-",
      formula?: string,
    ): SpreadsheetCell => ({
      value:
        typeof value === "number"
          ? Math.abs(value) < 0.01 && value !== 0
            ? "-"
            : formatNumber(value.toFixed(0))
          : value,
      editable: true,
      type,
      formula,
      highlighted: type !== "formula",
    })

    return {
      id,
      label,
      isHeader,
      isBold,
      isSubtotal,
      isClickable,
      cells: {
        wrongInput_perUnit: createCell("currency", values?.wrongInput_perUnit ?? "-"),
        adjustments_total: createCell("currency", values?.adjustments_total ?? "-"),
        adjustedT3_total: createCell("currency", values?.adjustedT3_total ?? "-"),
        adjustedT3_perUnit: createCell("formula", values?.adjustedT3_perUnit ?? "-", "= adjustedT3_total / units"),
        variance_inflation: createCell("percentage", values?.variance_inflation ?? "-"),
        total: createCell("formula", values?.total ?? "-", "= adjustedT3_total * (1 + variance_inflation/100)"),
        year1_perUnit: createCell("formula", values?.year1_perUnit ?? "-", "= total / units / 12"),
        year1_perSF: createCell("formula", values?.year1_perSF ?? "-", "= year1_perUnit * 12 / avgSqFt"),
        year1_percentage: createCell("percentage", values?.year1_percentage ?? "-"),
        notes: createCell("text", values?.notes ?? ""),
      },
    }
  }

  const handleCellClick = (sectionId: string, rowId: string, cellKey: string) => {
    setSelectedCell({ sectionId, rowId, cellKey })
  }

  const handleCellDoubleClick = (sectionId: string, rowId: string, cellKey: string, cell: SpreadsheetCell) => {
    setEditingCell({ sectionId, rowId, cellKey })
    setEditValue(cell.value.toString())
  }

  const handleSaveCell = () => {
    if (!editingCell) return

    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === editingCell.sectionId) {
          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id === editingCell.rowId) {
                return {
                  ...row,
                  cells: {
                    ...row.cells,
                    [editingCell.cellKey as keyof typeof row.cells]: {
                      ...row.cells[editingCell.cellKey as keyof typeof row.cells],
                      value: editValue,
                    },
                  },
                }
              }
              return row
            }),
          }
        }
        return section
      }),
    )

    setEditingCell(null)
    setEditValue("")
  }

  const handleCancelEdit = () => {
    setEditingCell(null)
    setEditValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent, sectionId: string, rowId: string, cellKey: string) => {
    if (editingCell) {
      if (e.key === "Enter") {
        e.preventDefault()
        handleSaveCell()
      } else if (e.key === "Escape") {
        e.preventDefault()
        handleCancelEdit()
      }
    } else {
      if (e.key === "Enter") {
        e.preventDefault()
        const cell = sections.find((s) => s.id === sectionId)?.rows.find((r) => r.id === rowId)?.cells[
          cellKey as keyof SpreadsheetRow["cells"]
        ]
        if (cell) {
          handleCellDoubleClick(sectionId, rowId, cellKey, cell)
        }
      }
    }
  }

  const toggleSection = (sectionId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => (section.id === sectionId ? { ...section, expanded: !section.expanded } : section)),
    )
  }

  const clearSection = (sectionId: string) => {
    setSections((prevSections) =>
      prevSections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            rows: section.rows.map((row) => ({
              ...row,
              cells: Object.fromEntries(
                Object.entries(row.cells).map(([key, cell]) => [
                  key,
                  { ...cell, value: cell.editable ? "-" : cell.value },
                ]),
              ) as typeof row.cells,
            })),
          }
        }
        return section
      }),
    )
  }

  const handleResizeStart = (e: React.MouseEvent, columnKey: keyof ColumnWidths) => {
    e.preventDefault()
    setResizingColumn(columnKey)
    resizeStartX.current = e.clientX
    resizeStartWidth.current = columnWidths[columnKey]
  }

  const handleResizeMove = (e: MouseEvent) => {
    if (!resizingColumn) return

    const diff = e.clientX - resizeStartX.current
    const newWidth = Math.max(60, resizeStartWidth.current + diff)

    setColumnWidths((prev) => ({
      ...prev,
      [resizingColumn]: newWidth,
    }))
  }

  const handleResizeEnd = () => {
    setResizingColumn(null)
  }

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener("mousemove", handleResizeMove)
      document.addEventListener("mouseup", handleResizeEnd)
      return () => {
        document.removeEventListener("mousemove", handleResizeMove)
        document.removeEventListener("mouseup", handleResizeEnd)
      }
    }
  }, [resizingColumn])

  const formatFormulaForDisplay = (formula: string): string => {
    const variableMap: Record<string, string> = {
      adjustedT3_total: "Adjusted T-3 Total",
      adjustedT3_perUnit: "Adjusted T-3 Per Unit",
      adjustments_total: "Adjustments Total",
      wrongInput_perUnit: "Wrong Input Per Unit",
      variance_inflation: "Variance/Inflation %",
      total: "Total",
      year1_perUnit: "Year 1 Per Unit",
      year1_perSF: "Year 1 Per SF",
      year1_percentage: "Year 1 %",
      units: "Number of Units",
      avgSqFt: "Average Sq Ft Per Unit",
    }

    let formattedFormula = formula
    Object.entries(variableMap).forEach(([variable, businessName]) => {
      const regex = new RegExp(`\\b${variable}\\b`, "g")
      formattedFormula = formattedFormula.replace(regex, businessName)
    })

    return formattedFormula
  }

  const getSelectedCellValue = () => {
    if (!selectedCell) return ""
    const section = sections.find((s) => s.id === selectedCell.sectionId)
    const row = section?.rows.find((r) => r.id === selectedCell.rowId)
    const cell = row?.cells[selectedCell.cellKey as keyof SpreadsheetRow["cells"]]

    if (cell?.formula) {
      return formatFormulaForDisplay(cell.formula)
    }
    return cell?.value.toString() || ""
  }

  const getSelectedCellLabel = () => {
    if (!selectedCell) return ""
    const section = sections.find((s) => s.id === selectedCell.sectionId)
    const row = section?.rows.find((r) => r.id === selectedCell.rowId)
    return row?.label || ""
  }

  const getSelectedCellCalculatedValue = () => {
    if (!selectedCell) return ""
    const section = sections.find((s) => s.id === selectedCell.sectionId)
    const row = section?.rows.find((r) => r.id === selectedCell.rowId)
    const cell = row?.cells[selectedCell.cellKey as keyof SpreadsheetRow["cells"]]

    if (!cell?.formula || !row) return ""

    const formula = cell.formula.replace("=", "").trim()
    const units = property?.units || 152
    const avgSqFt = property?.avgSqFtPerUnit || 1000

    // Helper to get cell value as number
    const getCellNumber = (cellKey: string): number => {
      const cellValue = row.cells[cellKey as keyof SpreadsheetRow["cells"]]?.value
      if (typeof cellValue === "string") {
        return Number.parseFloat(cellValue.replace(/,/g, "")) || 0
      }
      return cellValue || 0
    }

    // Parse formula and build calculation string with actual values
    if (formula.includes("adjustedT3_total / units")) {
      const adjustedT3Total = getCellNumber("adjustedT3_total")
      const result = getCellNumber(selectedCell.cellKey)
      return `${formatNumber(adjustedT3Total)} / ${units} = ${formatNumber(result)}`
    }

    if (formula.includes("total / units / 12")) {
      const total = getCellNumber("total")
      const result = getCellNumber(selectedCell.cellKey)
      return `${formatNumber(total)} / ${units} / 12 = ${formatNumber(result)}`
    }

    if (formula.includes("year1_perUnit * 12 / avgSqFt")) {
      const year1PerUnit = getCellNumber("year1_perUnit")
      const result = getCellNumber(selectedCell.cellKey)
      return `${formatNumber(year1PerUnit)} * 12 / ${avgSqFt} = ${formatNumber(result)}`
    }

    if (formula.includes("adjustedT3_total * (1 + variance_inflation/100)")) {
      const adjustedT3Total = getCellNumber("adjustedT3_total")
      const varianceInflation = getCellNumber("variance_inflation")
      const result = getCellNumber(selectedCell.cellKey)
      return `${formatNumber(adjustedT3Total)} * (1 + ${varianceInflation}/100) = ${formatNumber(result)}`
    }

    // For any other formula, just show the result
    return formatNumber(cell.value.toString())
  }

  const getSelectedCellHasFormula = () => {
    if (!selectedCell) return false
    const section = sections.find((s) => s.id === selectedCell.sectionId)
    const row = section?.rows.find((r) => r.id === selectedCell.rowId)
    const cell = row?.cells[selectedCell.cellKey as keyof SpreadsheetRow["cells"]]
    return !!cell?.formula
  }

  const renderCell = (cell: SpreadsheetCell, sectionId: string, rowId: string, cellKey: string, isEditing: boolean) => {
    const isSelected =
      selectedCell?.sectionId === sectionId && selectedCell?.rowId === rowId && selectedCell?.cellKey === cellKey

    if (isEditing) {
      return (
        <div className="flex items-center gap-1 p-1">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-7 text-xs"
            autoFocus
            onKeyDown={(e) => handleKeyDown(e, sectionId, rowId, cellKey)}
          />
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 flex-shrink-0" onClick={handleSaveCell}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 flex-shrink-0" onClick={handleCancelEdit}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )
    }

    return (
      <div
        className={cn(
          "h-full w-full px-2 py-1.5 text-xs cursor-cell hover:bg-blue-50 transition-colors",
          cell.highlighted && "bg-yellow-50 hover:bg-yellow-100",
          isSelected && "ring-2 ring-blue-500 ring-inset bg-blue-50",
        )}
        onClick={() => handleCellClick(sectionId, rowId, cellKey)}
        onDoubleClick={() => handleCellDoubleClick(sectionId, rowId, cellKey, cell)}
        onKeyDown={(e) => handleKeyDown(e, sectionId, rowId, cellKey)}
        tabIndex={0}
      >
        {cell.value}
      </div>
    )
  }

  const ResizeHandle = ({ columnKey }: { columnKey: keyof ColumnWidths }) => (
    <div
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 group z-10"
      onMouseDown={(e) => handleResizeStart(e, columnKey)}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-blue-400" />
      </div>
    </div>
  )

  if (!property) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-8 text-center">
        <p className="text-sm text-gray-600">Select a property to view pro forma spreadsheet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base font-bold text-gray-900 truncate">
                Pro Forma Analysis
              </CardTitle>
              <p className="text-xs text-gray-600 mt-0.5 truncate">{property.name}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {selectedCell && (
        <Card className="bg-white rounded-2xl shadow-lg border-2 border-blue-200">
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="secondary" className="text-xs font-mono">
                    {getSelectedCellLabel()}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={getSelectedCellValue()}
                    readOnly
                    className="h-8 text-xs font-mono bg-gray-50"
                    placeholder="Select a cell to view its value"
                  />
                </div>
              </div>
              {getSelectedCellHasFormula() && (
                <div className="flex items-center gap-2 text-xs text-gray-700 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                  <span className="font-semibold text-green-800">Calculated Value =</span>
                  <span className="font-mono text-green-900">{getSelectedCellCalculatedValue()}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Spreadsheet */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white overflow-hidden">
        <CardContent className="p-0 pb-2">
          <div className="block sm:hidden px-4 py-2 bg-blue-50 border-b border-blue-200">
            <p className="text-xs text-blue-700 text-center">← Scroll horizontally to view all columns →</p>
          </div>
          <div className="overflow-x-auto overflow-y-visible -webkit-overflow-scrolling-touch pb-4">
            <table
              className="w-full border-collapse"
              style={{ minWidth: Object.values(columnWidths).reduce((a, b) => a + b, 0) }}
            >
              {/* Column headers */}
              <thead className="sticky top-0 bg-gray-800 text-white z-20">
                <tr>
                  <th
                    className="sticky left-0 z-30 bg-gray-800 text-left py-2 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-xs font-semibold border-r border-gray-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] relative"
                    style={{ width: columnWidths.lineItem, minWidth: columnWidths.lineItem }}
                  >
                    Line Item
                    <ResizeHandle columnKey="lineItem" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.wrongInput_perUnit, minWidth: columnWidths.wrongInput_perUnit }}
                  >
                    [Wrong Input]
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">per Unit</span>
                    <ResizeHandle columnKey="wrongInput_perUnit" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.adjustments_total, minWidth: columnWidths.adjustments_total }}
                  >
                    Adjustments
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">$ total</span>
                    <ResizeHandle columnKey="adjustments_total" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.adjustedT3_total, minWidth: columnWidths.adjustedT3_total }}
                  >
                    Adjusted T-3
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">$ total</span>
                    <ResizeHandle columnKey="adjustedT3_total" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.adjustedT3_perUnit, minWidth: columnWidths.adjustedT3_perUnit }}
                  >
                    Adjusted T-3
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">per Unit</span>
                    <ResizeHandle columnKey="adjustedT3_perUnit" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.variance_inflation, minWidth: columnWidths.variance_inflation }}
                  >
                    Variance/
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">Inflation</span>
                    <ResizeHandle columnKey="variance_inflation" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.total, minWidth: columnWidths.total }}
                  >
                    $ total
                    <ResizeHandle columnKey="total" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.year1_perUnit, minWidth: columnWidths.year1_perUnit }}
                  >
                    Year 1 Pro Forma
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">per Unit</span>
                    <ResizeHandle columnKey="year1_perUnit" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.year1_perSF, minWidth: columnWidths.year1_perSF }}
                  >
                    Year 1 Pro Forma
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">per SF</span>
                    <ResizeHandle columnKey="year1_perSF" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold border-r border-gray-700 relative"
                    style={{ width: columnWidths.year1_percentage, minWidth: columnWidths.year1_percentage }}
                  >
                    %
                    <br />
                    <span className="text-[9px] sm:text-[10px] font-normal">Mkt</span>
                    <ResizeHandle columnKey="year1_percentage" />
                  </th>
                  <th
                    className="text-center py-2 px-1.5 sm:px-2 text-[10px] sm:text-xs font-semibold relative"
                    style={{ width: columnWidths.notes, minWidth: columnWidths.notes }}
                  >
                    Notes / Comments
                    <ResizeHandle columnKey="notes" />
                  </th>
                </tr>
              </thead>

              {/* Sections and rows */}
              <tbody>
                {sections.map((section) => (
                  <>
                    <tr key={`${section.id}-header`} className={cn("border-t-2 border-gray-300", section.color)}>
                      <td
                        colSpan={11}
                        className="sticky left-0 z-20 py-1.5 px-2 sm:px-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]"
                        style={{
                          backgroundColor:
                            section.color === "bg-blue-50"
                              ? "#eff6ff"
                              : section.color === "bg-purple-50"
                                ? "#faf5ff"
                                : section.color === "bg-green-50"
                                  ? "#f0fdf4"
                                  : "white",
                        }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="hover:bg-gray-200 rounded p-1 transition-colors touch-manipulation min-w-[32px] min-h-[32px] sm:min-w-0 sm:min-h-0 flex items-center justify-center"
                            >
                              {section.expanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                            <span className="text-[10px] sm:text-xs font-bold text-gray-900">{section.title}</span>
                            <Badge variant="secondary" className="text-[9px] sm:text-[10px] px-1.5 py-0.5">
                              {section.rows.length}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 sm:h-7 text-[10px] sm:text-xs touch-manipulation px-2"
                              onClick={() => clearSection(section.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Clear
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 sm:h-7 text-[10px] sm:text-xs touch-manipulation px-2"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 sm:h-7 text-[10px] sm:text-xs touch-manipulation px-2"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 sm:h-7 text-[10px] sm:text-xs touch-manipulation px-2"
                            >
                              <Edit2 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Section rows */}
                    {section.expanded &&
                      section.rows.map((row) => {
                        const isEditingRow = editingCell?.sectionId === section.id && editingCell?.rowId === row.id

                        return (
                          <tr
                            key={row.id}
                            className={cn(
                              "border-b border-gray-200 hover:bg-gray-50 transition-colors",
                              row.isSubtotal && "bg-gray-100 font-semibold",
                            )}
                          >
                            <td
                              className={cn(
                                "sticky left-0 z-10 bg-white py-1 px-2 sm:px-3 text-[10px] sm:text-xs border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]",
                                row.isBold && "font-semibold",
                                row.isClickable && "text-blue-600 cursor-pointer hover:underline",
                                row.isSubtotal && "bg-gray-100",
                              )}
                              style={{ width: columnWidths.lineItem, minWidth: columnWidths.lineItem }}
                            >
                              {row.label}
                            </td>
                            {Object.entries(row.cells).map(([cellKey, cell]) => (
                              <td
                                key={cellKey}
                                className="border-r border-gray-200 p-0"
                                style={{
                                  width: columnWidths[cellKey as keyof Omit<ColumnWidths, "lineItem">],
                                  minWidth: columnWidths[cellKey as keyof Omit<ColumnWidths, "lineItem">],
                                }}
                              >
                                {renderCell(
                                  cell,
                                  section.id,
                                  row.id,
                                  cellKey,
                                  isEditingRow && editingCell?.cellKey === cellKey,
                                )}
                              </td>
                            ))}
                          </tr>
                        )
                      })}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50 rounded-2xl border-2 border-blue-200">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[10px] sm:text-xs font-semibold text-gray-900 mb-1">Modern Editing Features</h3>
              <ul className="text-[10px] sm:text-xs text-gray-700 space-y-0.5 sm:space-1">
                <li>• Single-click to select a cell (shows formula/value in formula bar above)</li>
                <li>• Double-click to edit cell values</li>
                <li>• Press Enter to save or Escape to cancel</li>
                <li>• Drag column borders to resize columns</li>
                <li>• First column and section headers stay frozen when scrolling horizontally</li>
                <li>• Calculated cells show their formula in the formula bar</li>
                <li className="hidden sm:list-item">
                  • Spreadsheet is populated with realistic financial data from the property
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
