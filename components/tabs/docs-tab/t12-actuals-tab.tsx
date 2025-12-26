"use client"

import React, { useEffect, useState, useCallback } from "react"
import type { PropertyData } from "@/lib/property-data"
import {
  ChevronDown,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle,
  CheckCircle2,
  Edit3,
  Plus,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button" // Added Button import

// Helper function for loan payment calculation
const calculateMonthlyPayment = (principal: number, annualInterestRate: number, amortizationYears: number): number => {
  const monthlyInterestRate = annualInterestRate / 100 / 12
  const numberOfPayments = amortizationYears * 12

  if (monthlyInterestRate === 0) {
    return principal / numberOfPayments
  }

  const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)
  const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1
  return principal * (numerator / denominator)
}

// Helper function for loan balance calculation
const calculateLoanBalance = (
  principal: number,
  annualInterestRate: number,
  amortizationYears: number,
  remainingYears: number,
): number => {
  const monthlyInterestRate = annualInterestRate / 100 / 12
  const totalNumberOfPayments = amortizationYears * 12
  const paymentsMade = (amortizationYears - remainingYears) * 12
  const numberOfPaymentsRemaining = remainingYears * 12

  if (monthlyInterestRate === 0) {
    return principal * (remainingYears / amortizationYears)
  }

  const monthlyPayment = calculateMonthlyPayment(principal, annualInterestRate, amortizationYears)

  const balance =
    (monthlyPayment * (1 - Math.pow(1 + monthlyInterestRate, numberOfPaymentsRemaining))) / monthlyInterestRate

  return balance
}

interface T12ActualsTabProps {
  property: PropertyData | null
  onValidate?: () => void // Added onValidate prop
  validated?: boolean
  onUnvalidate?: () => void // Added onUnvalidate prop
    propertyId?: string
}

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

interface LineItem {
  id: string
  name: string
  annualAmount: number | null
  perUnit: number | null
  notes: string
  isEditing?: boolean
  isExpanded?: boolean
  showMonthly?: boolean
  monthlyData?: MonthlyData
  docTotal?: number
  children?: LineItem[]
  isCalculated?: boolean // Added for calculated fields
  isMajorTotal?: boolean // Added for major totals like EGI, NOI
  hasFormula?: boolean // Added to indicate if a formula is associated
  formula?: string // Added to store the formula string
  label?: string // Added for text truncation on mobile
  hasChildren?: boolean // Added to explicitly mark items with children
}

interface ValidationItem {
  lineItem: string
  extractedValue: number
  verified: boolean
}

interface NormalizedAssumptions {
  holdPeriod: number // years
  exitCapRate: number // percentage
  rentGrowth: number // annual percentage
  expenseGrowth: number // annual percentage
  vacancyRate: number // percentage
  managementFeeRate: number // percentage of EGI
  replacementReserves: number // per unit per year
  exitCosts: number // percentage of sale price
  // Debt assumptions
  purchasePrice: number
  loanAmount: number
  interestRate: number
  loanTermYears: number
  amortizationYears: number
  // Transaction costs
  acquisitionFee: number // Corrected from acquisitionFeesPct
  dispositionFee: number // Corrected from dispositionFeesPct
  brokerFee: number // Corrected from financingCostsPct, potentially
  closingCosts: number // Corrected from closingCostsPct
  reservesInitial: number
}

interface NormalizedLineItem extends LineItem {
  t12Actual: number
  underwritten: number
  variance: number
  variancePercent: number
  adjustmentReason?: string
}

interface InvestorStructure {
  gpEquityPct: number
  lpEquityPct: number
  preferredReturnPct: number
  hurdle1IRR: number
  promote1GP: number
  promote1LP: number
  hurdle2IRR: number
  promote2GP: number
  promote2LP: number
}

interface ValuationInputs {
  purchasePrice: number
  loanAmount: number
  acquisitionFeesPct: number
  financingCostsPct: number
  closingCostsPct: number
  reservesInitial: number
  reversionCapRate: number
  saleCostsPct: number
  exitYear: number
  interestRate: number
  loanTermYears: number
  amortizationYears: number
}

interface YearlyCashflow {
  year: number
  noi: number
  debtService: number
  cashflowToEquity: number
  dscr: number
  cocReturn: number
}

interface SummaryMetrics {
  unleveredIRR: number
  leveredIRR: number
  equityMultiple: number
  avgCoCReturn: number
  exitValue: number
  netSaleProceeds: number
  minDSCR: number
  avgDSCR: number
  totalEquityDistributions: number
  totalProfit: number
}

// REMOVED: type SubTab = "t12-actuals" | "normalized" | "summary"

export function T12ActualsTab({ property, onValidate, validated = false, onUnvalidate,propertyId }: T12ActualsTabProps) {
  // REMOVED: const [activeSubTab, setActiveSubTab] = useState<SubTab>("t12-actuals")

  console.log("[T12ActualsTab] validated:", propertyId)
  const [showMonthlyColumns, setShowMonthlyColumns] = useState(true)
  const [lineItemColumnWidth, setLineItemColumnWidth] = useState(180)
  const [isResizing, setIsResizing] = useState(false)
  // </CHANGE>
  const [t12DataValidated, setT12DataValidated] = useState(validated)
  const [normalizedValidated, setNormalizedValidated] = useState(false)
  const [acceptedDiscrepancies, setAcceptedDiscrepancies] = useState<Set<string>>(new Set())
  const [mobileSection, setMobileSection] = useState<"income" | "expense" | "noi">("income")
  // </CHANGE>

  useEffect(() => {
    setT12DataValidated(validated)
  }, [validated])

  const [osData, setOSData] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

useEffect(() => {
    if (!propertyId) {
      setOSData(null)
      return
    }


    const fetchOSData = async () => {
      try {
        const response = await fetch(`/api/properties/${propertyId}/os-data`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch OS data")
        }

        setOSData(data)
      } catch (err) {
        console.error(err instanceof Error ? err.message : "Failed to load OS data")
      
      }
    }

    fetchOSData()
  }, [propertyId])

  console.log('osData', osData)

  // Update line items from osData when it's loaded
  useEffect(() => {
    if (!osData || !(osData as any).hasOSData || !(osData as any).osExtraction) {
      return
    }

    const extraction = (osData as any).osExtraction

    // Helper to create empty monthly data
    const emptyMonthlyData = (): MonthlyData => ({
      jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
    })

    // Update income items if available
    if (extraction.income_items && extraction.income_items.length > 0) {
      setIncomeItems(extraction.income_items.map((item: any) => ({
        ...item,
        annualAmount: item.annualAmount ?? 0,
        perUnit: item.perUnit ?? 0,
        notes: item.notes ?? "",
        monthlyData: item.monthlyData ?? emptyMonthlyData(),
        children: item.children?.map((child: any) => ({
          ...child,
          annualAmount: child.annualAmount ?? 0,
          perUnit: child.perUnit ?? 0,
          notes: child.notes ?? "",
          monthlyData: child.monthlyData ?? emptyMonthlyData(),
          children: child.children?.map((grandchild: any) => ({
            ...grandchild,
            annualAmount: grandchild.annualAmount ?? 0,
            perUnit: grandchild.perUnit ?? 0,
            notes: grandchild.notes ?? "",
            monthlyData: grandchild.monthlyData ?? emptyMonthlyData(),
          }))
        }))
      })))
    }

    // Update expense items if available
    if (extraction.expense_items && extraction.expense_items.length > 0) {
      setExpenseItems(extraction.expense_items.map((item: any) => ({
        ...item,
        annualAmount: item.annualAmount ?? 0,
        perUnit: item.perUnit ?? 0,
        notes: item.notes ?? "",
        monthlyData: item.monthlyData ?? emptyMonthlyData(),
        children: item.children?.map((child: any) => ({
          ...child,
          annualAmount: child.annualAmount ?? 0,
          perUnit: child.perUnit ?? 0,
          notes: child.notes ?? "",
          monthlyData: child.monthlyData ?? emptyMonthlyData(),
          children: child.children?.map((grandchild: any) => ({
            ...grandchild,
            annualAmount: grandchild.annualAmount ?? 0,
            perUnit: grandchild.perUnit ?? 0,
            notes: grandchild.notes ?? "",
            monthlyData: grandchild.monthlyData ?? emptyMonthlyData(),
          }))
        }))
      })))
    }

    // Update capital items if available
    if (extraction.capital_items && extraction.capital_items.length > 0) {
      setCapitalItems(extraction.capital_items.map((item: any) => ({
        ...item,
        annualAmount: item.annualAmount ?? 0,
        perUnit: item.perUnit ?? 0,
        notes: item.notes ?? "",
        monthlyData: item.monthlyData ?? emptyMonthlyData(),
        children: item.children?.map((child: any) => ({
          ...child,
          annualAmount: child.annualAmount ?? 0,
          perUnit: child.perUnit ?? 0,
          notes: child.notes ?? "",
          monthlyData: child.monthlyData ?? emptyMonthlyData(),
        }))
      })))
    }

    // Update debt items if available
    if (extraction.debt_items && extraction.debt_items.length > 0) {
      setDebtItems(extraction.debt_items.map((item: any) => ({
        ...item,
        annualAmount: item.annualAmount ?? 0,
        perUnit: item.perUnit ?? 0,
        notes: item.notes ?? "",
        monthlyData: item.monthlyData ?? emptyMonthlyData(),
        children: item.children?.map((child: any) => ({
          ...child,
          annualAmount: child.annualAmount ?? 0,
          perUnit: child.perUnit ?? 0,
          notes: child.notes ?? "",
          monthlyData: child.monthlyData ?? emptyMonthlyData(),
        }))
      })))
    }

    // Update total units if available from property info
    if (extraction.property_info?.total_units) {
      setTotalUnits(extraction.property_info.total_units)
    }
  }, [osData])

  const [normalizedItems, setNormalizedItems] = useState<NormalizedLineItem[]>([])

  // Property inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(5000000)
  // REMOVED: const [unitCount, setUnitCount] = useState<number>(50) // Replaced by totalUnits
  const [totalUnits, setTotalUnits] = useState<number>(50)
  const [yearBuilt, setYearBuilt] = useState<number>(1985)

  // REMOVED: const [isResizing, setIsResizing] = useState(false)

  const [normalizedAssumptions, setNormalizedAssumptions] = useState<NormalizedAssumptions>({
    holdPeriod: 5,
    exitCapRate: 5.5, // Changed from 6.5 to 5.5
    rentGrowth: 3.0,
    expenseGrowth: 2.5,
    vacancyRate: 5.0,
    managementFeeRate: 3.0, // Changed from 5.0 to 3.0
    replacementReserves: 300,
    exitCosts: 2.5,
    // Debt assumptions
    purchasePrice: 5000000,
    loanAmount: 3500000,
    interestRate: 5.5,
    loanTermYears: 10,
    amortizationYears: 30,
    // Transaction costs
    acquisitionFee: 1.0, // Renamed from acquisitionFeesPct
    dispositionFee: 1.0, // Renamed from dispositionFeesPct
    brokerFee: 1.5, // Renamed from financingCostsPct
    closingCosts: 0.5, // Renamed from closingCostsPct
    reservesInitial: 50000,
  })

  // Upload and validation state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [showValidation, setShowValidation] = useState(false)
  const [validationItems, setValidationItems] = useState<ValidationItem[]>([])
  const [incomeCollapsed, setIncomeCollapsed] = useState(false)
  const [expenseCollapsed, setExpenseCollapsed] = useState(false)

  const [valuationInputs, setValuationInputs] = useState<ValuationInputs>({
    purchasePrice: 5000000,
    loanAmount: 3500000,
    acquisitionFeesPct: 1.0,
    financingCostsPct: 1.5,
    closingCostsPct: 0.5,
    reservesInitial: 50000,
    reversionCapRate: 6.5,
    saleCostsPct: 2.5,
    exitYear: 5,
    interestRate: 5.5,
    loanTermYears: 10,
    amortizationYears: 30,
  })

  const [investorStructure, setInvestorStructure] = useState<InvestorStructure>({
    gpEquityPct: 10,
    lpEquityPct: 90,
    preferredReturnPct: 8,
    hurdle1IRR: 12,
    promote1GP: 20,
    promote1LP: 80,
    hurdle2IRR: 18,
    promote2GP: 30,
    promote2LP: 70,
  })

  const [useInvestorStructure, setUseInvestorStructure] = useState(false)

  // Helper function to find an item by ID recursively
  const findItem = (items: LineItem[], id: string): LineItem | undefined => {
    for (const item of items) {
      if (item.id === id) {
        return item
      }
      if (item.children) {
        const found = findItem(item.children, id)
        if (found) {
          return found
        }
      }
    }
    return undefined
  }

  // Default empty structure - will be populated from API via osData
  const emptyMonthlyData: MonthlyData = {
    jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
    jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0
  }

  // Dummy data shown when no OS data is loaded
  const [incomeItems, setIncomeItems] = useState<LineItem[]>([
    {
      id: "income",
      name: "Income",
      annualAmount: 0,
      perUnit: 0,
      notes: "",
      isExpanded: true,
      isCalculated: false,
      hasChildren: true,
      children: [
        {
          id: "rental-income",
          name: "Rental Income",
          annualAmount: 0,
          perUnit: 0,
          notes: "",
          isExpanded: true,
          isCalculated: false,
          hasChildren: true,
          children: [
            {
              id: "rental-income-line",
              name: "RENTAL_INCOME",
              annualAmount: 1200000,
              perUnit: 24000,
              notes: "",
              hasFormula: true,
              formula: "Market Rent × Occupancy",
              docTotal: 1200000,
              monthlyData: {
                jan: 100000, feb: 100000, mar: 100000, apr: 100000,
                may: 100000, jun: 100000, jul: 100000, aug: 100000,
                sep: 100000, oct: 100000, nov: 100000, dec: 100000,
              },
              label: "Rental Income",
            },
            {
              id: "vacancy-loss",
              name: "VACANCY_LOSS",
              annualAmount: -60000,
              perUnit: -1200,
              notes: "",
              hasFormula: true,
              formula: "Rental Income × Vacancy %",
              docTotal: -60000,
              monthlyData: {
                jan: -5000, feb: -5000, mar: -5000, apr: -5000,
                may: -5000, jun: -5000, jul: -5000, aug: -5000,
                sep: -5000, oct: -5000, nov: -5000, dec: -5000,
              },
              label: "Vacancy Loss",
            },
            {
              id: "concessions",
              name: "CONCESSIONS",
              annualAmount: -12000,
              perUnit: -240,
              notes: "",
              hasFormula: true,
              formula: "Concession Amount × Units",
              docTotal: -12000,
              monthlyData: {
                jan: -1000, feb: -1000, mar: -1000, apr: -1000,
                may: -1000, jun: -1000, jul: -1000, aug: -1000,
                sep: -1000, oct: -1000, nov: -1000, dec: -1000,
              },
              label: "Concessions",
            },
            {
              id: "bad-debt",
              name: "BAD_DEBT",
              annualAmount: -6000,
              perUnit: -120,
              notes: "",
              hasFormula: true,
              formula: "Rental Income × Bad Debt %",
              docTotal: -6000,
              monthlyData: {
                jan: -500, feb: -500, mar: -500, apr: -500,
                may: -500, jun: -500, jul: -500, aug: -500,
                sep: -500, oct: -500, nov: -500, dec: -500,
              },
              label: "Bad Debt",
            },
          ],
        },
        {
          id: "net-rental-income",
          name: "NET_RENTAL_INCOME",
          annualAmount: 1122000,
          perUnit: 22440,
          notes: "",
          isCalculated: true,
          hasFormula: true,
          formula: "= RENTAL_INCOME + VACANCY_LOSS + CONCESSIONS + BAD_DEBT",
          label: "Net Rental Income",
        },
        {
          id: "other-income",
          name: "Other Income",
          annualAmount: 0,
          perUnit: 0,
          notes: "",
          isExpanded: true,
          isCalculated: false,
          hasChildren: true,
          children: [
            {
              id: "parking",
              name: "PARKING",
              annualAmount: 24000,
              perUnit: 480,
              notes: "",
              hasFormula: true,
              formula: "Parking Spaces × Rate",
              docTotal: 24000,
              monthlyData: {
                jan: 2000, feb: 2000, mar: 2000, apr: 2000,
                may: 2000, jun: 2000, jul: 2000, aug: 2000,
                sep: 2000, oct: 2000, nov: 2000, dec: 2000,
              },
              label: "Parking",
            },
            {
              id: "rubs",
              name: "RUBS",
              annualAmount: 18000,
              perUnit: 360,
              notes: "",
              hasFormula: true,
              formula: "Utility Billback",
              docTotal: 18000,
              monthlyData: {
                jan: 1500, feb: 1500, mar: 1500, apr: 1500,
                may: 1500, jun: 1500, jul: 1500, aug: 1500,
                sep: 1500, oct: 1500, nov: 1500, dec: 1500,
              },
              label: "RUBS",
            },
            {
              id: "application-fees",
              name: "APPLICATION_FEES",
              annualAmount: 6000,
              perUnit: 120,
              notes: "",
              hasFormula: true,
              formula: "Applications × Fee",
              docTotal: 6000,
              monthlyData: {
                jan: 500, feb: 500, mar: 500, apr: 500,
                may: 500, jun: 500, jul: 500, aug: 500,
                sep: 500, oct: 500, nov: 500, dec: 500,
              },
              label: "Application Fees",
            },
            {
              id: "late-fees",
              name: "LATE_FEES",
              annualAmount: 3600,
              perUnit: 72,
              notes: "",
              hasFormula: true,
              formula: "Late Payments × Fee",
              docTotal: 3600,
              monthlyData: {
                jan: 300, feb: 300, mar: 300, apr: 300,
                may: 300, jun: 300, jul: 300, aug: 300,
                sep: 300, oct: 300, nov: 300, dec: 300,
              },
              label: "Late Fees",
            },
            {
              id: "other-fees",
              name: "OTHER_FEES",
              annualAmount: 9000,
              perUnit: 180,
              notes: "",
              hasFormula: true,
              formula: "Misc Fees",
              docTotal: 9000,
              monthlyData: {
                jan: 750, feb: 750, mar: 750, apr: 750,
                may: 750, jun: 750, jul: 750, aug: 750,
                sep: 750, oct: 750, nov: 750, dec: 750,
              },
              label: "Other Fees",
            },
          ],
        },
        {
          id: "total-other-income",
          name: "TOTAL_OTHER_INCOME",
          annualAmount: 60600,
          perUnit: 1212,
          notes: "",
          isCalculated: true,
          hasFormula: true,
          formula: "= SUM(OTHER_INCOME_CATEGORIES)",
          label: "Total Other Income",
        },
        {
          id: "recoveries",
          name: "Recoveries",
          annualAmount: 0,
          perUnit: 0,
          notes: "",
          isExpanded: true,
          isCalculated: false,
          hasChildren: true,
          children: [
            {
              id: "misc-income",
              name: "MISC_INCOME",
              annualAmount: 12046,
              perUnit: 241,
              notes: "",
              hasFormula: true,
              formula: "Miscellaneous Income",
              docTotal: 12046,
              monthlyData: {
                jan: 1004, feb: 1004, mar: 1004, apr: 1004,
                may: 1004, jun: 1004, jul: 1004, aug: 1004,
                sep: 1004, oct: 1004, nov: 1004, dec: 1004,
              },
              label: "Misc. Income",
            },
          ],
        },
        {
          id: "total-recoveries",
          name: "TOTAL_RECOVERIES",
          annualAmount: 12046,
          perUnit: 241,
          notes: "",
          isCalculated: true,
          hasFormula: true,
          formula: "= SUM(RECOVERY_CATEGORIES)",
          label: "Total Recoveries",
        },
      ],
    },
    {
      id: "effective-gross-income",
      name: "EFFECTIVE_GROSS_INCOME",
      annualAmount: 1194646,
      perUnit: 23893,
      notes: "",
      isCalculated: true,
      isMajorTotal: true,
      hasFormula: true,
      formula: "= NET_RENTAL_INCOME + TOTAL_OTHER_INCOME + TOTAL_RECOVERIES",
      label: "Effective Gross Income",
    },
  ])

  const [expenseItems, setExpenseItems] = useState<LineItem[]>([
    {
      id: "operating-expenses",
      name: "Operating Expenses",
      annualAmount: 0,
      perUnit: 0,
      notes: "",
      isExpanded: true,
      isCalculated: false,
      hasChildren: true,
      children: [
        {
          id: "controllable-expenses",
          name: "Controllable Expenses",
          annualAmount: 0,
          perUnit: 0,
          notes: "",
          isExpanded: true,
          isCalculated: false,
          hasChildren: true,
          children: [
            {
              id: "payroll",
              name: "PAYROLL",
              annualAmount: 60000,
              perUnit: 1200,
              notes: "",
              hasFormula: true,
              formula: "Staff Salaries",
              docTotal: 60000,
              monthlyData: {
                jan: 5000, feb: 5000, mar: 5000, apr: 5000,
                may: 5000, jun: 5000, jul: 5000, aug: 5000,
                sep: 5000, oct: 5000, nov: 5000, dec: 5000,
              },
              label: "Payroll",
            },
            {
              id: "benefits",
              name: "BENEFITS",
              annualAmount: 15000,
              perUnit: 300,
              notes: "",
              hasFormula: true,
              formula: "Employee Benefits",
              docTotal: 15000,
              monthlyData: {
                jan: 1250, feb: 1250, mar: 1250, apr: 1250,
                may: 1250, jun: 1250, jul: 1250, aug: 1250,
                sep: 1250, oct: 1250, nov: 1250, dec: 1250,
              },
              label: "Benefits",
            },
            {
              id: "management-fee",
              name: "MANAGEMENT_FEE",
              annualAmount: 59732,
              perUnit: 1195,
              notes: "",
              hasFormula: true,
              formula: "EGI × Management %",
              docTotal: 59732,
              monthlyData: {
                jan: 4978, feb: 4978, mar: 4978, apr: 4978,
                may: 4978, jun: 4978, jul: 4978, aug: 4978,
                sep: 4978, oct: 4978, nov: 4978, dec: 4978,
              },
              label: "Management Fee",
            },
            {
              id: "administrative",
              name: "ADMINISTRATIVE",
              annualAmount: 12000,
              perUnit: 240,
              notes: "",
              hasFormula: true,
              formula: "Office & Admin Costs",
              docTotal: 12000,
              monthlyData: {
                jan: 1000, feb: 1000, mar: 1000, apr: 1000,
                may: 1000, jun: 1000, jul: 1000, aug: 1000,
                sep: 1000, oct: 1000, nov: 1000, dec: 1000,
              },
              label: "Administrative",
            },
            {
              id: "marketing",
              name: "MARKETING",
              annualAmount: 8000,
              perUnit: 160,
              notes: "",
              hasFormula: true,
              formula: "Marketing & Advertising",
              docTotal: 8000,
              monthlyData: {
                jan: 667, feb: 667, mar: 667, apr: 667,
                may: 667, jun: 667, jul: 667, aug: 667,
                sep: 667, oct: 667, nov: 667, dec: 667,
              },
              label: "Marketing",
            },
            {
              id: "professional-fees",
              name: "PROFESSIONAL_FEES",
              annualAmount: 6000,
              perUnit: 120,
              notes: "",
              hasFormula: true,
              formula: "Legal & Professional",
              docTotal: 6000,
              monthlyData: {
                jan: 500, feb: 500, mar: 500, apr: 500,
                may: 500, jun: 500, jul: 500, aug: 500,
                sep: 500, oct: 500, nov: 500, dec: 500,
              },
              label: "Professional Fees",
            },
            {
              id: "repairs",
              name: "REPAIRS",
              annualAmount: 40000,
              perUnit: 800,
              notes: "",
              hasFormula: true,
              formula: "Repair Costs",
              docTotal: 40000,
              monthlyData: {
                jan: 3333, feb: 3333, mar: 3333, apr: 3333,
                may: 3333, jun: 3333, jul: 3333, aug: 3333,
                sep: 3333, oct: 3333, nov: 3333, dec: 3333,
              },
              label: "Repairs",
            },
            {
              id: "maintenance",
              name: "MAINTENANCE",
              annualAmount: 30000,
              perUnit: 600,
              notes: "",
              hasFormula: true,
              formula: "Maintenance Costs",
              docTotal: 30000,
              monthlyData: {
                jan: 2500, feb: 2500, mar: 2500, apr: 2500,
                may: 2500, jun: 2500, jul: 2500, aug: 2500,
                sep: 2500, oct: 2500, nov: 2500, dec: 2500,
              },
              label: "Maintenance",
            },
            {
              id: "turnover",
              name: "TURNOVER",
              annualAmount: 20000,
              perUnit: 400,
              notes: "",
              hasFormula: true,
              formula: "Unit Turnover Costs",
              docTotal: 20000,
              monthlyData: {
                jan: 1667, feb: 1667, mar: 1667, apr: 1667,
                may: 1667, jun: 1667, jul: 1667, aug: 1667,
                sep: 1667, oct: 1667, nov: 1667, dec: 1667,
              },
              label: "Turnover",
            },
            {
              id: "contract-services",
              name: "CONTRACT_SERVICES",
              annualAmount: 15000,
              perUnit: 300,
              notes: "",
              hasFormula: true,
              formula: "Contract Services",
              docTotal: 15000,
              monthlyData: {
                jan: 1250, feb: 1250, mar: 1250, apr: 1250,
                may: 1250, jun: 1250, jul: 1250, aug: 1250,
                sep: 1250, oct: 1250, nov: 1250, dec: 1250,
              },
              label: "Contract Services",
            },
            {
              id: "landscaping",
              name: "LANDSCAPING",
              annualAmount: 10000,
              perUnit: 200,
              notes: "",
              hasFormula: true,
              formula: "Landscaping & Grounds",
              docTotal: 10000,
              monthlyData: {
                jan: 833, feb: 833, mar: 833, apr: 833,
                may: 833, jun: 833, jul: 833, aug: 833,
                sep: 833, oct: 833, nov: 833, dec: 833,
              },
              label: "Landscaping",
            },
            {
              id: "supplies",
              name: "SUPPLIES",
              annualAmount: 8000,
              perUnit: 160,
              notes: "",
              hasFormula: true,
              formula: "Supplies & Materials",
              docTotal: 8000,
              monthlyData: {
                jan: 667, feb: 667, mar: 667, apr: 667,
                may: 667, jun: 667, jul: 667, aug: 667,
                sep: 667, oct: 667, nov: 667, dec: 667,
              },
              label: "Supplies",
            },
            {
              id: "security",
              name: "SECURITY",
              annualAmount: 12000,
              perUnit: 240,
              notes: "",
              hasFormula: true,
              formula: "Security Services",
              docTotal: 12000,
              monthlyData: {
                jan: 1000, feb: 1000, mar: 1000, apr: 1000,
                may: 1000, jun: 1000, jul: 1000, aug: 1000,
                sep: 1000, oct: 1000, nov: 1000, dec: 1000,
              },
              label: "Security",
            },
          ],
        },
        {
          id: "total-controllable-expenses",
          name: "TOTAL_CONTROLLABLE_EXPENSES",
          annualAmount: 295732,
          perUnit: 5915,
          notes: "",
          isCalculated: true,
          hasFormula: true,
          formula: "= SUM(CONTROLLABLE_CATEGORIES)",
          label: "Total Controllable Expenses",
        },
        {
          id: "non-controllable-expenses",
          name: "Non-Controllable Expenses",
          annualAmount: 0,
          perUnit: 0,
          notes: "",
          isExpanded: true,
          isCalculated: false,
          hasChildren: true,
          children: [
            {
              id: "utilities",
              name: "UTILITIES",
              annualAmount: 60000,
              perUnit: 1200,
              notes: "",
              hasFormula: true,
              formula: "Utility Costs",
              docTotal: 60000,
              monthlyData: {
                jan: 5000, feb: 5000, mar: 5000, apr: 5000,
                may: 5000, jun: 5000, jul: 5000, aug: 5000,
                sep: 5000, oct: 5000, nov: 5000, dec: 5000,
              },
              label: "Utilities",
            },
            {
              id: "insurance",
              name: "INSURANCE",
              annualAmount: 30000,
              perUnit: 600,
              notes: "",
              hasFormula: true,
              formula: "Property Insurance",
              docTotal: 30000,
              monthlyData: {
                jan: 2500, feb: 2500, mar: 2500, apr: 2500,
                may: 2500, jun: 2500, jul: 2500, aug: 2500,
                sep: 2500, oct: 2500, nov: 2500, dec: 2500,
              },
              label: "Insurance",
            },
            {
              id: "real-estate-tax",
              name: "REAL_ESTATE_TAX",
              annualAmount: 100000,
              perUnit: 2000,
              notes: "",
              hasFormula: true,
              formula: "Property Taxes",
              docTotal: 100000,
              monthlyData: {
                jan: 8333, feb: 8333, mar: 8333, apr: 8333,
                may: 8333, jun: 8333, jul: 8333, aug: 8333,
                sep: 8333, oct: 8333, nov: 8333, dec: 8333,
              },
              label: "Real Estate Tax",
            },
            {
              id: "other-tax",
              name: "OTHER_TAX",
              annualAmount: 25027,
              perUnit: 501,
              notes: "",
              hasFormula: true,
              formula: "Other Taxes",
              docTotal: 25027,
              monthlyData: {
                jan: 2086, feb: 2086, mar: 2086, apr: 2086,
                may: 2086, jun: 2086, jul: 2086, aug: 2086,
                sep: 2086, oct: 2086, nov: 2086, dec: 2086,
              },
              label: "Other Tax",
            },
          ],
        },
        {
          id: "total-non-controllable-expenses",
          name: "TOTAL_NON_CONTROLLABLE_EXPENSES",
          annualAmount: 215027,
          perUnit: 4301,
          notes: "",
          isCalculated: true,
          hasFormula: true,
          formula: "= SUM(NON_CONTROLLABLE_CATEGORIES)",
          label: "Total Non-Controllable Expenses",
        },
      ],
    },
    {
      id: "total-operating-expenses",
      name: "TOTAL_OPERATING_EXPENSES",
      annualAmount: 510759,
      perUnit: 10215,
      notes: "",
      isCalculated: true,
      isMajorTotal: true,
      hasFormula: true,
      formula: "= TOTAL_CONTROLLABLE_EXPENSES + TOTAL_NON_CONTROLLABLE_EXPENSES",
      label: "Total Operating Expenses",
    },
  ])

  const [capitalItems, setCapitalItems] = useState<LineItem[]>([
    {
      id: "capital-items",
      name: "Capital Items",
      annualAmount: 0,
      perUnit: 0,
      notes: "",
      isExpanded: true,
      isCalculated: false,
      hasChildren: true,
      children: [
        {
          id: "replacement-reserves",
          name: "REPLACEMENT_RESERVES",
          annualAmount: 15000,
          perUnit: 300,
          notes: "",
          hasFormula: true,
          formula: "$300/unit/year",
          docTotal: 15000,
          monthlyData: {
            jan: 1250, feb: 1250, mar: 1250, apr: 1250,
            may: 1250, jun: 1250, jul: 1250, aug: 1250,
            sep: 1250, oct: 1250, nov: 1250, dec: 1250,
          },
          label: "Replacement Reserves",
        },
        {
          id: "capital-improvements",
          name: "CAPITAL_IMPROVEMENTS",
          annualAmount: 50000,
          perUnit: 1000,
          notes: "",
          hasFormula: true,
          formula: "CapEx Budget",
          docTotal: 50000,
          monthlyData: {
            jan: 4167, feb: 4167, mar: 4167, apr: 4167,
            may: 4167, jun: 4167, jul: 4167, aug: 4167,
            sep: 4167, oct: 4167, nov: 4167, dec: 4167,
          },
          label: "Capital Improvements",
        },
        {
          id: "leasing-commissions",
          name: "LEASING_COMMISSIONS",
          annualAmount: 12000,
          perUnit: 240,
          notes: "",
          hasFormula: true,
          formula: "Leasing Costs",
          docTotal: 12000,
          monthlyData: {
            jan: 1000, feb: 1000, mar: 1000, apr: 1000,
            may: 1000, jun: 1000, jul: 1000, aug: 1000,
            sep: 1000, oct: 1000, nov: 1000, dec: 1000,
          },
          label: "Leasing Commissions",
        },
      ],
    },
    {
      id: "total-capital-expenses",
      name: "TOTAL_CAPITAL_EXPENSES",
      annualAmount: 77000,
      perUnit: 1540,
      notes: "",
      isCalculated: true,
      hasFormula: true,
      formula: "= SUM(CAPITAL_CATEGORIES)",
      label: "Total Capital Expenses",
    },
  ])

  const [debtItems, setDebtItems] = useState<LineItem[]>([
    {
      id: "debt-service",
      name: "Debt Service",
      annualAmount: 0,
      perUnit: 0,
      notes: "",
      isExpanded: true,
      isCalculated: false,
      hasChildren: true,
      children: [
        {
          id: "interest-payment",
          name: "INTEREST_PAYMENT",
          annualAmount: 200000,
          perUnit: 4000,
          notes: "",
          hasFormula: true,
          formula: "Loan Amount × Interest Rate",
          docTotal: 200000,
          monthlyData: {
            jan: 16667, feb: 16667, mar: 16667, apr: 16667,
            may: 16667, jun: 16667, jul: 16667, aug: 16667,
            sep: 16667, oct: 16667, nov: 16667, dec: 16667,
          },
          label: "Interest Payment",
        },
        {
          id: "debt-service-line",
          name: "DEBT_SERVICE",
          annualAmount: 78870,
          perUnit: 1577,
          notes: "",
          hasFormula: true,
          formula: "Principal + Interest",
          docTotal: 78870,
          monthlyData: {
            jan: 6573, feb: 6573, mar: 6573, apr: 6573,
            may: 6573, jun: 6573, jul: 6573, aug: 6573,
            sep: 6573, oct: 6573, nov: 6573, dec: 6573,
          },
          label: "Debt Service",
        },
      ],
    },
    {
      id: "total-debt-service",
      name: "TOTAL_DEBT_SERVICE",
      annualAmount: 278870,
      perUnit: 5577,
      notes: "",
      isCalculated: true,
      hasFormula: true,
      formula: "= PRINCIPAL + INTEREST_PAYMENT",
      label: "Total Debt Service",
    },
  ])

  // Save single line item update to database
  const saveLineItemUpdate = useCallback(
    async (itemId: string, itemType: 'income' | 'expense' | 'capital' | 'debt', updates: Partial<LineItem>) => {
      if (!propertyId) {
        console.log('[T12 Tab] No propertyId available, skipping save')
        return
      }

      try {
        setIsSaving(true)
        console.log('[T12 Tab] Saving line item update:', { propertyId, itemId, itemType, updates })

        const response = await fetch('/api/documents/os-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            itemId,
            itemType,
            updates,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save line item')
        }

        console.log('[T12 Tab] Line item saved successfully')
      } catch (error) {
        console.error('[T12 Tab] Error saving line item:', error)
      } finally {
        setIsSaving(false)
      }
    },
    [propertyId]
  )

  // Save all items to database (bulk update)
  const saveAllItems = useCallback(
    async () => {
      if (!propertyId) {
        console.log('[T12 Tab] No propertyId available, skipping bulk save')
        return
      }

      try {
        setIsSaving(true)
        console.log('[T12 Tab] Saving all items:', { propertyId })

        const response = await fetch('/api/documents/os-update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            incomeItems,
            expenseItems,
            capitalItems,
            debtItems,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to save items')
        }

        console.log('[T12 Tab] All items saved successfully')
      } catch (error) {
        console.error('[T12 Tab] Error saving all items:', error)
      } finally {
        setIsSaving(false)
      }
    },
    [propertyId, incomeItems, expenseItems, capitalItems, debtItems]
  )

  // Helper function to determine item type based on which setter is being used
  const getItemTypeFromSetter = (
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>
  ): 'income' | 'expense' | 'capital' | 'debt' => {
    if (setItems === setIncomeItems) return 'income'
    if (setItems === setExpenseItems) return 'expense'
    if (setItems === setCapitalItems) return 'capital'
    if (setItems === setDebtItems) return 'debt'
    return 'income' // default fallback
  }

  // Helper to find an item in a nested structure and get its full data
  const findItemById = (items: LineItem[], id: string): LineItem | null => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findItemById(item.children, id)
        if (found) return found
      }
    }
    return null
  }


  const calculateMonthlySum = (monthlyData: MonthlyData | undefined): number => {
    if (!monthlyData) return 0
    const sum = Object.values(monthlyData).reduce((acc, val) => acc + (val || 0), 0)
    return sum
  }

  const isDiscrepancyAcceptable = (discrepancy: number, annualAmount: number): boolean => {
    const absDiscrepancy = Math.abs(discrepancy)
    // Very tight acceptable ranges for CRE<bos> broker standards
    if (absDiscrepancy <= 5) return true // Rounding errors only
    if (annualAmount < 10000) return absDiscrepancy <= 20 // Small line items: ±$20
    if (annualAmount < 100000) return absDiscrepancy <= 100 // Medium line items: ±$100
    return absDiscrepancy <= 100 // Large line items: ±$100 max
  }

  const acceptDiscrepancy = (
    itemId: string,
    itemName: string,
    docTotal: number | undefined,
    calcTotal: number | undefined,
  ) => {
    setAcceptedDiscrepancies((prev) => new Set(prev).add(itemId))

    // Automatically add a note about the accepted discrepancy
    const discrepancy = (docTotal ?? 0) - (calcTotal ?? 0)
    const note = `Accepted discrepancy: $${Math.abs(discrepancy).toLocaleString('en-US')} difference (Doc: $${(docTotal ?? 0).toLocaleString('en-US')}, Calc: $${(calcTotal ?? 0).toLocaleString('en-US')})`

    // Update the notes for this item
    const updateNotes = (items: LineItem[]): LineItem[] => {
      return items.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            notes: item.notes ? `${item.notes}\n${note}` : note,
          }
        }
        if (item.children) {
          return {
            ...item,
            children: updateNotes(item.children),
          }
        }
        return item
      })
    }

    setIncomeItems((prev) => updateNotes(prev))
    setExpenseItems((prev) => updateNotes(prev))
    setCapitalItems((prev) => updateNotes(prev))
    setDebtItems((prev) => updateNotes(prev))
  }


  const getValidationStatus = (
    item: LineItem,
  ): {
    isValid: boolean
    discrepancy: number
    isAcceptable: boolean
    isAccepted: boolean
  } => {
    if (!item.docTotal || !item.monthlyData)
      return {
        isValid: true,
        discrepancy: 0,
        isAcceptable: true,
        isAccepted: false,
      }
    const calcTotal = calculateMonthlySum(item.monthlyData)
    const discrepancy = item.docTotal - calcTotal
    const tolerance = 1
    const isValid = Math.abs(discrepancy) <= tolerance
    const isAcceptable = isDiscrepancyAcceptable(discrepancy, item.annualAmount ?? 0)
    const isAccepted = acceptedDiscrepancies.has(item.id)
    return {
      isValid,
      discrepancy,
      isAcceptable,
      isAccepted,
    }
  }

  // Handle file upload




  // Update line item
  const updateLineItem = (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    field: keyof LineItem,
    value: string | number | boolean, // Allow boolean for toggles
  ) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value } as LineItem

          // Auto-calculate per unit when annual amount changes
          if (field === "annualAmount" && totalUnits > 0) {
            updated.perUnit = Number(value) / totalUnits
          }
          // Auto-calculate annual amount when per unit changes
          if (field === "perUnit") {
            updated.annualAmount = Number(value) * totalUnits
          }
          return updated
        }
        if (item.children) {
          // Recursively update children
          return { ...item, children: updateLineItemHelper(item.children, id, field, value, totalUnits) }
        }
        return item
      }),
    )
  }

  const updateLineItemHelper = (
    items: LineItem[],
    id: string,
    field: keyof LineItem,
    value: string | number | boolean,
    unitCount: number,
  ): LineItem[] => {
    return items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value } as LineItem
        if (field === "annualAmount" && unitCount > 0) {
          updated.perUnit = Number(value) / unitCount
        }
        if (field === "perUnit") {
          updated.annualAmount = Number(value) * unitCount
        }
        return updated
      }
      if (item.children) {
        return { ...item, children: updateLineItemHelper(item.children, id, field, value, unitCount) }
      }
      return item
    })
  }

  // Add custom line item
  const addCustomLineItem = (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    type: "income" | "expense",
    parentId: string | null = null,
  ) => {
    const newItem: LineItem = {
      id: `custom-${Date.now()}`,
      name: `Custom ${type === "income" ? "Income" : "Expense"}`,
      annualAmount: 0,
      perUnit: 0,
      notes: "",
      isEditing: true,
      showMonthly: false,
      monthlyData: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 },
      label: `Custom ${type === "income" ? "Income" : "Expense"}`,
    }

    if (parentId) {
      setItems(
        items.map((item) => {
          if (item.id === parentId) {
            return { ...item, children: [...(item.children || []), newItem] }
          }
          if (item.children) {
            return { ...item, children: addCustomLineItemHelper(item.children, newItem, type) }
          }
          return item
        }),
      )
    } else {
      setItems([...items, newItem])
    }
  }

  const addCustomLineItemHelper = (items: LineItem[], newItem: LineItem, type: "income" | "expense"): LineItem[] => {
    return items.map((item) => {
      if (item.children) {
        return { ...item, children: addCustomLineItemHelper(item.children, newItem, type) }
      }
      // Assuming we add at the end of the sibling list if no specific parent
      return item
    })
  }

  const toggleExpand = (id: string) => {
    const updateItems = (items: LineItem[]): LineItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, isExpanded: !item.isExpanded }
        }
        if (item.children) {
          return { ...item, children: updateItems(item.children) }
        }
        return item
      })
    }
    setIncomeItems(updateItems(incomeItems))
    setExpenseItems(updateItems(expenseItems))
    setCapitalItems(updateItems(capitalItems))
    setDebtItems(updateItems(debtItems))
  }

 
 

  const handlePerUnitChange = (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    value: string,
  ) => {
    const newValue = Number(value)
    updateLineItem(items, setItems, id, "perUnit", newValue)
    // Recalculate annualAmount if unitCount is available
    if (totalUnits > 0) {
      updateLineItem(items, setItems, id, "annualAmount", newValue * totalUnits)
    }

    // Save to database after a brief delay (debounced)
    const itemType = getItemTypeFromSetter(setItems)
    const annualAmount = totalUnits > 0 ? newValue * totalUnits : 0
    saveLineItemUpdate(id, itemType, { 
      perUnit: newValue, 
      annualAmount 
    })
  }

  const handleMonthlyChange = (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    month: string,
    value: string,
  ) => {
    const newValue = Number(value) || 0
    let updatedItemData: { monthlyData: MonthlyData; docTotal: number; annualAmount: number; perUnit: number } | null = null
    
    const updateMonthly = (items: LineItem[]): LineItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          const newMonthlyData: MonthlyData = {
            ...(item.monthlyData || { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }),
            [month]: newValue,
          } as MonthlyData
          // Recalculate docTotal from monthly data
          const newDocTotal = Object.values(newMonthlyData).reduce((sum, val) => sum + (val || 0), 0)
          const newPerUnit = totalUnits > 0 ? newDocTotal / totalUnits : 0
          
          updatedItemData = {
            monthlyData: newMonthlyData,
            docTotal: newDocTotal,
            annualAmount: newDocTotal,
            perUnit: newPerUnit,
          }
          
          return {
            ...item,
            monthlyData: newMonthlyData,
            docTotal: newDocTotal,
            annualAmount: newDocTotal,
            perUnit: newPerUnit,
          }
        }
        if (item.children) {
          return { ...item, children: updateMonthly(item.children) }
        }
        return item
      })
    }
    setItems(updateMonthly(items))

    // Save to database
    if (updatedItemData) {
      const itemType = getItemTypeFromSetter(setItems)
      saveLineItemUpdate(id, itemType, updatedItemData)
    }
  }

  const handleDocTotalChange = (
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    id: string,
    value: string,
  ) => {
    const newValue = Number(value) || 0
    const perUnit = totalUnits > 0 ? newValue / totalUnits : 0
    
    const updateDocTotal = (items: LineItem[]): LineItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            docTotal: newValue,
            annualAmount: newValue,
            perUnit: perUnit,
          }
        }
        if (item.children) {
          return { ...item, children: updateDocTotal(item.children) }
        }
        return item
      })
    }
    setItems(updateDocTotal(items))

    // Save to database
    const itemType = getItemTypeFromSetter(setItems)
    saveLineItemUpdate(id, itemType, {
      docTotal: newValue,
      annualAmount: newValue,
      perUnit: perUnit,
    })
  }


  const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const

  // Added resize handler to support both mouse and touch events
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    setIsResizing(true)

    const startX = "touches" in e ? e.touches[0].clientX : e.clientX
    const startWidth = lineItemColumnWidth

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const currentX = "touches" in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX
      const diff = currentX - startX
      const newWidth = Math.max(120, Math.min(400, startWidth + diff))
      setLineItemColumnWidth(newWidth)
    }

    const handleEnd = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMove)
      document.removeEventListener("mouseup", handleEnd)
      document.removeEventListener("touchmove", handleMove)
      document.removeEventListener("touchend", handleEnd)
    }

    document.addEventListener("mousemove", handleMove)
    document.addEventListener("mouseup", handleEnd)
    document.addEventListener("touchmove", handleMove)
    document.addEventListener("touchend", handleEnd)
  }
  // </CHANGE>

  const renderLineItem = (
    item: LineItem,
    items: LineItem[],
    setItems: React.Dispatch<React.SetStateAction<LineItem[]>>,
    depth = 0,
  ): React.ReactNode => {
    const hasChildren = item.children && item.children.length > 0
    const majorTotalFontClass = item.isMajorTotal ? "font-bold text-xs" : item.isCalculated ? "font-semibold" : ""
    const validation = getValidationStatus(item)
    // Don't mark as mismatch if discrepancy is accepted
    const hasMismatch = !validation.isValid && !validation.isAccepted
    const isCategoryHeader = item.hasChildren && !item.isCalculated
    if (isCategoryHeader) {
      console.log("[v0] Category header detected:", {
        id: item.id,
        name: item.name, // Added name to debug output
        hasChildren: item.hasChildren,
        isCalculated: item.isCalculated,
        depth: depth, // Fixed depth to use the function parameter
      })
    }
    // </CHANGE>

    // Determine row background color
    let rowBgClass = "bg-white"
    if (item.isMajorTotal) {
      rowBgClass = "bg-orange-50"
    } else if (item.isCalculated && !item.isMajorTotal) {
      rowBgClass = "bg-blue-50"
    }

    return (
      <React.Fragment key={item.id}>
        <tr
          className={`border-b hover:bg-gray-100/50 ${rowBgClass} ${
            item.isMajorTotal ? "font-bold text-sm" : item.isCalculated ? "font-semibold text-xs" : "text-xs"
          }`}
        >
          {/* Line Item column - narrower and sticky */}
          <td
            className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-xs sticky left-0 ${rowBgClass} z-10 border-r`}
            style={{
              width: `${lineItemColumnWidth}px`,
              minWidth: `${lineItemColumnWidth}px`,
              maxWidth: `${lineItemColumnWidth}px`,
              paddingLeft: `${4 + depth * 12}px`,
              paddingRight: "4px",
              // </CHANGE>
            }}
          >
            <div className="flex items-center gap-0.5 w-full">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(item.id)}
                  className="p-0 h-4 w-4 hover:bg-gray-100 flex-shrink-0"
                >
                  {item.isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </Button>
              ) : (
                <div className="w-4 h-4 flex-shrink-0" />
              )}
              {/* </CHANGE> */}
              <span
                className={`${majorTotalFontClass} ${isCategoryHeader ? "font-semibold" : ""} truncate flex-1`}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={item.name}
              >
                {item.name}
              </span>
              {item.hasFormula && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3 h-3 text-blue-500 cursor-help flex-shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs font-mono">{item.formula}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </td>

          {/* Per Unit column - no longer sticky, consistent styling */}
          <td
            className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[100px] min-w-[100px] max-w-[100px] border-r`}
          >
            {isCategoryHeader ? (
              <span className="text-gray-400">-</span>
            ) : (
              <Input
                type="number"
                value={item.perUnit ?? 0}
                onChange={(e) => handlePerUnitChange(items, setItems, item.id, e.target.value)}
                className={`border-0 bg-transparent font-mono text-xs p-0 h-auto text-right ${item.isMajorTotal ? "text-sm font-bold" : item.isCalculated ? "font-semibold" : ""}`}
              />
            )}
          </td>
          {/* Doc Total column - no longer sticky, consistent styling */}
          <td
            className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[120px] min-w-[120px] max-w-[120px] border-r text-blue-700`}
          >
            {isCategoryHeader ? (
              <span className="text-gray-400">-</span>
            ) : (
              <div className="flex items-center justify-end gap-1">
                <Input
                  type="number"
                  value={item.docTotal ?? 0}
                  onChange={(e) => handleDocTotalChange(items, setItems, item.id, e.target.value)}
                  className={`border-0 bg-transparent font-mono text-xs p-0 h-auto text-right w-[80px] ${item.isMajorTotal ? "text-sm font-bold" : ""}`}
                />
                {item.docTotal !== undefined && (
                  <>
                    {hasMismatch ? (
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">
                                Discrepancy: ${Math.abs(validation.discrepancy).toLocaleString('en-US')}
                                <br />
                                Doc Total: ${(item.docTotal ?? 0).toLocaleString('en-US')}
                                <br />
                                Calc Total: ${calculateMonthlySum(item.monthlyData).toLocaleString('en-US')}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {validation.isAcceptable && !validation.isAccepted && (
                          <button
                            onClick={() =>
                              acceptDiscrepancy(
                                item.id,
                                item.name,
                                item.docTotal,
                                calculateMonthlySum(item.monthlyData),
                              )
                            }
                            className="text-xs px-1 py-0.5 bg-amber-500 text-white rounded hover:bg-amber-600"
                            title="Accept discrepancy"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    )}
                  </>
                )}
              </div>
            )}
          </td>
          {/* Calc Total column - not sticky */}
          <td
            className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[120px] min-w-[120px] max-w-[120px] border-r ${
              hasMismatch ? "bg-yellow-100" : ""
            }`}
          >
            {isCategoryHeader ? (
              <span className="text-gray-400">-</span>
            ) : (
              <span className={`font-mono ${item.isMajorTotal ? "text-sm font-bold" : ""}`}>
                ${calculateMonthlySum(item.monthlyData).toLocaleString('en-US')}
              </span>
            )}
          </td>
          {/* Monthly columns - only show when showMonthlyColumns is true */}
          {showMonthlyColumns &&
            months.map((month) => (
              <td
                key={month}
                className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-right text-xs w-[90px] min-w-[90px] max-w-[90px] border-r`}
              >
                {isCategoryHeader ? (
                  <span className="text-gray-400">-</span>
                ) : (
                  <Input
                    type="number"
                    value={item.monthlyData?.[month] ?? 0}
                    onChange={(e) => handleMonthlyChange(items, setItems, item.id, month, e.target.value)}
                    className={`border-0 bg-transparent font-mono text-xs p-0 h-auto text-right w-full ${item.isMajorTotal ? "text-sm font-bold" : ""}`}
                  />
                )}
              </td>
            ))}
          <td
            className={`${item.isMajorTotal ? "p-2" : "p-1.5"} text-left text-xs ${showMonthlyColumns ? "w-[150px] min-w-[150px]" : "w-[200px] min-w-[200px]"}`}
          >
            {isCategoryHeader ? (
              <span className="text-gray-400">-</span>
            ) : (
              <Input
                type="text"
                value={item.notes || ""}
                onChange={(e) => {
                  const newNotes = e.target.value
                  const updateNotes = (items: LineItem[]): LineItem[] => {
                    return items.map((i) => {
                      if (i.id === item.id) {
                        return { ...i, notes: newNotes }
                      }
                      if (i.children) {
                        return { ...i, children: updateNotes(i.children) }
                      }
                      return i
                    })
                  }
                  setItems(updateNotes(items))
                }}
                onBlur={(e) => {
                  // Save notes on blur to avoid too many API calls
                  const itemType = getItemTypeFromSetter(setItems)
                  saveLineItemUpdate(item.id, itemType, { notes: e.target.value })
                }}
                placeholder="Add notes..."
                className="border-0 bg-transparent text-xs p-0 h-auto"
              />
            )}
          </td>
        </tr>
        {hasChildren && item.isExpanded && (
          <>
            {item.children?.map((child) => {
              return renderLineItem(child, items, setItems, depth + 1)
            })}
          </>
        )}
      </React.Fragment>
    )
  }

  if (!property) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <p className="text-gray-600">Select a property to analyze T-12 actuals.</p>
      </div>
    )
  }

  // Calculations
  const calculateEGI = (): number => {
    const egiItem = findItem(incomeItems, "effective-gross-income")
    return egiItem?.annualAmount ?? 0
  }

  const calculateTotalExpenses = (): number => {
    const expensesItem = findItem(expenseItems, "total-operating-expenses")
    return expensesItem?.annualAmount ?? 0
  }

  const calculateNOI = (): number => {
    return calculateEGI() - calculateTotalExpenses()
  }

  const calculateNCF = (): number => {
    return calculateNOI() - calculateCapitalExpenses()
  }

  const calculateCapitalExpenses = (): number => {
    const capitalItem = findItem(capitalItems, "total-capital-expenses")
    return capitalItem?.annualAmount ?? 0
  }
  // Placeholder functions for Summary Metrics (to be implemented)
  const calculateSummaryMetrics = (): SummaryMetrics => {
    // These calculations will need to use the normalized data, valuation inputs, etc.
    // For now, returning dummy data.
    const currentNOI = calculateNOI()
    const projectedNOIYear1 = currentNOI * (1 + normalizedAssumptions.rentGrowth / 100) // Simplified
    const projectedNOIExit =
      currentNOI * Math.pow(1 + normalizedAssumptions.rentGrowth / 100, normalizedAssumptions.holdPeriod) // Simplified
    const exitCapRate = normalizedAssumptions.exitCapRate / 100
    const exitValue = projectedNOIExit / exitCapRate
    const saleCosts = exitValue * (normalizedAssumptions.exitCosts / 100)
    const loanBalance = calculateLoanBalance(
      valuationInputs.loanAmount,
      valuationInputs.interestRate,
      valuationInputs.amortizationYears,
      normalizedAssumptions.holdPeriod,
    )
    const netSaleProceeds = exitValue - saleCosts - loanBalance
    const totalProfit = netSaleProceeds - valuationInputs.purchasePrice // Simplified

    // Placeholder values for IRR and other metrics
    const leveredIRR = 15.5 // Placeholder
    const equityMultiple = netSaleProceeds / valuationInputs.purchasePrice // Simplified

    return {
      unleveredIRR: 12.0, // Placeholder
      leveredIRR: leveredIRR,
      equityMultiple: equityMultiple,
      avgCoCReturn: 1.8, // Placeholder
      exitValue: exitValue,
      netSaleProceeds: netSaleProceeds,
      minDSCR: 1.1, // Placeholder
      avgDSCR: 1.3, // Placeholder
      totalEquityDistributions: netSaleProceeds, // Placeholder
      totalProfit: totalProfit,
    }
  }

  const generateYearlyCashflows = (): YearlyCashflow[] => {
    const cashflows: YearlyCashflow[] = []
    const currentNOI = calculateNOI()
    const annualDebtService =
      calculateMonthlyPayment(
        valuationInputs.loanAmount,
        valuationInputs.interestRate,
        valuationInputs.amortizationYears,
      ) * 12
    const initialEquity = valuationInputs.purchasePrice - valuationInputs.loanAmount // Simplified

    // Get the actual capitalized expenses
    const capitalReserves = calculateCapitalExpenses()

    for (let i = 0; i < normalizedAssumptions.holdPeriod; i++) {
      const year = i + 1
      const currentRentGrowth = Math.pow(1 + normalizedAssumptions.rentGrowth / 100, i)
      const currentExpenseGrowth = Math.pow(1 + normalizedAssumptions.expenseGrowth / 100, i)

      const baseRent = findItem(incomeItems, "rental-income-line")?.annualAmount || 0
      const projectedRent = baseRent * currentRentGrowth
      const vacancy = projectedRent * (normalizedAssumptions.vacancyRate / 100)
      const otherIncome = (findItem(incomeItems, "total-other-income")?.annualAmount || 0) * currentRentGrowth

      const egi = projectedRent - vacancy + otherIncome
      const expenses = calculateTotalExpenses() * currentExpenseGrowth
      const noi = egi - expenses

      const loanBalance = calculateLoanBalance(
        valuationInputs.loanAmount,
        valuationInputs.interestRate,
        valuationInputs.amortizationYears,
        normalizedAssumptions.holdPeriod - i,
      )
      const debtService = annualDebtService // Assuming constant debt service for simplicity

      const cashflowToEquity = noi - debtService
      const dscr = debtService !== 0 ? noi / debtService : Number.POSITIVE_INFINITY
      const cocReturn = initialEquity !== 0 ? (cashflowToEquity / initialEquity) * 100 : 0

      cashflows.push({
        year,
        noi,
        debtService,
        cashflowToEquity,
        dscr,
        cocReturn,
      })
    }
    return cashflows
  }

  // Calculate summary metrics and yearly cashflows once
  // Function to add a new line item
  const handleAddLineItem = () => {
    // For simplicity, let's add it to the 'other-income' category for now
    // In a real app, you might have a modal or a more sophisticated way to choose
    // where to add the item.
    addCustomLineItem(incomeItems, setIncomeItems, "income", "other-income")
  }

  return (
    <div className="space-y-4 p-3 sm:p-4 md:p-6">
      {/* Validation Banner */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-sm text-gray-600">
            {validated ? (
              <span className="text-green-600 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                T-12 / OS Data Validated
              </span>
            ) : (
              <span className="text-gray-500">Review all line items and validate the data before proceeding</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {validated && (
              <button
                onClick={onUnvalidate}
                className="px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
            )}
            <button
              onClick={onValidate}
              disabled={validated}
              className={`px-4 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                validated
                  ? "bg-green-50 text-green-700 cursor-not-allowed"
                  : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
              }`}
            >
              {validated ? "✓ Validated" : "Validate Data"}
            </button>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-2 shadow-sm">
        <div className="flex gap-1 p-1 bg-gray-100/60 rounded-lg">
          <button
            onClick={() => setMobileSection("income")}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              mobileSection === "income" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setMobileSection("expense")}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              mobileSection === "expense" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setMobileSection("noi")}
            className={`flex-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
              mobileSection === "noi" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            NOI
          </button>
        </div>
      </div>
      {/* </CHANGE> */}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <button
          onClick={() => setShowMonthlyColumns(!showMonthlyColumns)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-sm font-medium text-gray-700 flex items-center justify-center gap-2 shadow-sm"
        >
          {showMonthlyColumns ? (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Hide Monthly</span>
            </>
          ) : (
            <>
              <ChevronRight className="w-4 h-4" />
              <span>Show Monthly</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2.5 text-sm text-gray-600">
          <span className="font-medium">Total Units:</span>
          <input
            type="number"
            value={totalUnits}
            onChange={(e) => setTotalUnits(Number.parseInt(e.target.value) || 0)}
            className="w-16 sm:w-20 px-3 py-2 border border-gray-200 rounded-lg text-center focus:border-gray-300 focus:ring-1 focus:ring-gray-200 transition-all duration-200"
          />
        </div>

        <button
          onClick={handleAddLineItem}
          className="px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Add Line Item</span>
        </button>
      </div>

      <div className={`${mobileSection !== "income" ? "hidden md:block" : ""}`}>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 px-1">Income</h3>
        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-none">
            <table className="w-full text-xs table-auto" style={{ minWidth: showMonthlyColumns ? "1400px" : "600px" }}>
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 z-20">
                <tr>
                  <th
                    className="p-2.5 text-left font-medium text-gray-600 border-r border-gray-100 sticky left-0 bg-gray-50/80 z-20 text-xs uppercase tracking-wide"
                    style={{
                      width: `${lineItemColumnWidth}px`,
                      minWidth: `${lineItemColumnWidth}px`,
                      maxWidth: `${lineItemColumnWidth}px`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">Line Item</span>
                      <div
                        onMouseDown={handleResizeStart}
                        onTouchStart={handleResizeStart}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 bg-gray-200 transition-colors touch-none"
                        title="Drag to resize column"
                      />
                    </div>
                  </th>
                  <th className="p-2.5 text-right font-medium text-gray-600 border-r border-gray-100 w-[100px] min-w-[100px] max-w-[100px] text-xs uppercase tracking-wide">
                    Per Unit
                  </th>
                  <th className="p-2.5 text-right font-medium text-blue-600 border-r border-gray-100 w-[120px] min-w-[120px] max-w-[120px] text-xs uppercase tracking-wide">
                    Doc Total
                  </th>
                  <th
                    className={`p-2.5 text-right font-medium text-emerald-600 border-r border-gray-100 w-[120px] min-w-[120px] max-w-[120px] text-xs uppercase tracking-wide`}
                  >
                    Calc Total
                  </th>
                  {showMonthlyColumns &&
                    months.map((month) => (
                      <th
                        key={month}
                        className="p-2.5 text-right font-medium text-gray-500 w-[90px] min-w-[90px] max-w-[90px] border-r border-gray-100 text-xs"
                      >
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                      </th>
                    ))}
                  <th
                    className={`p-2.5 text-left font-medium text-gray-600 ${showMonthlyColumns ? "w-[150px] min-w-[150px]" : "w-[200px] min-w-[200px]"} text-xs uppercase tracking-wide`}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">{incomeItems.map((item) => renderLineItem(item, incomeItems, setIncomeItems, 0))}</tbody>
            </table>
          </div>
        </div>
      </div>
      {/* </CHANGE> */}

      <div className={`${mobileSection !== "expense" ? "hidden md:block" : ""}`}>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 px-1">Expenses</h3>
        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-none">
            <table className="w-full text-xs table-auto" style={{ minWidth: showMonthlyColumns ? "1400px" : "600px" }}>
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 z-20">
                <tr>
                  <th
                    className="p-2.5 text-left font-medium text-gray-600 border-r border-gray-100 sticky left-0 bg-gray-50/80 z-20 text-xs uppercase tracking-wide"
                    style={{
                      width: `${lineItemColumnWidth}px`,
                      minWidth: `${lineItemColumnWidth}px`,
                      maxWidth: `${lineItemColumnWidth}px`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">Line Item</span>
                      <div
                        onMouseDown={handleResizeStart}
                        onTouchStart={handleResizeStart}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 bg-gray-200 transition-colors touch-none"
                        title="Drag to resize column"
                      />
                    </div>
                  </th>
                  <th className="p-2.5 text-right font-medium text-gray-600 border-r border-gray-100 w-[100px] min-w-[100px] max-w-[100px] text-xs uppercase tracking-wide">
                    Per Unit
                  </th>
                  <th className="p-2.5 text-right font-medium text-blue-600 border-r border-gray-100 w-[120px] min-w-[120px] max-w-[120px] text-xs uppercase tracking-wide">
                    Doc Total
                  </th>
                  <th
                    className={`p-2.5 text-right font-medium text-emerald-600 border-r border-gray-100 w-[100px] min-w-[100px] max-w-[100px] text-xs uppercase tracking-wide`}
                  >
                    Calc Total
                  </th>
                  {showMonthlyColumns &&
                    months.map((month) => (
                      <th
                        key={month}
                        className="p-2.5 text-right font-medium text-gray-500 w-[70px] min-w-[70px] max-w-[70px] border-r border-gray-100 text-xs"
                      >
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                      </th>
                    ))}
                  <th
                    className={`p-2.5 text-left font-medium text-gray-600 ${showMonthlyColumns ? "w-[150px] min-w-[150px]" : "w-[200px] min-w-[200px]"} text-xs uppercase tracking-wide`}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">{expenseItems.map((item) => renderLineItem(item, expenseItems, setExpenseItems, 0))}</tbody>
            </table>
          </div>
        </div>
      </div>
      {/* </CHANGE> */}

      <div className={`${mobileSection !== "expense" ? "hidden md:block" : ""}`}>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 px-1">Capital Expenditures</h3>
        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-none">
            <table className="w-full text-xs table-auto" style={{ minWidth: showMonthlyColumns ? "1400px" : "600px" }}>
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 z-20">
                <tr>
                  <th
                    className="p-2.5 text-left font-medium text-gray-600 border-r border-gray-100 sticky left-0 bg-gray-50/80 z-20 text-xs uppercase tracking-wide"
                    style={{
                      width: `${lineItemColumnWidth}px`,
                      minWidth: `${lineItemColumnWidth}px`,
                      maxWidth: `${lineItemColumnWidth}px`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">Line Item</span>
                      <div
                        onMouseDown={handleResizeStart}
                        onTouchStart={handleResizeStart}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 bg-gray-200 transition-colors touch-none"
                        title="Drag to resize column"
                      />
                    </div>
                  </th>
                  <th className="p-2.5 text-right font-medium text-gray-600 border-r border-gray-100 w-[100px] min-w-[100px] max-w-[100px] text-xs uppercase tracking-wide">
                    Per Unit
                  </th>
                  <th className="p-2.5 text-right font-medium text-blue-600 border-r border-gray-100 w-[120px] min-w-[120px] max-w-[120px] text-xs uppercase tracking-wide">
                    Doc Total
                  </th>
                  <th
                    className={`p-2.5 text-right font-medium text-emerald-600 border-r border-gray-100 w-[100px] min-w-[100px] max-w-[100px] text-xs uppercase tracking-wide`}
                  >
                    Calc Total
                  </th>
                  {showMonthlyColumns &&
                    months.map((month) => (
                      <th
                        key={month}
                        className="p-2.5 text-right font-medium text-gray-500 w-[70px] min-w-[70px] max-w-[70px] border-r border-gray-100 text-xs"
                      >
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                      </th>
                    ))}
                  <th
                    className={`p-2.5 text-left font-medium text-gray-600 ${showMonthlyColumns ? "w-[150px] min-w-[150px]" : "w-[200px] min-w-[200px]"} text-xs uppercase tracking-wide`}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">{capitalItems.map((item) => renderLineItem(item, capitalItems, setCapitalItems, 0))}</tbody>
            </table>
          </div>
        </div>
      </div>
      {/* </CHANGE> */}

      <div className={`${mobileSection !== "expense" ? "hidden md:block" : ""}`}>
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 px-1">Debt Service</h3>
        <div className="bg-white rounded-xl border border-gray-200/60 overflow-hidden shadow-sm">
          <div className="overflow-x-auto overflow-y-auto max-h-[60vh] md:max-h-none">
            <table className="w-full text-xs table-auto" style={{ minWidth: showMonthlyColumns ? "1400px" : "600px" }}>
              <thead className="bg-gray-50/80 border-b border-gray-100 sticky top-0 z-20">
                <tr>
                  <th
                    className="p-2.5 text-left font-medium text-gray-600 border-r border-gray-100 sticky left-0 bg-gray-50/80 z-20 text-xs uppercase tracking-wide"
                    style={{
                      width: `${lineItemColumnWidth}px`,
                      minWidth: `${lineItemColumnWidth}px`,
                      maxWidth: `${lineItemColumnWidth}px`,
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">Line Item</span>
                      <div
                        onMouseDown={handleResizeStart}
                        onTouchStart={handleResizeStart}
                        className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-400 bg-gray-200 transition-colors touch-none"
                        title="Drag to resize column"
                      />
                    </div>
                  </th>
                  <th className="p-2.5 text-right font-medium text-gray-600 border-r border-gray-100 w-[100px] min-w-[100px] max-w-[100px] text-xs uppercase tracking-wide">
                    Per Unit
                  </th>
                  <th className="p-2.5 text-right font-medium text-blue-600 border-r border-gray-100 w-[120px] min-w-[120px] max-w-[120px] text-xs uppercase tracking-wide">
                    Doc Total
                  </th>
                  <th
                    className={`p-2.5 text-right font-medium text-emerald-600 border-r border-gray-100 w-[100px] min-w-[100px] max-w-[100px] text-xs uppercase tracking-wide`}
                  >
                    Calc Total
                  </th>
                  {showMonthlyColumns &&
                    months.map((month) => (
                      <th
                        key={month}
                        className="p-2.5 text-right font-medium text-gray-500 w-[70px] min-w-[70px] max-w-[70px] border-r border-gray-100 text-xs"
                      >
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                      </th>
                    ))}
                  <th
                    className={`p-2.5 text-left font-medium text-gray-600 ${showMonthlyColumns ? "w-[150px] min-w-[150px]" : "w-[200px] min-w-[200px]"} text-xs uppercase tracking-wide`}
                  >
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">{debtItems.map((item) => renderLineItem(item, debtItems, setDebtItems, 0))}</tbody>
            </table>
          </div>
        </div>
      </div>
      {/* </CHANGE> */}

      <div className={`${mobileSection !== "noi" ? "hidden md:block" : "block"} px-1 sm:px-2 pb-4`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* NET OPERATING INCOME Card */}
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Net Operating Income
                </h3>
                <span className="text-xl font-semibold text-gray-900">${calculateNOI().toLocaleString('en-US')}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* NET CASH FLOW Card */}
          <div className="bg-white rounded-xl border border-gray-200/60 shadow-sm p-4 transition-all duration-200 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Net Cash Flow</h3>
                <span className="text-xl font-semibold text-gray-900">${calculateNCF().toLocaleString('en-US')}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
