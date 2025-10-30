"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Trash2, RotateCcw } from "lucide-react"
import type { LoanCard as LoanCardType, AccordionState } from "./types"
import { LoanSetupSection } from "./loan-setup-section"
import { SizingLimitsSection } from "./sizing-limits-section"
import { AmountFeesSection } from "./amount-fees-section"
import { TimingStatusSection } from "./timing-status-section"

interface LoanCardProps {
  loanCard: LoanCardType
  openAccordions: AccordionState
  onToggleAccordion: (cardId: string, section: string) => void
  onUpdateCard: (id: string, updates: Partial<LoanCardType>) => void
}

/**
 * Individual loan card component
 * Displays and manages a single debt instrument
 */
export function LoanCard({ loanCard, openAccordions, onToggleAccordion, onUpdateCard }: LoanCardProps) {
  return (
    <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
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
                  onCheckedChange={(checked) => onUpdateCard(loanCard.id, { includeInModel: checked })}
                />
                <Label className="text-xs text-gray-600">Include in Model</Label>
              </div>
            </div>
          </div>
          {/* Loan Card Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <Input
              value={loanCard.nickname}
              onChange={(e) => onUpdateCard(loanCard.id, { nickname: e.target.value })}
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
        <LoanSetupSection
          cardId={loanCard.id}
          isOpen={openAccordions[loanCard.id]?.setup}
          onToggle={() => onToggleAccordion(loanCard.id, "setup")}
        />

        <SizingLimitsSection
          cardId={loanCard.id}
          isOpen={openAccordions[loanCard.id]?.sizing}
          onToggle={() => onToggleAccordion(loanCard.id, "sizing")}
        />

        <AmountFeesSection
          cardId={loanCard.id}
          isOpen={openAccordions[loanCard.id]?.amount}
          onToggle={() => onToggleAccordion(loanCard.id, "amount")}
        />

        <TimingStatusSection
          cardId={loanCard.id}
          isOpen={openAccordions[loanCard.id]?.timing}
          onToggle={() => onToggleAccordion(loanCard.id, "timing")}
        />

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
  )
}
