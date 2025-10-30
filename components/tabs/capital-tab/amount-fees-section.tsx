import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

interface AmountFeesSectionProps {
  cardId: string
  isOpen?: boolean
  onToggle: () => void
}

/**
 * Amount and fees accordion section
 * Contains loan amount, points, and closing costs
 */
export function AmountFeesSection({ cardId, isOpen, onToggle }: AmountFeesSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
        <span className="text-sm font-semibold text-gray-900">Amount & Fees</span>
        <ChevronDown className="w-4 h-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-600">Loan Amount</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="$11,900,000" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Points (%)</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="1.0" inputMode="numeric" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Other Closing Costs</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="$25,000" inputMode="numeric" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Total Financing Costs</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="$144,000" disabled />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
