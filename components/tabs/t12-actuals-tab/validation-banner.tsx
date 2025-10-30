"use client"

import { CheckCircle2, Edit3 } from "lucide-react"

interface ValidationBannerProps {
  validated: boolean
  onValidate?: () => void
  onUnvalidate?: () => void
}

export function ValidationBanner({ validated, onValidate, onUnvalidate }: ValidationBannerProps) {
  return (
    <div className="bg-white rounded-lg border p-2 sm:p-3 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-xs text-gray-600">
          {validated ? (
            <span className="text-green-600 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              T-12 / OS Data Validated
            </span>
          ) : (
            <span>Review all line items and validate the data before proceeding</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {validated && (
            <button
              onClick={onUnvalidate}
              className="px-2 sm:px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>
          )}
          <button
            onClick={onValidate}
            disabled={validated}
            className={`px-3 sm:px-4 py-1.5 rounded text-xs sm:text-sm font-medium transition-colors ${
              validated ? "bg-green-100 text-green-700 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {validated ? "✓ Validated" : "Validate Data"}
          </button>
        </div>
      </div>
    </div>
  )
}
