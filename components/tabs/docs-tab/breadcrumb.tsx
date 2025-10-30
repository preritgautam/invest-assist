"use client"

import React from "react"
import { FileSpreadsheet, TrendingUp, BarChart3, ChevronRight, CheckCircle2, Lock } from "lucide-react"

interface BreadcrumbProps {
  activeSection: "t12" | "normalized" | "summary"
  allDocsValidated: boolean
  onSectionChange: (section: "t12" | "normalized" | "summary") => void
}

export function Breadcrumb({ activeSection, allDocsValidated, onSectionChange }: BreadcrumbProps) {
  const steps = [
    { id: "t12", label: "Upload", icon: FileSpreadsheet, enabled: true },
    { id: "normalized", label: "Analyze", icon: TrendingUp, enabled: allDocsValidated },
    { id: "summary", label: "Report", icon: BarChart3, enabled: allDocsValidated },
  ]

  return (
    <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-2 overflow-x-auto">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isActive = activeSection === step.id
          const isCompleted =
            (step.id === "t12" && allDocsValidated) || (step.id === "normalized" && activeSection === "summary")

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => step.enabled && onSectionChange(step.id as typeof activeSection)}
                disabled={!step.enabled}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md"
                    : isCompleted
                      ? "bg-green-50 text-green-700 hover:bg-green-100 border border-green-300"
                      : step.enabled
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-gray-50 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{step.label}</span>
                {isCompleted && <CheckCircle2 className="w-4 h-4" />}
                {!step.enabled && <Lock className="w-3 h-3" />}
              </button>
              {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
