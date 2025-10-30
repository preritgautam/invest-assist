import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown } from "lucide-react"

interface SizingLimitsSectionProps {
  cardId: string
  isOpen?: boolean
  onToggle: () => void
}

/**
 * Sizing limits accordion section
 * Contains LTV, DSCR, and cap rate constraints
 */
export function SizingLimitsSection({ cardId, isOpen, onToggle }: SizingLimitsSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
        <span className="text-sm font-semibold text-gray-900">Sizing Limits</span>
        <ChevronDown className="w-4 h-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-xs font-semibold text-gray-600">LTV Limit (%)</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="75.0" inputMode="numeric" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">DSCR Limit (x)</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="1.25" inputMode="numeric" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Cap Rate (%)</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="5.5" inputMode="numeric" />
          </div>
          <div>
            <Label className="text-xs font-semibold text-gray-600">Min DSCR Month</Label>
            <Input className="h-10 sm:h-8 text-sm sm:text-xs" placeholder="Month 24" disabled />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
