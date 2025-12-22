"use client"

import { Zap, Target, Clock, ShieldCheck } from "lucide-react"

interface Benefit {
  icon: React.ReactNode
  title: string
  description: string
  stat: string
  statLabel: string
}

const benefits: Benefit[] = [
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Save Hours Per Deal",
    description: "Eliminate manual data entry and spreadsheet juggling. Extract rent roll and financial data in minutes, not hours.",
    stat: "10x",
    statLabel: "Faster Processing"
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Improve Accuracy",
    description: "AI-powered extraction with human review ensures data integrity. Catch discrepancies before they become costly mistakes.",
    stat: "99%",
    statLabel: "Data Accuracy"
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "CRE-Focused Workflow",
    description: "Purpose-built for commercial real estate underwriting. Every feature designed around how you actually analyze deals.",
    stat: "100%",
    statLabel: "CRE-Focused"
  },
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Reduce Manual Effort",
    description: "Automate repetitive tasks like rent roll reconciliation, T-12 normalization, and pro forma generation.",
    stat: "80%",
    statLabel: "Less Manual Work"
  }
]

export function WhyUs() {
  return (
    <section id="why-us" className="py-20 sm:py-28 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Why Choose Invest Assist?
          </h2>
          <p className="text-lg text-gray-400">
            Built by CRE professionals, for CRE professionals. We understand the 
            nuances of multifamily and commercial property underwriting.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} />
          ))}
        </div>
      </div>
    </section>
  )
}

function BenefitCard({ benefit }: { benefit: Benefit }) {
  return (
    <div className="relative bg-gray-800/50 rounded-2xl border border-gray-700/50 p-8 hover:bg-gray-800/70 transition-colors duration-300">
      <div className="flex items-start gap-6">
        {/* Icon */}
        <div className="w-14 h-14 bg-gray-700/50 rounded-xl flex items-center justify-center flex-shrink-0 text-white">
          {benefit.icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
          <p className="text-gray-400 mb-4">{benefit.description}</p>
          
          {/* Stat */}
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{benefit.stat}</span>
            <span className="text-sm text-gray-500">{benefit.statLabel}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
