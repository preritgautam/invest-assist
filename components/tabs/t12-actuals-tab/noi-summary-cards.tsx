import { TrendingUp, DollarSign } from "lucide-react"

interface NOISummaryCardsProps {
  noi: number
  ncf: number
  mobileSection: "income" | "expense" | "noi"
}

export function NOISummaryCards({ noi, ncf, mobileSection }: NOISummaryCardsProps) {
  return (
    <div className={`${mobileSection !== "noi" ? "hidden md:block" : "block"} px-2 sm:px-4 pb-4`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                Net Operating Income
              </h3>
              <span className="text-base font-semibold text-gray-900">${noi.toLocaleString()}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2.5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">Net Cash Flow</h3>
              <span className="text-base font-semibold text-gray-900">${ncf.toLocaleString()}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
