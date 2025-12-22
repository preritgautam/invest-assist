"use client"

import { Upload, FileCheck, BarChart3, ArrowRight } from "lucide-react"

interface WorkflowStep {
  step: number
  icon: React.ReactNode
  title: string
  description: string
  details: string[]
}

const workflowSteps: WorkflowStep[] = [
  {
    step: 1,
    icon: <Upload className="w-8 h-8" />,
    title: "Upload Your Documents",
    description: "Drag and drop rent rolls, T-12 operating statements, and offering memorandums.",
    details: [
      "Support for PDF, Excel, and ZIP files",
      "Bulk upload multiple documents at once",
      "Auto-detect document types",
      "Email forwarding option available"
    ]
  },
  {
    step: 2,
    icon: <FileCheck className="w-8 h-8" />,
    title: "Validate & Configure",
    description: "AI extracts data and presents it for review. Configure column mappings and verify accuracy.",
    details: [
      "AI-powered data extraction",
      "Dynamic column mapping interface",
      "Inline editing for corrections",
      "Floor plan & occupancy analysis"
    ]
  },
  {
    step: 3,
    icon: <BarChart3 className="w-8 h-8" />,
    title: "Analyze & Invest",
    description: "Generate pro forma projections, calculate returns, and make confident investment decisions.",
    details: [
      "Pro Forma with hold period projections",
      "IRR, CoC, and Equity Multiple calculations",
      "Financing terms & debt modeling",
      "Comprehensive investment summary"
    ]
  }
]

export function Workflow() {
  return (
    <section id="how-it-works" className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Go from raw documents to actionable insights in three simple steps.
          </p>
        </div>

        {/* Workflow Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-1/2 -translate-x-1/2 w-2/3 h-0.5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {workflowSteps.map((step, index) => (
              <div key={step.step} className="relative">
                {/* Arrow between steps - Mobile */}
                {index < workflowSteps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <ArrowRight className="w-6 h-6 text-gray-400 rotate-90" />
                  </div>
                )}
                <WorkflowCard step={step} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function WorkflowCard({ step }: { step: WorkflowStep }) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Step Number Badge */}
      <div className="absolute -top-4 left-8 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
        {step.step}
      </div>

      {/* Icon */}
      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 text-gray-700">
        {step.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{step.title}</h3>
      <p className="text-gray-600 mb-6">{step.description}</p>

      {/* Details List */}
      <ul className="space-y-2">
        {step.details.map((detail, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
            {detail}
          </li>
        ))}
      </ul>
    </div>
  )
}
