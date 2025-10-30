import type React from "react"
/**
 * Type definitions for Capital Tab component
 */

/**
 * Basic property interface for component identification
 */
export interface Property {
  id: string
  name: string
  address: string
  isActive: boolean
}

/**
 * Props interface for the CapitalTab component
 * @param property - Selected property for debt analysis
 */
export interface DebtAssumptionsTabProps {
  property: Property | null
}

/**
 * Interface for loan card configuration
 * Represents different types of debt instruments
 */
export interface LoanCard {
  id: string
  title: string
  icon: React.ReactNode
  nickname: string
  includeInModel: boolean
}

/**
 * Interface for amortization period data
 */
export interface AmortizationPeriodData {
  beginningBalance: number
  drawdowns: number
  interestExpense: number
  amortization: number
  repayments: number
  endingBalance: number
}

/**
 * Type for amortization data structure
 */
export type AmortizationData = Record<string, AmortizationPeriodData>

/**
 * Type for accordion state management
 */
export type AccordionState = Record<string, Record<string, boolean>>
