import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Input } from "@/components/ui/input"
import { ChevronDown } from "lucide-react"

interface TimingStatusSectionProps {
  cardId: string
  isOpen?: boolean
  onToggle: () => void
}

/**
 * Timing and status accordion section
 * Contains period-by-period draws and repayments
 */
export function TimingStatusSection({ cardId, isOpen, onToggle }: TimingStatusSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
        <span className="text-sm font-semibold text-gray-900">Timing & Status</span>
        <ChevronDown className="w-4 h-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Period</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Draws</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Repayments</th>
                <th className="text-left py-2 px-2 text-xs font-semibold text-gray-900">Notes</th>
              </tr>
            </thead>
            <tbody>
              {["At Close", "Y1", "Y2", "Y3", "Y4", "Y5", "Y6", "Y7", "Y8", "Y9", "Y10"].map((period) => (
                <tr key={period} className="border-b border-gray-100">
                  <td className="py-2 px-2 text-xs text-gray-900 font-medium">{period}</td>
                  <td className="py-2 px-2">
                    <Input className="h-6 text-xs" placeholder="$0" />
                  </td>
                  <td className="py-2 px-2">
                    <Input className="h-6 text-xs" placeholder="$0" />
                  </td>
                  <td className="py-2 px-2">
                    <Input className="h-6 text-xs" placeholder="Notes..." />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
