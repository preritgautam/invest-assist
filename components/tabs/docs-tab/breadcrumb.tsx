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
    <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3">
      <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-gray-100/60 rounded-xl">
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
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-gray-900 shadow-sm"
                    : isCompleted
                      ? "text-green-600 hover:bg-white/60"
                      : step.enabled
                        ? "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                        : "text-gray-400 cursor-not-allowed"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="whitespace-nowrap">{step.label}</span>
                {isCompleted && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                {!step.enabled && <Lock className="w-3 h-3" />}
              </button>
              {index < steps.length - 1 && <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
