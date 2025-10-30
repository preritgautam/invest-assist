export interface MonthlyData {
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

export interface LineItem {
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
  isCalculated?: boolean
  isMajorTotal?: boolean
  hasFormula?: boolean
  formula?: string
  label?: string
  hasChildren?: boolean
}

export interface ValidationItem {
  lineItem: string
  extractedValue: number
  verified: boolean
}

export interface NormalizedAssumptions {
  holdPeriod: number
  exitCapRate: number
  rentGrowth: number
  expenseGrowth: number
  vacancyRate: number
  managementFeeRate: number
  replacementReserves: number
  exitCosts: number
  purchasePrice: number
  loanAmount: number
  interestRate: number
  loanTermYears: number
  amortizationYears: number
  acquisitionFee: number
  dispositionFee: number
  brokerFee: number
  closingCosts: number
  reservesInitial: number
}

export interface NormalizedLineItem extends LineItem {
  t12Actual: number
  underwritten: number
  variance: number
  variancePercent: number
  adjustmentReason?: string
}

export interface InvestorStructure {
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

export interface ValuationInputs {
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

export interface YearlyCashflow {
  year: number
  noi: number
  debtService: number
  cashflowToEquity: number
  dscr: number
  cocReturn: number
}

export interface SummaryMetrics {
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

export interface T12ActualsTabProps {
  property: any
  onValidate?: () => void
  validated?: boolean
  onUnvalidate?: () => void
}
