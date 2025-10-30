import { Card, CardContent } from "@/components/ui/card"
import { Info, CheckCircle, AlertTriangle } from "lucide-react"

export function TipsCard() {
  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
            <Info className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Pro Forma Tips</h3>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>
                • <strong>Double-click</strong> any "Your UW" cell to edit values
              </li>
              <li>
                • Toggle between <strong>Total</strong> and <strong>Per Unit</strong> views
              </li>
              <li>
                • <strong>Green variance</strong> = better than in-place, <strong>Red</strong> = worse
              </li>
              <li>
                • Click <strong>+</strong> icon to expand T-12 monthly breakdown and validate OCR accuracy
              </li>
              <li>
                • <CheckCircle className="h-3 w-3 inline text-green-600" /> = totals match,{" "}
                <AlertTriangle className="h-3 w-3 inline text-amber-600" /> = check for OCR errors
              </li>
              <li>• Projections use growth rates shown under each line item</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
