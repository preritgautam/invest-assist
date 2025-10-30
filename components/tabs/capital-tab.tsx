"use client"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { FileX } from "lucide-react"
import { useState } from "react"
import type { DebtAssumptionsTabProps, LoanCard as LoanCardType, AccordionState } from "./capital-tab/types"
import { INITIAL_LOAN_CARDS, INITIAL_AMORTIZATION_DATA } from "./capital-tab/mock-data"
import { parseCurrency } from "./capital-tab/utils"
import { SummaryMetrics } from "./capital-tab/summary-metrics"
import { LoanCard } from "./capital-tab/loan-card"
import { AmortizationGrid } from "./capital-tab/amortization-grid"

/**
 * CapitalTab Component
 *
 * Main component for managing financing terms, debt assumptions, and loan analysis.
 * Provides comprehensive interface for loan setup, amortization tracking, and lender matching.
 */
export function CapitalTab({ property }: DebtAssumptionsTabProps) {
  const [loanCards, setLoanCards] = useState<LoanCardType[]>(INITIAL_LOAN_CARDS)
  const [openAccordions, setOpenAccordions] = useState<AccordionState>({})
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [amortizationData, setAmortizationData] = useState(INITIAL_AMORTIZATION_DATA)
  const [selectedPeriod, setSelectedPeriod] = useState("At Close")

  /**
   * Toggle accordion section open/closed state
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
   */
  const updateLoanCard = (id: string, updates: Partial<LoanCardType>) => {
    setLoanCards((prev) => prev.map((card) => (card.id === id ? { ...card, ...updates } : card)))
  }

  /**
   * Handle inline cell editing in amortization grid
   */
  const handleCellEdit = (period: string, field: string, value: string) => {
    const numValue = parseCurrency(value)
    setAmortizationData((prev) => ({
      ...prev,
      [period]: {
        ...prev[period],
        [field]: numValue,
      },
    }))
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

      <SummaryMetrics />

      <div className="space-y-4 sm:space-y-6">
        {loanCards.map((loanCard) => (
          <LoanCard
            key={loanCard.id}
            loanCard={loanCard}
            openAccordions={openAccordions}
            onToggleAccordion={toggleAccordion}
            onUpdateCard={updateLoanCard}
          />
        ))}
      </div>

      <AmortizationGrid
        data={amortizationData}
        editingCell={editingCell}
        selectedPeriod={selectedPeriod}
        onCellEdit={handleCellEdit}
        onSetEditingCell={setEditingCell}
        onSetSelectedPeriod={setSelectedPeriod}
      />
    </div>
  )
}
