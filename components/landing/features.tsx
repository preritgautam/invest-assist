"use client"

import { 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  BarChart3, 
  Building, 
  TrendingUp,
  Layers,
  Calculator,
  Brain,
  ArrowLeftRight
} from "lucide-react"

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: <FileSpreadsheet className="w-6 h-6" />,
    title: "Rent Roll Extraction",
    description: "Automatically extract unit-level data from rent roll documents. AI identifies tenant info, lease terms, and charges with high accuracy."
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Operating Statement Processing",
    description: "Parse T-12 operating statements and income/expense data. Compare seller financials against your underwriting assumptions."
  },
  {
    icon: <Building className="w-6 h-6" />,
    title: "OM Analysis",
    description: "Extract key property details, market data, and investment highlights from offering memorandums automatically."
  },
  {
    icon: <Layers className="w-6 h-6" />,
    title: "Dynamic Column Mapping",
    description: "Intelligent column detection with configurable mapping. Handle any document format with custom field recognition."
  },
  {
    icon: <CheckCircle2 className="w-6 h-6" />,
    title: "Validation Workflow",
    description: "Review and verify extracted data with inline editing. Ensure accuracy before analysis with comprehensive validation tools."
  },
  {
    icon: <Calculator className="w-6 h-6" />,
    title: "Pro Forma Analysis",
    description: "Generate detailed pro forma projections with seller vs. underwriting comparisons. Model renovation scenarios and rent growth."
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Returns Analysis",
    description: "Calculate IRR, Cash-on-Cash returns, and Equity Multiples. Visualize cash flows across your hold period."
  },
  {
    icon: <ArrowLeftRight className="w-6 h-6" />,
    title: "Sources & Uses",
    description: "Track capital requirements, acquisition costs, and funding sources. Model debt and equity structures with ease."
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Insights",
    description: "Leverage machine learning to identify patterns, flag anomalies, and surface investment insights across your portfolio."
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need for CRE Underwriting
          </h2>
          <p className="text-lg text-gray-600">
            From document upload to investment analysis, Invest Assist provides a complete 
            toolkit for commercial real estate professionals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300">
      <div className="w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-4 group-hover:bg-gray-900 group-hover:border-gray-900 group-hover:text-white transition-all duration-300">
        <div className="text-gray-700 group-hover:text-white transition-colors duration-300">
          {feature.icon}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
    </div>
  )
}
