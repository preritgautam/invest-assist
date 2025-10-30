import type { MonthlyData, LineItem } from "./types"

export const calculateMonthlyPayment = (
  principal: number,
  annualInterestRate: number,
  amortizationYears: number,
): number => {
  const monthlyInterestRate = annualInterestRate / 100 / 12
  const numberOfPayments = amortizationYears * 12

  if (monthlyInterestRate === 0) {
    return principal / numberOfPayments
  }

  const numerator = monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)
  const denominator = Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1
  return principal * (numerator / denominator)
}

export const calculateLoanBalance = (
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
    (monthlyPayment * (1 - Math.pow(1 + monthlyInterestRate, -numberOfPaymentsRemaining))) / monthlyInterestRate

  return balance
}

export const calculateMonthlySum = (monthlyData: MonthlyData | undefined): number => {
  if (!monthlyData) return 0
  const sum = Object.values(monthlyData).reduce((acc, val) => acc + (val || 0), 0)
  return sum
}

export const isDiscrepancyAcceptable = (discrepancy: number, annualAmount: number): boolean => {
  const absDiscrepancy = Math.abs(discrepancy)
  if (absDiscrepancy <= 5) return true
  if (annualAmount < 10000) return absDiscrepancy <= 20
  if (annualAmount < 100000) return absDiscrepancy <= 100
  return absDiscrepancy <= 100
}

export const findItem = (items: LineItem[], id: string): LineItem | undefined => {
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

export const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const
