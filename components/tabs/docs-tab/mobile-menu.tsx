"use client"
import { X, FileSpreadsheet, TrendingUp, BarChart3, Lock } from "lucide-react"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  activeSection: "t12" | "normalized" | "summary"
  allDocsValidated: boolean
  onSectionChange: (section: "t12" | "normalized" | "summary") => void
}

export function MobileMenu({ isOpen, onClose, activeSection, allDocsValidated, onSectionChange }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose}>
      <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Menu</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div>
            <button
              onClick={() => {
                onSectionChange("t12")
                onClose()
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "t12" ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <FileSpreadsheet className="w-5 h-5" />
              <span className="font-medium">Upload Documents</span>
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                if (allDocsValidated) {
                  onSectionChange("normalized")
                  onClose()
                }
              }}
              disabled={!allDocsValidated}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "normalized"
                  ? "bg-blue-50 text-blue-600"
                  : allDocsValidated
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Analyze</span>
              {!allDocsValidated && <Lock className="w-4 h-4 ml-auto" />}
            </button>
          </div>

          <div>
            <button
              onClick={() => {
                if (allDocsValidated) {
                  onSectionChange("summary")
                  onClose()
                }
              }}
              disabled={!allDocsValidated}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeSection === "summary"
                  ? "bg-blue-50 text-blue-600"
                  : allDocsValidated
                    ? "text-gray-700 hover:bg-gray-100"
                    : "text-gray-400 cursor-not-allowed"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="font-medium">Report</span>
              {!allDocsValidated && <Lock className="w-4 h-4 ml-auto" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
