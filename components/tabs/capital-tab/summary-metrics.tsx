import { Card, CardContent } from "@/components/ui/card"
import { Building, CreditCard, RefreshCw, FileX } from "lucide-react"

/**
 * Summary metrics tiles component
 * Displays key financing metrics at a glance
 */
export function SummaryMetrics() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {/* Total Loan Amount Tile */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Building className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Total Loan Amount</p>
              <p className="text-sm font-bold text-gray-900">$11,900,000</p>
              <p className="text-xs text-gray-500">Primary</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-gray-200 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Weighted Avg Interest Rate</p>
              <p className="text-sm font-bold text-gray-900">4.25%</p>
              <p className="text-xs text-gray-500">Annual</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-gray-300 rounded-lg">
              <RefreshCw className="w-5 h-5 text-gray-800" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Weighted Avg Term</p>
              <p className="text-sm font-bold text-gray-900">10 Years</p>
              <p className="text-xs text-gray-500">Maturity</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileX className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Total Financing Costs</p>
              <p className="text-sm font-bold text-gray-900">$144,000</p>
              <p className="text-xs text-gray-500">At Close</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardContent className="p-4">
          <div className="flex flex-col items-center text-center gap-2">
            <div className="p-2 bg-gray-200 rounded-lg">
              <CreditCard className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Next 12M Interest</p>
              <p className="text-sm font-bold text-gray-900">$505,750</p>
              <p className="text-xs text-gray-500">Year 1</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
