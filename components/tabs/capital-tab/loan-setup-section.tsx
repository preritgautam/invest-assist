import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronDown } from "lucide-react"

interface LoanSetupSectionProps {
  cardId: string
  isOpen?: boolean
  onToggle: () => void
}

/**
 * Loan setup accordion section
 * Contains origination, term, and amortization settings
 */
export function LoanSetupSection({ cardId, isOpen, onToggle }: LoanSetupSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
        <span className="text-sm font-semibold text-gray-900">Loan Setup</span>
        <ChevronDown className="w-4 h-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-600">Origination Month</Label>
            <Select>
              <SelectTrigger className="h-10 sm:h-8 text-sm sm:text-xs">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jan">January</SelectItem>
                <SelectItem value="feb">February</SelectItem>
                <SelectItem value="mar">March</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Loan Term (months)</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="120" inputMode="numeric" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Amortization Period (years)</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="30" inputMode="numeric" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Interest-Only Period (months)</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="12" inputMode="numeric" />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
