import type { MonthlyData } from "./types"

export const formatCurrency = (value: number, compact = false): string => {
  const absValue = Math.abs(value)
  if (compact && absValue >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (compact && absValue >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`
  }
  return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export const formatPerUnit = (value: number, units: number): string => {
  return `$${(value / units).toFixed(0)}/unit`
}

export const calculateMonthlySum = (monthlyData?: MonthlyData[]): number => {
  if (!monthlyData) return 0
  return monthlyData.reduce((sum, month) => sum + month.value, 0)
}

export const validateTotal = (monthlyData?: MonthlyData[], documentTotal?: number): boolean => {
  if (!monthlyData || documentTotal === undefined) return true
  const calculatedTotal = calculateMonthlySum(monthlyData)
  const tolerance = Math.abs(documentTotal) * 0.01 // 1% tolerance
  return Math.abs(calculatedTotal - documentTotal) <= tolerance
}

export const calculateVariance = (inPlace: number, yourUnderwriting: number) => {
  if (inPlace === 0) return { dollar: yourUnderwriting, percent: 0 }
  const dollar = yourUnderwriting - inPlace
  const percent = (dollar / Math.abs(inPlace)) * 100
  return { dollar, percent }
}

export const getVarianceColor = (variance: number, isExpense: boolean) => {
  // For expenses: negative variance (lower) is good (green)
  // For income: positive variance (higher) is good (green)
  if (isExpense) {
    return variance < 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
  } else {
    return variance > 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
  }
}

export const calculateProjection = (baseValue: number, growthRate: number, year: number) => {
  return baseValue * Math.pow(1 + growthRate / 100, year)
}

export const generateMonthlyData = (annualTotal: number): MonthlyData[] => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  return months.map((month) => ({
    month,
    value: annualTotal / 12 + (Math.random() - 0.5) * (annualTotal / 12) * 0.1, // Add some variance
  }))
}
