/**
 * Lender Match Feature Component
 *
 * This component provides lender matching functionality for real estate properties.
 * It displays available loan options with detailed terms and allows users to select
 * the best financing option for their investment.
 *
 * @component
 * @example
 * <LenderMatchSection onSelectLoan={handleLoanSelection} />
 */

"use client"

import { useState } from "react"
import { Building2, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

/**
 * Loan option interface defining the structure of available financing options
 */
interface LoanOption {
  id: string
  lender: string
  loanAmount: number
  interestRate: number
  term: number
  monthlyPayment: number
  ltv: number
  dscr: number
  closingCosts: number
  prepaymentPenalty: string
  recourse: string
}

/**
 * Props interface for LenderMatchSection component
 */
interface LenderMatchSectionProps {
  /** Callback function triggered when a loan option is selected */
  onSelectLoan?: (loan: LoanOption) => void
}

/**
 * LenderMatchSection Component
 *
 * Displays a curated list of loan options from various lenders with detailed
 * terms and conditions. Users can compare options and select the best fit
 * for their investment strategy.
 */
export function LenderMatchSection({ onSelectLoan }: LenderMatchSectionProps) {
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)

  // Sample loan options data - in production, this would come from an API
  const loanOptions: LoanOption[] = [
    {
      id: "1",
      lender: "Capital Bank",
      loanAmount: 8500000,
      interestRate: 5.25,
      term: 30,
      monthlyPayment: 46950,
      ltv: 75,
      dscr: 1.35,
      closingCosts: 85000,
      prepaymentPenalty: "3-2-1",
      recourse: "Non-Recourse",
    },
    {
      id: "2",
      lender: "Metro Lending",
      loanAmount: 9000000,
      interestRate: 5.5,
      term: 25,
      monthlyPayment: 55800,
      ltv: 80,
      dscr: 1.25,
      closingCosts: 90000,
      prepaymentPenalty: "2-1-0",
      recourse: "Partial Recourse",
    },
    {
      id: "3",
      lender: "Prime Finance",
      loanAmount: 8000000,
      interestRate: 4.95,
      term: 30,
      monthlyPayment: 42480,
      ltv: 70,
      dscr: 1.45,
      closingCosts: 80000,
      prepaymentPenalty: "None",
      recourse: "Non-Recourse",
    },
  ]

  const handleSelectLoan = (loan: LoanOption) => {
    setSelectedLoan(loan.id)
    if (onSelectLoan) {
      onSelectLoan(loan)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Lender Match</h2>
        <div className="w-16 h-0.5 bg-gray-800 mx-auto mt-2"></div>
        <p className="text-sm text-gray-600 mt-2">Compare financing options from top lenders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loanOptions.map((loan) => (
          <Card
            key={loan.id}
            className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-200 ${
              selectedLoan === loan.id ? "border-gray-900 shadow-xl" : "border-gray-200 hover:border-gray-400"
            }`}
          >
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Building2 className="w-5 h-5 text-gray-700" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900">{loan.lender}</CardTitle>
                </div>
                {selectedLoan === loan.id && <CheckCircle2 className="w-6 h-6 text-gray-900" />}
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-4">
              {/* Loan amount and interest rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Loan Amount</span>
                  <span className="text-lg font-bold text-gray-900">${(loan.loanAmount / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Interest Rate</span>
                  <span className="text-lg font-bold text-gray-900">{loan.interestRate}%</span>
                </div>
              </div>

              {/* Loan terms */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Term</span>
                  <span className="text-sm font-semibold text-gray-900">{loan.term} years</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monthly Payment</span>
                  <span className="text-sm font-semibold text-gray-900">${loan.monthlyPayment.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">LTV</span>
                  <span className="text-sm font-semibold text-gray-900">{loan.ltv}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">DSCR</span>
                  <span className="text-sm font-semibold text-gray-900">{loan.dscr}x</span>
                </div>
              </div>

              {/* Additional terms */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Closing Costs</span>
                  <span className="text-sm font-semibold text-gray-900">${(loan.closingCosts / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Prepayment</span>
                  <span className="text-sm font-semibold text-gray-900">{loan.prepaymentPenalty}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recourse</span>
                  <span className="text-sm font-semibold text-gray-900">{loan.recourse}</span>
                </div>
              </div>

              {/* Select button */}
              <Button
                onClick={() => handleSelectLoan(loan)}
                className={`w-full mt-4 ${
                  selectedLoan === loan.id
                    ? "bg-gray-900 hover:bg-gray-800"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                }`}
              >
                {selectedLoan === loan.id ? "Selected" : "Select Loan"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
