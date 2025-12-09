"use client"

/**
 * Comprehensive Analyze Tab Component
 *
 * Facilitates property underwriting and analysis by integrating:
 * - Extracted data from Operating Statements (OS), Rent Roll (RR), Offering Memorandums (OMs)
 * - Market data from public APIs
 * - User input assumptions
 *
 * Features:
 * - Multi-section tabbed interface for data organization
 * - Interactive visualizations and charts
 * - Scenario comparison capabilities
 * - Detailed report generation
 * - Real-time calculations and metrics
 *
 * @version 1.0.0
 */

import { useState } from "react"
import { FileText, TrendingUp, Settings, BarChart3, GitCompare } from "lucide-react"
import type { AnalyzeTabProps, DocumentData, MarketData, UserAssumptions, SectionType } from "./analyze-tab/types"
import { DocumentDataSection } from "./analyze-tab/document-data-section"
import { MarketDataSection } from "./analyze-tab/market-data-section"
import { AssumptionsSection } from "./analyze-tab/assumptions-section"
import { AnalysisSection } from "./analyze-tab/analysis-section"
import { ScenariosSection } from "./analyze-tab/scenarios-section"

export function AnalyzeTab({ property }: AnalyzeTabProps) {
  const [activeSection, setActiveSection] = useState<SectionType>("documents")
  const [documentData, setDocumentData] = useState<Partial<DocumentData>>({
    propertyName: property?.name || "Sample Property",
    unitCount: 24,
    actualRentCollected: 360000,
    totalOperatingExpenses: 144000,
    totalNOI: 216000,
    occupancyPercent: 95,
    avgRentPerUnit: 1500,
    marketRentPerUnit: 1600,
    yearBuilt: 2010,
    squareFootage: 24000,
  })

  const [marketData, setMarketData] = useState<Partial<MarketData>>({
    marketRentSubmarket: 1550,
    marketVacancyRate: 5.5,
    capRateBenchmark: 6.5,
    inflationRate: 3.2,
    economicGrowthPercent: 2.8,
  })

  const [assumptions, setAssumptions] = useState<Partial<UserAssumptions>>({
    purchasePrice: 3500000,
    holdPeriod: 5,
    rentGrowth: 3.0,
    vacancyPercent: 5.0,
    managementFeePercent: 5.0,
    loanAmount: 2625000,
    ltvPercent: 75,
    interestRate: 5.5,
    amortizationYears: 30,
  })

  // Navigation sections
  const sections = [
    { id: "documents" as const, label: "Document Data", icon: <FileText className="w-4 h-4" /> },
    { id: "market" as const, label: "Market Data", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "assumptions" as const, label: "Assumptions", icon: <Settings className="w-4 h-4" /> },
    { id: "analysis" as const, label: "Analysis", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "scenarios" as const, label: "Scenarios", icon: <GitCompare className="w-4 h-4" /> },
  ]

  // Calculate key metrics
  const calculateMetrics = () => {
    const noi = documentData.totalNOI || 0
    const purchasePrice = assumptions.purchasePrice || 1
    const capRate = (noi / purchasePrice) * 100
    const debtService = ((assumptions.loanAmount || 0) * (assumptions.interestRate || 0)) / 100
    const cashFlow = noi - debtService
    const cocReturn = (cashFlow / (purchasePrice - (assumptions.loanAmount || 0))) * 100

    return {
      capRate: capRate.toFixed(2),
      noi: noi.toLocaleString('en-US'),
      cashFlow: cashFlow.toLocaleString('en-US'),
      cocReturn: cocReturn.toFixed(2),
      dscr: (noi / (debtService || 1)).toFixed(2),
    }
  }

  const metrics = calculateMetrics()

  // Render section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case "documents":
        return <DocumentDataSection data={documentData} setData={setDocumentData} />
      case "market":
        return <MarketDataSection data={marketData} setData={setMarketData} />
      case "assumptions":
        return <AssumptionsSection data={assumptions} setData={setAssumptions} />
      case "analysis":
        return <AnalysisSection metrics={metrics} documentData={documentData} assumptions={assumptions} />
      case "scenarios":
        return <ScenariosSection />
      default:
        return null
    }
  }

  return (
    <div className="space-y-2 p-2">
      <div className="bg-white border-b border-gray-200 px-2 py-1.5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Section Content */}
      <div className="bg-white border border-gray-200 p-3">{renderSectionContent()}</div>
    </div>
  )
}
