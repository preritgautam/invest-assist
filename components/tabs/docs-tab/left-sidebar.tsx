"use client"

import { Menu, FileText, TrendingUp, BarChart3 } from "lucide-react"

export function LeftSidebar() {
  return (
    <div className="w-20 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 flex flex-col items-center py-4 gap-6 shadow-sm">
      <button className="p-3 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:shadow-md">
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      <div className="flex flex-col items-center gap-4 mt-4">
        <button className="flex flex-col items-center gap-1 p-2 text-white bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:scale-105">
          <FileText className="w-5 h-5" />
          <span className="text-xs font-medium">Upload</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md">
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs font-medium">Analyze</span>
        </button>

        <button className="flex flex-col items-center gap-1 p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md">
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Report</span>
        </button>
      </div>
    </div>
  )
}
