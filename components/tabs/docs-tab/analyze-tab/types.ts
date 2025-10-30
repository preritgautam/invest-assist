/**
 * Type Definitions for Analyze Tab
 *
 * Centralized type definitions for the property analysis components.
 */

export interface DocumentData {
  // From Operating Statement
  actualRentCollected: number
  otherIncome: number
  totalOperatingExpenses: number
  propertyTaxes: number
  insurance: number
  payroll: number
  repairsMaintenance: number
  utilities: number
  contractServices: number
  managementFee: number
  replacementReserve: number
  totalNOI: number

  // From Rent Roll
  unitCount: number
  avgRentPerUnit: number
  marketRentPerUnit: number
  occupancyPercent: number
  lossToLeasePercent: number
  concessionsPercent: number
  vacancyLoss: number
  creditLoss: number

  // From Offering Memorandum
  propertyName: string
  yearBuilt: number
  renovationYear?: number
  squareFootage: number
  marketRentComparable: number
  marketVacancyRate: number
  expenseRatioBenchmark: number
}

export interface MarketData {
  marketRentSubmarket: number
  marketVacancyRate: number
  capRateBenchmark: number
  propertyTaxMillRate: number
  insuranceCostBenchmark: number
  expenseRatioBenchmark: number
  economicGrowthPercent: number
  inflationRate: number
  populationGrowth: number
}

export interface UserAssumptions {
  // Deal Overview
  purchasePrice: number
  holdPeriod: number
  reversionCapRate: number
  exitCostsPercent: number

  // Market & Income
  rentGrowth: number
  vacancyPercent: number
  creditLossPercent: number
  concessionsPercent: number
  otherIncomeGrowth: number

  // Expenses
  managementFeePercent: number
  payrollPerUnit: number
  repairsPerUnit: number
  utilitiesPerUnit: number
  insurancePerUnit: number
  marketingPerUnit: number
  contractServicesPerUnit: number
  replacementReservesPerUnit: number
  expenseInflation: number

  // Capital & Debt
  loanAmount: number
  ltvPercent: number
  interestRate: number
  amortizationYears: number
  loanTermYears: number
  interestOnlyYears: number
  dscrTarget: number
  initialReserves: number
  capexReservePerUnit: number
}

export interface AnalyzeTabProps {
  property?: any
}

export type SectionType = "documents" | "market" | "assumptions" | "analysis" | "scenarios"
