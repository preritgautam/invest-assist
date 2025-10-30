"use client"

import React, { useState, useEffect } from "react"
import {
  FileText,
  Plus,
  FileSpreadsheet,
  Users,
  BookOpen,
  CheckCircle2,
  Lock,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  FileSpreadsheetIcon,
  UsersIcon,
  Home,
  Shield,
  BookOpenIcon,
  TrendingUp,
  BarChart3,
  LockIcon,
  FileDown,
  CheckCircle2Icon,
  Edit3Icon,
  MenuIcon,
} from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PropertyData } from "@/lib/property-data"
import { T12ActualsTab } from "@/components/tabs/docs-tab/t12-actuals-tab"
import { RightToolbar } from "./right-toolbar"
import { RRDocument } from "./rr-document"
import { OMDocument } from "./om-document"
import { AnalyzeTab } from "@/components/tabs/docs-tab/analyze-tab"
import { MobileMenu } from "./mobile-menu"
import { MobileToolbar } from "./mobile-toolbar"
import { Breadcrumb } from "./breadcrumb"
import type { PropertyDocument, LineItem, RentRollUnit, DocumentView } from "./types"
import { mockBrokerData } from "./mock-data"
import { generateRentRollUnits } from "./utils"

const mockRentRollData: RentRollUnit[] = generateRentRollUnits(89, "Riverside Apartments")

interface DocumentsTabProps {
  property: PropertyData | null
}

export function DocumentsTab({ property }: DocumentsTabProps) {
  // Declared DocsView as a type alias for string to resolve the undeclared variable error.
  type DocsView = "library" | "upload" | "analysis" | "analytics" | "insights"
  const [docsView, setDocsView] = useState<DocsView>("library")
  const [documentView, setDocumentView] = useState<DocumentView>("extracted") // This line fixes the undeclared variable error for DocumentView.
  const [selectedDoc, setSelectedDoc] = useState<string | null>("1")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [documents] = useState<PropertyDocument[]>([
    {
      id: "1",
      name: `${property?.name || "Property"}_OS_2024.pdf`,
      type: "OS",
      uploadDate: "2024-01-15",
      stage: "review",
      extractedData: mockBrokerData,
      version: 1,
      holdPeriod: 7,
    },
    {
      id: "2",
      name: `${property?.name || "Property"}_RentRoll_Q4.xlsx`,
      type: "RR",
      uploadDate: "2024-01-14",
      stage: "verified",
      rentRollData: mockRentRollData, // This line uses the declared mockRentRollData.
    },
    {
      id: "3",
      name: `${property?.name || "Property"}_OM.pdf`,
      type: "OM",
      uploadDate: "2024-01-10",
      stage: "review",
    },
  ])
  // </CHANGE>

  const [extractedData, setExtractedData] = useState<LineItem[]>(mockBrokerData)

  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [isUploading, setIsUploading] = useState(false)

  const activeDocument = documents.find((d) => d.id === selectedDoc)

  const [activeSection, setActiveSection] = useState<"t12" | "normalized" | "summary">("t12")
  const [activeDocType, setActiveDocType] = useState<"OS" | "RR" | "OM">("OS")
  const [menuExpanded, setMenuExpanded] = useState(false)

  const [osValidated, setOsValidated] = useState(false)
  const [rrValidated, setRrValidated] = useState(false)
  const [omValidated, setOmValidated] = useState(false)

  // Check if all documents are validated to unlock Analyze
  const allDocsValidated = osValidated && rrValidated && omValidated

  useEffect(() => {
    if (allDocsValidated && activeSection === "t12") {
      // Show a brief notification before auto-navigating
      setTimeout(() => {
        setActiveSection("normalized")
      }, 1000)
    }
  }, [allDocsValidated, activeSection])
  // </CHANGE>

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false)

  const renderBreadcrumb = () => {
    const steps = [
      { id: "t12", label: "Upload", icon: FileSpreadsheet, enabled: true },
      { id: "normalized", label: "Analyze", icon: TrendingUp, enabled: allDocsValidated },
      { id: "summary", label: "Report", icon: BarChart3, enabled: allDocsValidated },
    ]

    return (
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        {/* </CHANGE> */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = activeSection === step.id
            const isCompleted =
              (step.id === "t12" && allDocsValidated) || (step.id === "normalized" && activeSection === "summary")

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => step.enabled && setActiveSection(step.id as typeof activeSection)}
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
  // </CHANGE>

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileUpload(e.dataTransfer.files)
  }

  const toggleExpand = (itemId: string) => {
    setExtractedData((prevData) => {
      const updateItem = (items: LineItem[]): LineItem[] => {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, isExpanded: !item.isExpanded }
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) }
          }
          return item
        })
      }
      return updateItem(prevData)
    })
  }

  const toggleMonthly = (itemId: string) => {
    setExtractedData((prevData) => {
      const updateItem = (items: LineItem[]): LineItem[] => {
        return items.map((item) => {
          if (item.id === itemId) {
            return { ...item, showMonthly: !item.showMonthly }
          }
          if (item.children) {
            return { ...item, children: updateItem(item.children) }
          }
          return item
        })
      }
      return updateItem(prevData)
    })
  }

  const getDocumentIcon = (type: DocumentType) => {
    switch (type) {
      case "OS":
        return FileSpreadsheet // Operating Statement - spreadsheet icon
      case "RR":
        return Users // Rent Roll - users/tenants icon
      case "OM":
        return BookOpen // Offering Memorandum - open book icon
      case "Appraisal":
        return Home
      case "Insurance":
        return Shield
      default:
        return FileText
    }
  }

  const getDocumentTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "OS":
        return "Operating Statement / Cashflow"
      case "RR":
        return "Rent Roll"
      case "OM":
        return "Offering Memorandum / Brochure"
      case "Appraisal":
        return "Appraisal Report"
      case "Insurance":
        return "Insurance Document"
      default:
        return "Document"
    }
  }

  const getPropertyName = (filename: string) => {
    const name = filename.split("_")[0] || filename.split(".")[0]
    return name.replace(/-/g, " ").replace(/_/g, " ")
  }

  const propertyName = activeDocument ? getPropertyName(activeDocument.name) : "Unknown Property"

  const renderLineItem = (item: LineItem, depth = 0): ReactNode => {
    const paddingLeft = depth * 24
    const isMajorCategory = item.level === 0
    const isSubcategory = item.level === 1
    const isLineItem = item.level === 2

    return (
      <React.Fragment key={item.id}>
        <tr
          className={`border-b border-gray-200 hover:bg-gray-50 ${
            isMajorCategory ? "bg-blue-50 font-bold" : isSubcategory ? "bg-gray-50 font-semibold" : ""
          }`}
        >
          {/* Expand/Collapse + Line Item Name */}
          <td className="border-r border-gray-200 p-2 sticky left-0 bg-inherit z-10" style={{ paddingLeft }}>
            <div className="flex items-center gap-2">
              {item.isCategory && item.children && (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="text-gray-600 hover:text-gray-900 flex-shrink-0"
                  title={item.isExpanded ? "Collapse category" : "Expand category"}
                >
                  {item.isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
              )}
              {!item.isCategory && (
                <button
                  onClick={() => toggleMonthly(item.id)}
                  className="text-gray-400 hover:text-gray-700 flex-shrink-0"
                  title={
                    item.showMonthly ? "Hide monthly breakdown" : "Show monthly breakdown (click to see T-12 values)"
                  }
                >
                  {item.showMonthly ? <ChevronDown className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
              )}
              <span className={`${isMajorCategory ? "text-sm" : "text-xs"}`}>{item.name}</span>
            </div>
          </td>

          {/* T-12 Actual */}
          <td className="border-r border-gray-200 p-2 text-right font-mono text-xs">
            <span className={item.t12Actual < 0 ? "text-red-600" : ""}>
              {item.t12Actual < 0
                ? `($${Math.abs(item.t12Actual).toLocaleString()})`
                : `$${item.t12Actual.toLocaleString()}`}
            </span>
          </td>

          {/* Underwriting */}
          <td className="border-r border-gray-200 p-2 text-right font-mono text-xs bg-blue-50">
            <div className="flex items-center justify-end gap-1">
              <span className={item.underwriting && item.underwriting < 0 ? "text-red-600" : ""}>
                {item.underwriting
                  ? item.underwriting < 0
                    ? `($${Math.abs(item.underwriting).toLocaleString()})`
                    : `$${item.underwriting.toLocaleString()}`
                  : "-"}
              </span>
              {item.underwritingNote && (
                <MessageSquare className="w-3 h-3 text-blue-500" title={item.underwritingNote} />
              )}
            </div>
          </td>

          {/* Pro Forma Years */}
          {item.proForma.map((value, idx) => (
            <td key={idx} className="border-r border-gray-200 p-2 text-right font-mono text-xs bg-green-50">
              <span className={value < 0 ? "text-red-600" : ""}>
                {value < 0 ? `($${Math.abs(value).toLocaleString()})` : `$${value.toLocaleString()}`}
              </span>
            </td>
          ))}
        </tr>

        {/* Monthly Breakdown Row */}
        {item.showMonthly && item.t12Monthly && (
          <tr className="bg-gray-50 border-b border-gray-200">
            <td
              className="border-r border-gray-200 p-2 text-xs text-gray-600 italic sticky left-0 bg-gray-50 z-10"
              style={{ paddingLeft: paddingLeft + 32 }}
            >
              Monthly Breakdown (T-12)
            </td>
            <td colSpan={1 + (activeDocument?.holdPeriod || 7) + 1} className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                        (month) => (
                          <th
                            key={month}
                            className="border-r border-gray-200 p-1 text-center font-medium text-gray-600"
                          >
                            {month}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {item.t12Monthly.map((value, idx) => (
                        <td
                          key={idx}
                          className="border-r border-gray-200 p-1 text-right font-mono text-xs hover:bg-blue-50 cursor-pointer"
                          title={`Double-click to edit ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}`}
                          // Added onDoubleClick handler to edit monthly values.
                          onDoubleClick={(e) => {
                            const promptValue = prompt(
                              `Edit value for ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}:`,
                              value.toString(),
                            )
                            if (promptValue !== null) {
                              // In a real app, you would update the state here.
                              // For this example, we'll just log it.
                              console.log(`[v0] Updated monthly value: ${promptValue}`)
                            }
                          }}
                        >
                          <span className={value < 0 ? "text-red-600" : ""}>
                            {value === 0
                              ? "$0"
                              : value < 0
                                ? `($${Math.abs(value).toLocaleString()})`
                                : `$${value.toLocaleString()}`}
                          </span>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        )}

        {/* Render Children */}
        {item.isExpanded && item.children?.map((child) => renderLineItem(child, depth + 1))}
      </React.Fragment>
    )
  }

  const calculateSummary = () => {
    if (!extractedData) return null

    const totalIncome = extractedData.find((item) => item.id === "total-income")
    const noi = extractedData.find((item) => item.id === "noi")

    return {
      totalIncome: totalIncome?.underwriting || totalIncome?.t12Actual || 0,
      noi: noi?.underwriting || noi?.t12Actual || 0,
      noiMargin: totalIncome
        ? ((noi?.underwriting || noi?.t12Actual || 0) / (totalIncome.underwriting || totalIncome.t12Actual)) * 100
        : 0,
    }
  }

  const summary = calculateSummary()

  const renderRentRollTable = () => {
    if (!activeDocument?.rentRollData) return null

    return (
      <div className="overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-20 bg-gray-100 border-b-2 border-gray-300">
            <tr>
              <th colSpan={9} className="bg-blue-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                UNIT INFORMATION
              </th>
              <th colSpan={8} className="bg-green-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                LEASE TERMS
              </th>
              <th colSpan={6} className="bg-orange-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                RENT & CHARGES
              </th>
              <th colSpan={13} className="bg-purple-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                MONTHLY CHARGES
              </th>
              <th colSpan={7} className="bg-pink-100 border-r border-gray-300 p-2 text-left font-bold text-gray-900">
                ADDITIONAL CHARGES
              </th>
              <th colSpan={10} className="bg-yellow-100 p-2 text-left font-bold text-gray-900">
                INCOME ITEMS
              </th>
            </tr>
            <tr className="bg-white">
              {/* Unit Information */}
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Floor Plan</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Square Feet</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Suite Number</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Building Id</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Unit Type</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Bed</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Bath</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Renovated</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700 bg-blue-50">Status</th>

              {/* Lease Terms */}
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Start Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">End Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Move In Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Move Out Date</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Tenant Name</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Lease Description</th>
              <th className="border-r border-gray-300 p-2 text-left font-semibold text-gray-700">Month To Month</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700 bg-green-50">
                Market Rent
              </th>

              {/* Rent & Charges */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Base Rent</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Total Charges Paid
              </th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Total Contractual Rent
              </th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Balance</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Deposit</th>
              <th className="border-r border-gray-200 p-2 text-right font-semibold text-gray-700 bg-orange-50">RENT</th>

              {/* Monthly Charges */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">WATER</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Unit Upgrades</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">WASH/DRY</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">GARAGE</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">MTOM</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">PETFEE</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">CORP</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">EMPLOYED</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">CONC</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Vacancy</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">laundry</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">parking</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700 bg-purple-50">
                Utility Reimbursement
              </th>

              {/* Additional Charges */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Concessions</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Monthly Rent</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Other Charges</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Corporate Unit</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Employee Discount</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Month To Month Fees
              </th>
              <th className="border-r border-gray-200 p-2 text-right font-semibold text-gray-700 bg-pink-50">
                Pet Fee
              </th>

              {/* Income Items */}
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Storage</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Subsidy</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Late Fee</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Insurance</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Rent Premium</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Trash Income</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Garage Income</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">Non Revenue Unit</th>
              <th className="border-r border-gray-300 p-2 text-right font-semibold text-gray-700">
                Pest Control Income
              </th>
              <th className="p-2 text-right font-semibold text-gray-700 bg-yellow-50">Cable Internet Income</th>
            </tr>
          </thead>
          <tbody>
            {activeDocument.rentRollData.map((unit, idx) => (
              <tr
                key={unit.id}
                className={`border-b border-gray-200 hover:bg-blue-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
              >
                {/* Unit Information */}
                <td className="border-r border-gray-200 p-2">{unit.floorPlan}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  {unit.squareFeet.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2">{unit.suiteNumber}</td>
                <td className="border-r border-gray-200 p-2">{unit.buildingId}</td>
                <td className="border-r border-gray-200 p-2">{unit.unitType}</td>
                <td className="border-r border-gray-200 p-2 text-center">{unit.bed}</td>
                <td className="border-r border-gray-200 p-2 text-center">{unit.bath}</td>
                <td className="border-r border-gray-200 p-2">{unit.renovated}</td>
                <td className="border-r border-gray-200 p-2">
                  <Badge
                    variant={unit.status === "Occupied" ? "default" : "secondary"}
                    className={`text-xs ${
                      unit.status === "Occupied"
                        ? "bg-green-100 text-green-800"
                        : unit.status === "Occupied-NTVL"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {unit.status}
                  </Badge>
                </td>

                {/* Lease Terms */}
                <td className="border-r border-gray-200 p-2 text-xs">{unit.startDate || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.endDate || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.moveInDate || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.moveOutDate || "-"}</td>
                <td className="border-r border-gray-200 p-2">{unit.tenantName}</td>
                <td className="border-r border-gray-200 p-2 text-xs">{unit.leaseDescription || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-center">{unit.monthToMonth || "-"}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.marketRent.toLocaleString()}
                </td>

                {/* Rent & Charges */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.baseRent.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.totalChargesPaid.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.totalContractualRent.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.balance.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.deposit.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.rent.toLocaleString()}</td>

                {/* Monthly Charges */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.water.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.unitUpgrades.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.washDry.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.garage.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.mtom.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.petFee.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.corp.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.employed.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.conc.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.vacancy.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.laundry.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.parking.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.utilityReimbursement.toLocaleString()}
                </td>

                {/* Additional Charges */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.concessions.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.monthlyRent.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.otherCharges.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.corporateUnit.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.employeeDiscount.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.monthToMonthFees.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.petFee.toLocaleString()}</td>

                {/* Income Items */}
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.storage.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.subsidy.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">${unit.lateFee.toLocaleString()}</td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.insurance.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.rentPremium.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.trashIncome.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.garageIncome.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.nonRevenueUnit.toLocaleString()}
                </td>
                <td className="border-r border-gray-200 p-2 text-right font-mono">
                  ${unit.pestControlIncome.toLocaleString()}
                </td>
                <td className="p-2 text-right font-mono">${unit.cableInternetIncome.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const renderSummaryView = () => {
    if (activeDocument?.type === "RR" && activeDocument.rentRollData) {
      const totalUnits = activeDocument.rentRollData.length
      const occupiedUnits = activeDocument.rentRollData.filter((u) => u.status === "Occupied").length
      const occupancyRate = (occupiedUnits / totalUnits) * 100
      const totalMarketRent = activeDocument.rentRollData.reduce((sum, u) => sum + u.marketRent, 0)
      const totalActualRent = activeDocument.rentRollData.reduce((sum, u) => sum + u.baseRent, 0)
      const lossToLease = totalMarketRent - totalActualRent

      return (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Rent Roll Summary</h3>
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Total Units</p>
                <p className="text-2xl font-bold text-gray-900">{totalUnits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Occupied Units</p>
                <p className="text-2xl font-bold text-green-600">{occupiedUnits}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Occupancy Rate</p>
                <p className="text-2xl font-bold text-blue-600">{occupancyRate.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Loss to Lease</p>
                <p className="text-2xl font-bold text-red-600">${lossToLease.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    if (activeDocument?.type === "OS" && summary) {
      return (
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Operating Statement Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-gray-900">${summary.totalIncome.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">Net Operating Income</p>
                <p className="text-2xl font-bold text-green-600">${summary.noi.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-gray-600 mb-1">NOI Margin</p>
                <p className="text-2xl font-bold text-blue-600">{summary.noiMargin.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }

    return null
  }

  if (!property) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-8 text-center">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Documents</h2>
        <p className="text-gray-600">Select a property to manage documents.</p>
      </div>
    )
  }

  const handleDocTypeChange = (docType: "OS" | "RR" | "OM") => {
    setActiveDocType(docType)
    // Map document types to document IDs
    const docIdMap = { OS: "1", RR: "2", OM: "3" } as const
    setSelectedDoc(docIdMap[docType])
  }

  const handleValidateOS = () => {
    setOsValidated(true)
    // Auto-navigate to Rent Roll after validation
    handleDocTypeChange("RR")
  }

  const handleValidateRR = () => {
    setRrValidated(true)
    // Auto-navigate to OM after validation
    handleDocTypeChange("OM")
  }

  const handleValidateOM = () => {
    setOmValidated(true)
    // Optionally auto-navigate to Analyze
    // setActiveSection("normalized")
  }

  const handleUnvalidateOS = () => {
    if (confirm("Are you sure you want to unvalidate T-12 / OS? This will allow you to edit the data again.")) {
      setOsValidated(false)
    }
  }

  const handleUnvalidateRR = () => {
    if (confirm("Are you sure you want to unvalidate Rent Roll? This will allow you to edit the data again.")) {
      setRrValidated(false)
    }
  }

  const handleUnvalidateOM = () => {
    if (
      confirm("Are you sure you want to unvalidate Offering Memorandum? This will allow you to edit the data again.")
    ) {
      setOmValidated(false)
    }
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-white sm:border-2 overflow-hidden">
      <div className="relative flex h-screen">
        {/* Mobile Menu */}
        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          activeSection={activeSection}
          allDocsValidated={allDocsValidated}
          onSectionChange={setActiveSection}
        />

        {/* Mobile Toolbar */}
        <MobileToolbar isOpen={mobileToolbarOpen} onClose={() => setMobileToolbarOpen(false)} />

        {/* Left Sidebar - Same level as right sidebar */}
        <div className="hidden md:flex md:w-16 lg:w-20 bg-white border-r border-gray-200 flex-col items-center gap-2 p-2 flex-shrink-0">
          <button
            onClick={() => setMenuExpanded(!menuExpanded)}
            className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            title="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Expandable Menu Overlay */}
          {menuExpanded && (
            <div className="absolute left-16 lg:left-20 top-0 bg-white shadow-xl rounded-r-lg border border-gray-200 p-4 z-50 min-w-[240px]">
              <div className="space-y-4">
                {/* Import Section */}
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FileSpreadsheetIcon className="w-4 h-4" />
                    Import
                  </h4>
                  <div className="pl-6 space-y-1">
                    {documents
                      .filter((d) => d.type === "OS" || d.type === "RR" || d.type === "OM")
                      .map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => {
                            const typeMap = { OS: "OS", RR: "RR", OM: "OM" } as const
                            handleDocTypeChange(typeMap[doc.type as keyof typeof typeMap])
                            setMenuExpanded(false)
                          }}
                          className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 truncate"
                          title={doc.name}
                        >
                          {doc.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Analyze Section */}
                <div className={!allDocsValidated ? "opacity-50" : ""}>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Analyze
                    {!allDocsValidated && <LockIcon className="w-3 h-3 text-gray-500" />}
                  </h4>
                  <div className="pl-6 space-y-1">
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Inputs & Assumptions
                    </button>
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Tabular Data
                    </button>
                  </div>
                </div>

                {/* Report Section */}
                <div className={!allDocsValidated ? "opacity-50" : ""}>
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Report
                    {!allDocsValidated && <LockIcon className="w-3 h-3 text-gray-500" />}
                  </h4>
                  <div className="pl-6 space-y-1">
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Tabular Analysis
                    </button>
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      Visual Analysis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setActiveSection("t12")
              setMenuExpanded(false)
            }}
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${
              activeSection === "t12" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
            }`}
            title="Upload Documents"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[10px] mt-1 font-bold">Upload</span>
          </button>

          {/* Analyze Button */}
          <div className="relative">
            <button
              onClick={() => allDocsValidated && setActiveSection("normalized")}
              disabled={!allDocsValidated}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${
                activeSection === "normalized"
                  ? "text-blue-600"
                  : allDocsValidated
                    ? "text-gray-700 hover:text-gray-900"
                    : "text-gray-400 cursor-not-allowed"
              }`}
              title={allDocsValidated ? "Analyze" : "Complete all validations to unlock"}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-bold">Analyze</span>
            </button>
            {!allDocsValidated && (
              <div className="absolute top-0 right-0 bg-white rounded-full p-0.5">
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            )}
          </div>

          {/* Report Button */}
          <div className="relative">
            <button
              onClick={() => allDocsValidated && setActiveSection("summary")}
              disabled={!allDocsValidated}
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${
                activeSection === "summary"
                  ? "text-blue-600"
                  : allDocsValidated
                    ? "text-gray-700 hover:text-gray-900"
                    : "text-gray-400 cursor-not-allowed"
              }`}
              title={allDocsValidated ? "Report" : "Complete all validations to unlock"}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-bold">Report</span>
            </button>
            {!allDocsValidated && (
              <div className="absolute top-0 right-0 bg-white rounded-full p-0.5">
                <Lock className="w-3 h-3 text-gray-500" />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Now properly centered between sidebars */}
        <div className="flex-1 flex flex-col bg-gray-50 min-w-0 overflow-hidden">
          <div className="lg:hidden bg-white border-b border-gray-200 px-3 py-2 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Open Menu"
            >
              <MenuIcon className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-sm font-semibold text-gray-900">Documents</span>
            <button
              onClick={() => setMobileToolbarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Open Tools"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="12" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </button>
          </div>

          <Breadcrumb
            activeSection={activeSection}
            allDocsValidated={allDocsValidated}
            onSectionChange={setActiveSection}
          />

          {/* Document Type Tabs - Only show in Upload section */}
          {activeSection === "t12" && (
            <div className="bg-white border-b border-gray-200 px-2 sm:px-3 py-2 flex-shrink-0">
              <div className="flex items-center justify-between gap-2">
                {/* Left side: Document type buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDocTypeChange("OS")}
                    className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
                      activeDocType === "OS"
                        ? "bg-blue-600 text-white shadow-md"
                        : osValidated
                          ? "bg-green-50 text-gray-700 hover:bg-green-100 border border-green-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <FileSpreadsheetIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">T-12 / OS</span>
                    <span className="sm:hidden">T-12</span>
                    {osValidated && <CheckCircle2Icon className="w-4 h-4 text-green-600" />}
                  </button>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => osValidated && handleDocTypeChange("RR")}
                      disabled={!osValidated}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
                        activeDocType === "RR"
                          ? "bg-blue-600 text-white shadow-md"
                          : rrValidated
                            ? "bg-green-50 text-gray-700 hover:bg-green-100 border border-green-300"
                            : osValidated
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <UsersIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Rent Roll</span>
                      <span className="sm:hidden">RR</span>
                      {rrValidated && <CheckCircle2Icon className="w-4 h-4 text-green-600" />}
                    </button>
                    {!osValidated && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <LockIcon className="w-3 h-3 text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => rrValidated && handleDocTypeChange("OM")}
                      disabled={!rrValidated}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${
                        activeDocType === "OM"
                          ? "bg-blue-600 text-white shadow-md"
                          : omValidated
                            ? "bg-green-50 text-gray-700 hover:bg-green-100 border border-green-300"
                            : rrValidated
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Offering Memorandum</span>
                      <span className="sm:hidden">OM</span>
                      {omValidated && <CheckCircle2Icon className="w-4 h-4 text-green-600" />}
                    </button>
                    {!rrValidated && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <LockIcon className="w-3 h-3 text-gray-500" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right side: Add button */}
                <button
                  onClick={() => {}}
                  className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
                  title="Add New Document"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 overflow-y-auto min-w-0">
              {activeSection === "t12" && activeDocType === "OS" && (
                <T12ActualsTab
                  property={property}
                  onValidate={handleValidateOS}
                  validated={osValidated}
                  onUnvalidate={handleUnvalidateOS}
                />
              )}

              {activeSection === "t12" && activeDocType === "RR" && activeDocument?.rentRollData && (
                <div>
                  <div className="bg-white rounded-lg border p-2 shadow-sm m-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {rrValidated ? (
                          <span className="text-green-600 font-semibold flex items-center gap-2">
                            <CheckCircle2Icon className="w-4 h-4" />
                            Rent Roll Data Validated
                          </span>
                        ) : (
                          <span>Review all rent roll units and validate the data before proceeding</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {rrValidated && (
                          <button
                            onClick={handleUnvalidateRR}
                            className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
                          >
                            <Edit3Icon className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={handleValidateRR}
                          disabled={rrValidated}
                          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                            rrValidated
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {rrValidated ? "✓ Validated" : "Validate Data"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <RRDocument />
                </div>
              )}
              {activeSection === "t12" && activeDocType === "OM" && (
                <div>
                  <div className="bg-white rounded-lg border p-2 shadow-sm m-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-600">
                        {omValidated ? (
                          <span className="text-green-600 font-semibold flex items-center gap-2">
                            <CheckCircle2Icon className="w-4 h-4" />
                            Offering Memorandum Data Validated
                          </span>
                        ) : (
                          <span>Review the offering memorandum and validate the data before proceeding</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {omValidated && (
                          <button
                            onClick={handleUnvalidateOM}
                            className="px-3 py-1.5 rounded text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1"
                          >
                            <Edit3Icon className="w-3 h-3" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={handleValidateOM}
                          disabled={omValidated}
                          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${
                            omValidated
                              ? "bg-green-100 text-green-700 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {omValidated ? "✓ Validated" : "Validate Data"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <OMDocument />
                </div>
              )}

              {activeSection === "normalized" && <AnalyzeTab />}

              {activeSection === "summary" && (
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900 mb-1">Generate Reports</h2>
                    <p className="text-xs text-gray-600 mb-3">
                      Export comprehensive analysis reports in various formats for stakeholders and lenders.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Investment Summary</h3>
                          <p className="text-xs text-slate-600">Executive summary with key metrics and highlights</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">PDF</span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Detailed Underwriting</h3>
                          <p className="text-xs text-slate-600">
                            Complete analysis with all assumptions and calculations
                          </p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">PDF</span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Pro Forma Financials</h3>
                          <p className="text-xs text-slate-600">10-year cash flow projections and returns analysis</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">
                          Excel
                        </span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-xs font-bold text-slate-900 mb-1">Market Analysis</h3>
                          <p className="text-xs text-slate-600">Comparative market data and benchmarking</p>
                        </div>
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded">PDF</span>
                      </div>
                      <button className="mt-2 w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm">
                        <FileDown className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Toolbar - Hidden on mobile */}
            <div className="hidden lg:block flex-shrink-0 border-l border-gray-200">
              <RightToolbar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { DocumentsTab as DocsTab }
