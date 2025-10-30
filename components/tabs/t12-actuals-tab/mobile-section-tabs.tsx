"use client"

interface MobileSectionTabsProps {
  mobileSection: "income" | "expense" | "noi"
  setMobileSection: (section: "income" | "expense" | "noi") => void
}

export function MobileSectionTabs({ mobileSection, setMobileSection }: MobileSectionTabsProps) {
  return (
    <div className="md:hidden bg-white rounded-lg border p-2 shadow-sm">
      <div className="flex gap-1 overflow-x-auto">
        <button
          onClick={() => setMobileSection("income")}
          className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            mobileSection === "income" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setMobileSection("expense")}
          className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            mobileSection === "expense" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setMobileSection("noi")}
          className={`flex-1 px-3 py-2 rounded text-xs font-medium transition-colors whitespace-nowrap ${
            mobileSection === "noi" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          NOI
        </button>
      </div>
    </div>
  )
}
