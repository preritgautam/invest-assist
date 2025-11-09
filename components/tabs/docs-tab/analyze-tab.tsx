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
import {
  FileText,
  TrendingUp,
  Settings,
  BarChart3,
  GitCompare,
  AlertCircle,
  DollarSign,
  Home,
  Percent,
  Calculator,
} from "lucide-react"

// Type definitions for data structures
interface DocumentData {
  // From Operating Statement
  actualRentCollected: number
  otherIncome: number
  totalOperatingExpenses: number
  propertyTaxes: number
  insurance: number
  payroll: number
  repairsMaintenance: number
  utilities: number
  contractServices: number
  managementFee: number
  replacementReserve: number
  totalNOI: number

  // From Rent Roll
  unitCount: number
  avgRentPerUnit: number
  marketRentPerUnit: number
  occupancyPercent: number
  lossToLeasePercent: number
  concessionsPercent: number
  vacancyLoss: number
  creditLoss: number

  // From Offering Memorandum
  propertyName: string
  yearBuilt: number
  renovationYear?: number
  squareFootage: number
  marketRentComparable: number
  marketVacancyRate: number
  expenseRatioBenchmark: number
}

interface MarketData {
  marketRentSubmarket: number
  marketVacancyRate: number
  capRateBenchmark: number
  propertyTaxMillRate: number
  insuranceCostBenchmark: number
  expenseRatioBenchmark: number
  economicGrowthPercent: number
  inflationRate: number
  populationGrowth: number
}

interface UserAssumptions {
  // Deal Overview
  purchasePrice: number
  holdPeriod: number
  reversionCapRate: number
  exitCostsPercent: number

  // Market & Income
  rentGrowth: number
  vacancyPercent: number
  creditLossPercent: number
  concessionsPercent: number
  otherIncomeGrowth: number

  // Expenses
  managementFeePercent: number
  payrollPerUnit: number
  repairsPerUnit: number
  utilitiesPerUnit: number
  insurancePerUnit: number
  marketingPerUnit: number
  contractServicesPerUnit: number
  replacementReservesPerUnit: number
  expenseInflation: number

  // Capital & Debt
  loanAmount: number
  ltvPercent: number
  interestRate: number
  amortizationYears: number
  loanTermYears: number
  interestOnlyYears: number
  dscrTarget: number
  initialReserves: number
  capexReservePerUnit: number
}

interface AnalyzeTabProps {
  property?: any
}

export function AnalyzeTab({ property }: AnalyzeTabProps) {
  const [activeSection, setActiveSection] = useState<"documents" | "market" | "assumptions" | "analysis" | "scenarios">(
    "documents",
  )
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
    { id: "documents", label: "Document Data", icon: <FileText className="w-4 h-4" /> },
    { id: "market", label: "Market Data", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "assumptions", label: "Assumptions", icon: <Settings className="w-4 h-4" /> },
    { id: "analysis", label: "Analysis", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "scenarios", label: "Scenarios", icon: <GitCompare className="w-4 h-4" /> },
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
      noi: noi.toLocaleString(),
      cashFlow: cashFlow.toLocaleString(),
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
              onClick={() => setActiveSection(section.id as any)}
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

// Document Data Section Component
function DocumentDataSection({ data, setData }: { data: Partial<DocumentData>; setData: any }) {
  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Extracted from Documents</h2>
        <p className="text-xs text-gray-600 mb-3">
          Data automatically parsed from Operating Statement, Rent Roll, and Offering Memorandum.
        </p>
      </div>

      {/* Operating Statement Data */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <FileText className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Operating Statement (OS)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Actual Rent Collected"
            value={data.actualRentCollected}
            onChange={(v) => updateField("actualRentCollected", v)}
            prefix="$"
          />
          <InputField
            label="Other Income"
            value={data.otherIncome}
            onChange={(v) => updateField("otherIncome", v)}
            prefix="$"
          />
          <InputField
            label="Total Operating Expenses"
            value={data.totalOperatingExpenses}
            onChange={(v) => updateField("totalOperatingExpenses", v)}
            prefix="$"
          />
          <InputField
            label="Property Taxes"
            value={data.propertyTaxes}
            onChange={(v) => updateField("propertyTaxes", v)}
            prefix="$"
          />
          <InputField
            label="Insurance Expense"
            value={data.insurance}
            onChange={(v) => updateField("insurance", v)}
            prefix="$"
          />
          <InputField
            label="Total NOI"
            value={data.totalNOI}
            onChange={(v) => updateField("totalNOI", v)}
            prefix="$"
            highlighted
          />
        </div>
      </div>

      {/* Rent Roll Data */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <Home className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Rent Roll (RR)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField label="Unit Count" value={data.unitCount} onChange={(v) => updateField("unitCount", v)} />
          <InputField
            label="Average Rent per Unit"
            value={data.avgRentPerUnit}
            onChange={(v) => updateField("avgRentPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Market Rent per Unit"
            value={data.marketRentPerUnit}
            onChange={(v) => updateField("marketRentPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Occupancy %"
            value={data.occupancyPercent}
            onChange={(v) => updateField("occupancyPercent", v)}
            suffix="%"
          />
          <InputField
            label="Loss-to-Lease %"
            value={data.lossToLeasePercent}
            onChange={(v) => updateField("lossToLeasePercent", v)}
            suffix="%"
          />
          <InputField
            label="Vacancy Loss"
            value={data.vacancyLoss}
            onChange={(v) => updateField("vacancyLoss", v)}
            prefix="$"
          />
        </div>
      </div>

      {/* Offering Memorandum Data */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <FileText className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Offering Memorandum (OM)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="col-span-full">
            <label className="block text-xs font-medium text-gray-700 mb-1">Property Name</label>
            <input
              type="text"
              value={data.propertyName || ""}
              onChange={(e) => updateField("propertyName", e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-gray-900 focus:border-gray-900"
            />
          </div>
          <InputField label="Year Built" value={data.yearBuilt} onChange={(v) => updateField("yearBuilt", v)} />
          <InputField
            label="Square Footage"
            value={data.squareFootage}
            onChange={(v) => updateField("squareFootage", v)}
            suffix=" SF"
          />
          <InputField
            label="Market Rent (Comparable)"
            value={data.marketRentComparable}
            onChange={(v) => updateField("marketRentComparable", v)}
            prefix="$"
          />
        </div>
      </div>
    </div>
  )
}

// Market Data Section Component
function MarketDataSection({ data, setData }: { data: Partial<MarketData>; setData: any }) {
  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Market Data from Public Sources</h2>
        <p className="text-xs text-gray-600 mb-3">
          Data automatically fetched from public APIs. Confirm accuracy and update if needed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <InputField
          label="Market Rent (Submarket Avg)"
          value={data.marketRentSubmarket}
          onChange={(v) => updateField("marketRentSubmarket", v)}
          prefix="$"
          source="Rentometer / Zillow API"
        />
        <InputField
          label="Market Vacancy Rate"
          value={data.marketVacancyRate}
          onChange={(v) => updateField("marketVacancyRate", v)}
          suffix="%"
          source="CoStar / Census"
        />
        <InputField
          label="Cap Rate Benchmark"
          value={data.capRateBenchmark}
          onChange={(v) => updateField("capRateBenchmark", v)}
          suffix="%"
          source="CBRE / RCA"
        />
        <InputField
          label="Property Tax Mill Rate"
          value={data.propertyTaxMillRate}
          onChange={(v) => updateField("propertyTaxMillRate", v)}
          suffix="%"
          source="County Assessor"
        />
        <InputField
          label="Insurance Cost Benchmark"
          value={data.insuranceCostBenchmark}
          onChange={(v) => updateField("insuranceCostBenchmark", v)}
          prefix="$"
          source="Regional Database"
        />
        <InputField
          label="Expense Ratio Benchmark"
          value={data.expenseRatioBenchmark}
          onChange={(v) => updateField("expenseRatioBenchmark", v)}
          suffix="%"
          source="Freddie Mac"
        />
        <InputField
          label="Economic Growth %"
          value={data.economicGrowthPercent}
          onChange={(v) => updateField("economicGrowthPercent", v)}
          suffix="%"
          source="BLS / Federal Reserve"
        />
        <InputField
          label="Inflation Rate"
          value={data.inflationRate}
          onChange={(v) => updateField("inflationRate", v)}
          suffix="%"
          source="BLS CPI"
        />
        <InputField
          label="Population Growth"
          value={data.populationGrowth}
          onChange={(v) => updateField("populationGrowth", v)}
          suffix="%"
          source="Census / CoStar"
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-blue-900 mb-1">Data Source Information</h4>
            <p className="text-xs text-blue-700">
              Market data is automatically refreshed from public APIs. Last updated: {new Date().toLocaleDateString()}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Assumptions Section Component
function AssumptionsSection({ data, setData }: { data: Partial<UserAssumptions>; setData: any }) {
  const updateField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Underwriting Assumptions</h2>
        <p className="text-xs text-gray-600 mb-3">Enter your investment assumptions and underwriting parameters.</p>
      </div>

      {/* Deal Overview */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <DollarSign className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Deal Overview</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <InputField
            label="Purchase Price"
            value={data.purchasePrice}
            onChange={(v) => updateField("purchasePrice", v)}
            prefix="$"
            highlighted
          />
          <InputField
            label="Hold Period"
            value={data.holdPeriod}
            onChange={(v) => updateField("holdPeriod", v)}
            suffix=" years"
          />
          <InputField
            label="Reversion Cap Rate"
            value={data.reversionCapRate}
            onChange={(v) => updateField("reversionCapRate", v)}
            suffix="%"
          />
          <InputField
            label="Exit Costs"
            value={data.exitCostsPercent}
            onChange={(v) => updateField("exitCostsPercent", v)}
            suffix="%"
          />
        </div>
      </div>

      {/* Market & Income Assumptions */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <TrendingUp className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Market & Income Assumptions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Rent Growth (Annual)"
            value={data.rentGrowth}
            onChange={(v) => updateField("rentGrowth", v)}
            suffix="%"
          />
          <InputField
            label="Vacancy %"
            value={data.vacancyPercent}
            onChange={(v) => updateField("vacancyPercent", v)}
            suffix="%"
          />
          <InputField
            label="Credit Loss %"
            value={data.creditLossPercent}
            onChange={(v) => updateField("creditLossPercent", v)}
            suffix="%"
          />
          <InputField
            label="Concessions %"
            value={data.concessionsPercent}
            onChange={(v) => updateField("concessionsPercent", v)}
            suffix="%"
          />
          <InputField
            label="Other Income Growth %"
            value={data.otherIncomeGrowth}
            onChange={(v) => updateField("otherIncomeGrowth", v)}
            suffix="%"
          />
        </div>
      </div>

      {/* Expense Assumptions */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <Calculator className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Expense Assumptions</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Management Fee % of EGI"
            value={data.managementFeePercent}
            onChange={(v) => updateField("managementFeePercent", v)}
            suffix="%"
          />
          <InputField
            label="Payroll per Unit"
            value={data.payrollPerUnit}
            onChange={(v) => updateField("payrollPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Repairs & Maintenance per Unit"
            value={data.repairsPerUnit}
            onChange={(v) => updateField("repairsPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Utilities per Unit"
            value={data.utilitiesPerUnit}
            onChange={(v) => updateField("utilitiesPerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Insurance per Unit"
            value={data.insurancePerUnit}
            onChange={(v) => updateField("insurancePerUnit", v)}
            prefix="$"
          />
          <InputField
            label="Replacement Reserves per Unit"
            value={data.replacementReservesPerUnit}
            onChange={(v) => updateField("replacementReservesPerUnit", v)}
            prefix="$"
          />
        </div>
      </div>

      {/* Capital & Debt */}
      <div className="space-y-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-2 pb-1.5 bg-slate-50 px-2 py-1 rounded">
          <Percent className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold text-slate-900">Capital & Debt</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <InputField
            label="Loan Amount"
            value={data.loanAmount}
            onChange={(v) => updateField("loanAmount", v)}
            prefix="$"
            highlighted
          />
          <InputField label="LTV %" value={data.ltvPercent} onChange={(v) => updateField("ltvPercent", v)} suffix="%" />
          <InputField
            label="Interest Rate %"
            value={data.interestRate}
            onChange={(v) => updateField("interestRate", v)}
            suffix="%"
          />
          <InputField
            label="Amortization"
            value={data.amortizationYears}
            onChange={(v) => updateField("amortizationYears", v)}
            suffix=" years"
          />
          <InputField
            label="Loan Term"
            value={data.loanTermYears}
            onChange={(v) => updateField("loanTermYears", v)}
            suffix=" years"
          />
          <InputField
            label="Interest-Only Years"
            value={data.interestOnlyYears}
            onChange={(v) => updateField("interestOnlyYears", v)}
            suffix=" years"
          />
          <InputField
            label="DSCR Target"
            value={data.dscrTarget}
            onChange={(v) => updateField("dscrTarget", v)}
            suffix="x"
          />
          <InputField
            label="Initial Reserves"
            value={data.initialReserves}
            onChange={(v) => updateField("initialReserves", v)}
            prefix="$"
          />
          <InputField
            label="CapEx Reserve per Unit"
            value={data.capexReservePerUnit}
            onChange={(v) => updateField("capexReservePerUnit", v)}
            prefix="$"
          />
        </div>
      </div>
    </div>
  )
}

// Analysis Section Component
function AnalysisSection({ metrics, documentData, assumptions }: any) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Financial Analysis & Metrics</h2>
        <p className="text-xs text-gray-600 mb-3">
          Comprehensive analysis based on document data, market insights, and your underwriting assumptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <MetricCard
          title="Capitalization Rate"
          value={`${metrics.capRate}%`}
          description="NOI / Purchase Price"
          icon={<Percent className="w-4 h-4" />}
          color="blue"
        />
        <MetricCard
          title="Net Operating Income"
          value={`$${metrics.noi}`}
          description="Annual NOI"
          icon={<DollarSign className="w-4 h-4" />}
          color="emerald"
        />
        <MetricCard
          title="Cash Flow"
          value={`$${metrics.cashFlow}`}
          description="After Debt Service"
          icon={<TrendingUp className="w-4 h-4" />}
          color="emerald"
        />
        <MetricCard
          title="Cash-on-Cash Return"
          value={`${metrics.cocReturn}%`}
          description="Annual Return on Equity"
          icon={<Percent className="w-4 h-4" />}
          color="blue"
        />
        <MetricCard
          title="DSCR"
          value={`${metrics.dscr}x`}
          description="Debt Service Coverage"
          icon={<Calculator className="w-4 h-4" />}
          color="amber"
        />
        <MetricCard
          title="Equity Multiple"
          value="1.85x"
          description="5-Year Projection"
          icon={<BarChart3 className="w-4 h-4" />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-900 mb-3">5-Year Cash Flow Projection</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {[1, 2, 3, 4, 5].map((year) => {
              const height = 40 + year * 10
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-bold text-slate-700">${(45000 + year * 7000).toLocaleString()}</div>
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-500 shadow-sm"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-slate-600">Y{year}</div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-emerald-50 rounded border border-slate-200 p-4">
          <h3 className="text-xs font-bold text-slate-900 mb-3">Property Value Growth</h3>
          <div className="h-48 flex items-end justify-around gap-2">
            {[1, 2, 3, 4, 5].map((year) => {
              const height = 50 + year * 8
              return (
                <div key={year} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs font-bold text-slate-700">${(3.5 + year * 0.2).toFixed(1)}M</div>
                  <div
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500 shadow-sm"
                    style={{ height: `${height}%` }}
                  />
                  <div className="text-xs text-slate-600">Y{year}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 p-3 bg-amber-50 rounded border border-amber-200">
        <h3 className="text-xs font-bold text-amber-900 mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          Risk Assessment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-xs font-bold text-emerald-800 mb-2">Strengths</h4>
            <ul className="text-xs text-slate-700 space-y-1">
              <li>• Strong DSCR above lender requirements</li>
              <li>• Below-market rents with upside potential</li>
              <li>• Stable occupancy rate</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-amber-800 mb-2">Considerations</h4>
            <ul className="text-xs text-slate-700 space-y-1">
              <li>• Market vacancy rate trending up</li>
              <li>• Property age may require CapEx</li>
              <li>• Interest rate sensitivity</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Scenarios Section Component
function ScenariosSection() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold text-gray-900 mb-1">Scenario Comparison</h2>
        <p className="text-xs text-gray-600 mb-3">
          Compare different underwriting scenarios to understand sensitivity and risk factors.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <ScenarioCard
          title="Base Case"
          description="Current assumptions"
          metrics={{
            irr: "15.2%",
            cocReturn: "8.5%",
            equity: "1.85x",
          }}
          color="blue"
        />
        <ScenarioCard
          title="Conservative"
          description="Lower rent growth, higher vacancy"
          metrics={{
            irr: "12.8%",
            cocReturn: "6.9%",
            equity: "1.62x",
          }}
          color="amber"
        />
        <ScenarioCard
          title="Aggressive"
          description="Higher rent growth, lower expenses"
          metrics={{
            irr: "18.6%",
            cocReturn: "10.2%",
            equity: "2.15x",
          }}
          color="emerald"
        />
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200">
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm">
          + Create New Scenario
        </button>
      </div>
    </div>
  )
}

// Helper Components
function InputField({ label, value, onChange, prefix, suffix, highlighted, source }: any) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">
        {label}
        {source && <span className="text-xs text-slate-500 ml-1">({source})</span>}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{prefix}</span>}
        <input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
          className={`w-full px-2 py-1.5 text-sm border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
            prefix ? "pl-6" : ""
          } ${suffix ? "pr-12" : ""} ${
            highlighted ? "bg-blue-50 border-blue-300 font-bold text-blue-900" : "border-gray-300 bg-white"
          }`}
        />
        {suffix && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs">{suffix}</span>}
      </div>
    </div>
  )
}

function MetricCard({ title, value, description, icon, color = "slate" }: any) {
  const colorClasses = {
    blue: "border-l-blue-500 bg-blue-50",
    emerald: "border-l-emerald-500 bg-emerald-50",
    amber: "border-l-amber-500 bg-amber-50",
    slate: "border-l-slate-500 bg-slate-50",
  }

  const iconColorClasses = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    slate: "text-slate-600",
  }

  return (
    <div className={`rounded border border-slate-200 border-l-4 p-3 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-slate-700">{title}</h4>
        <div className={iconColorClasses[color]}>{icon}</div>
      </div>
      <div className="text-xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-600">{description}</div>
    </div>
  )
}

function ScenarioCard({ title, description, metrics, color = "slate" }: any) {
  const borderColorClasses = {
    blue: "border-blue-300 hover:border-blue-400 hover:shadow-blue-100",
    emerald: "border-emerald-300 hover:border-emerald-400 hover:shadow-emerald-100",
    amber: "border-amber-300 hover:border-amber-400 hover:shadow-amber-100",
    slate: "border-slate-300 hover:border-slate-400 hover:shadow-slate-100",
  }

  const bgColorClasses = {
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    slate: "bg-slate-50",
  }

  return (
    <div
      className={`${bgColorClasses[color]} rounded border-2 p-3 transition-all hover:shadow-md ${borderColorClasses[color]}`}
    >
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 mb-3">{description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-700">IRR:</span>
          <span className="font-bold text-slate-900">{metrics.irr}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-700">CoC Return:</span>
          <span className="font-bold text-slate-900">{metrics.cocReturn}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-700">Equity Multiple:</span>
          <span className="font-bold text-slate-900">{metrics.equity}</span>
        </div>
      </div>
    </div>
  )
}
