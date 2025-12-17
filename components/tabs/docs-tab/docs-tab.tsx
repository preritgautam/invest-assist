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
  InspectionPanel,
} from "lucide-react"
import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PropertyData } from "@/lib/property-data"
import { T12ActualsTab } from "@/components/tabs/docs-tab/t12-actuals-tab"
import { RightToolbar } from "./right-toolbar"
import { RRDocument } from "./rent-roll/rr-document"
import { OMDocument } from "./om-document"
import { AnalyzeTab } from "@/components/tabs/docs-tab/analyze-tab"
import { MobileMenu } from "./mobile-menu"
import { MobileToolbar } from "./mobile-toolbar"
import { Breadcrumb } from "./breadcrumb"
import type { PropertyDocument, LineItem, RentRollUnit, DocumentView } from "./types"
import { mockBrokerData } from "./mock-data"
import { generateRentRollUnits } from "./utils"
import LineItemRow, { type LineItem as LineItemType } from "./LineItemRow"
import { RentRollConfig, RRConfigure } from "./rent-roll/rr-configure"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// near the other imports at the top of the file


const mockRentRollData: RentRollUnit[] = generateRentRollUnits(89, "Riverside Apartments")

// Database document type from API
interface DatabaseDocument {
  id: number
  user_id: string
  process_id: string
  document_id: string | null
  filename: string
  document_type: string | null
  file_size: number | null
  upload_status: string
  extraction_status: string
  created_at: string
  updated_at: string
}

// Map database document_type to PropertyDocument type
function mapDocumentType(dbType: string | null): "OS" | "RR" | "OM" | "Appraisal" | "Insurance" {
  const typeMap: Record<string, "OS" | "RR" | "OM" | "Appraisal" | "Insurance"> = {
    "rent_roll": "RR",
    "operating_statement": "OS",
    "t12": "OS",
    "offering_memorandum": "OM",
    "om": "OM",
    "appraisal": "Appraisal",
    "insurance": "Insurance",
  }
  return typeMap[dbType?.toLowerCase() || ""] || "OS"
}

// Map extraction_status to ProcessingStage
function mapProcessingStage(status: string): "upload" | "extracting" | "review" | "verified" {
  const stageMap: Record<string, "upload" | "extracting" | "review" | "verified"> = {
    "pending": "upload",
    "processing": "extracting",
    "completed": "review",
    "verified": "verified",
    "failed": "upload",
  }
  return stageMap[status?.toLowerCase() || ""] || "upload"
}

interface DocumentsTabProps {
  property: PropertyData | null
  propertyId?: string
  isLoading?: boolean
}

export function DocumentsTab({ property, propertyId, isLoading: propertyLoading }: DocumentsTabProps) {
  // Declared DocsView as a type alias for string to resolve the undeclared variable error.
  type DocsView = "library" | "upload" | "analysis" | "analytics" | "insights"
  const [docsView, setDocsView] = useState<DocsView>("library")
  const [documentView, setDocumentView] = useState<DocumentView>("extracted") // This line fixes the undeclared variable error for DocumentView.
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState()
  const [documents, setDocuments] = useState<PropertyDocument[]>([])
  const [documentsLoading, setDocumentsLoading] = useState(true)
  const [documentsError, setDocumentsError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<"t12" | "normalized" | "summary">("t12")
  const [activeDocType, setActiveDocType] = useState<"OS" | "RR" | "OM">("OS")

  // Fetch documents from database
  useEffect(() => {
    async function fetchDocuments() {
      try {
        setDocumentsLoading(true)
        setDocumentsError(null)

        // Build URL with propertyId filter if available
        const url = propertyId
          ? `/api/documents/list?propertyId=${encodeURIComponent(propertyId)}`
          : '/api/documents/list'
        const response = await fetch(url)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch documents')
        }

        if (data.documents && data.documents.length > 0) {
          // Map database documents to PropertyDocument interface
          const mappedDocuments: PropertyDocument[] = data.documents.map((doc: DatabaseDocument) => ({
            id: doc.document_id, // Use process_id as the identifier for fetching
            name: doc.filename,
            type: mapDocumentType(doc.document_type),
            uploadDate: doc.created_at.split('T')[0],
            stage: mapProcessingStage(doc.extraction_status),
            // For RR documents, we'll load the rent roll data when selected
            rentRollData: mapDocumentType(doc.document_type) === "RR" ? mockRentRollData : undefined,
            extractedData: mapDocumentType(doc.document_type) === "OS" ? mockBrokerData : undefined,
            version: 1,
            holdPeriod: 7,
          }))

          setDocuments(mappedDocuments)

          // Set selectedDoc to first document if not already set
          if (mappedDocuments.length > 0) {
            // Find the first OS document to select, or fall back to first document
            const firstOsDoc = mappedDocuments.find(d => d.type === "OS")
            const docToSelect = firstOsDoc || mappedDocuments[0]
            setSelectedDoc(docToSelect.id)
            // Always default to OS (T-12/OS) tab - don't auto-switch based on document types
            // User can manually switch to other tabs if needed
          }
        } else {
          // No documents in database, use mock data as fallback
          const mockDocuments: PropertyDocument[] = [
            {
              id: "mock-1",
              name: `${property?.name || "Property"}_OS_2024.pdf`,
              type: "OS",
              uploadDate: "2024-01-15",
              stage: "review",
              extractedData: mockBrokerData,
              version: 1,
              holdPeriod: 7,
            },
            {
              id: "mock-2",
              name: `${property?.name || "Property"}_RentRoll_Q4.xlsx`,
              type: "RR",
              uploadDate: "2024-01-14",
              stage: "verified",
              rentRollData: mockRentRollData,
            },
            {
              id: "mock-3",
              name: `${property?.name || "Property"}_OM.pdf`,
              type: "OM",
              uploadDate: "2024-01-10",
              stage: "review",
            },
          ]
          setDocuments(mockDocuments)
          setSelectedDoc("mock-1")
          setActiveDocType("OS")
        }
      } catch (error) {
        console.error('[DocsTab] Error fetching documents:', error)
        setDocumentsError(error instanceof Error ? error.message : 'Failed to fetch documents')

        // Use mock data on error
        const mockDocuments: PropertyDocument[] = [
          {
            id: "mock-1",
            name: `${property?.name || "Property"}_OS_2024.pdf`,
            type: "OS",
            uploadDate: "2024-01-15",
            stage: "review",
            extractedData: mockBrokerData,
            version: 1,
            holdPeriod: 7,
          },
          {
            id: "mock-2",
            name: `${property?.name || "Property"}_RentRoll_Q4.xlsx`,
            type: "RR",
            uploadDate: "2024-01-14",
            stage: "verified",
            rentRollData: mockRentRollData,
          },
          {
            id: "mock-3",
            name: `${property?.name || "Property"}_OM.pdf`,
            type: "OM",
            uploadDate: "2024-01-10",
            stage: "review",
          },
        ]
        setDocuments(mockDocuments)
        setSelectedDoc("mock-1")
        setActiveDocType("OS")
      } finally {
        setDocumentsLoading(false)
      }
    }

    fetchDocuments()
  }, [property?.name, propertyId])

  const [extractedData, setExtractedData] = useState<LineItem[]>(mockBrokerData)

  const activeDocument = documents.find((d) => d.id === selectedDoc)
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
  const [rrConfigOpen, setRrConfigOpen] = useState(false)
  const [rrConfig, setRrConfig] = useState<RentRollConfig>({
    tenantCharges: [
      { id: "1", name: "RENT", apiField: "monthly_rent", frequency: "Monthly", targetFrequency: "Monthly" },
      { id: "2", name: "WATER", apiField: "utility_reimbursement", frequency: "Monthly", targetFrequency: "Monthly" },
      { id: "3", name: "Unit Upgrades", apiField: "other_charges", frequency: "Monthly", targetFrequency: "Monthly" },
      { id: "4", name: "WASH/DRY", apiField: "laundry", frequency: "Monthly", targetFrequency: "Monthly" },
    ],
    floorPlans: [],
    occupancyMappings: [],
    availableColumns: [],
  })
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



  const renderLineItem = (item: LineItem, depth = 0): ReactNode => {
    const paddingLeft = depth * 24
    const isMajorCategory = item.level === 0
    const isSubcategory = item.level === 1
    const isLineItem = item.level === 2

    return (
      <React.Fragment key={item.id}>
        <tr
          className={`border-b border-gray-200 hover:bg-gray-50 ${isMajorCategory ? "bg-blue-50 font-bold" : isSubcategory ? "bg-gray-50 font-semibold" : ""
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
                ? `($${Math.abs(item.t12Actual).toLocaleString('en-US')})`
                : `$${item.t12Actual.toLocaleString('en-US')}`}
            </span>
          </td>

          {/* Underwriting */}
          <td className="border-r border-gray-200 p-2 text-right font-mono text-xs bg-blue-50">
            <div className="flex items-center justify-end gap-1">
              <span className={item.underwriting && item.underwriting < 0 ? "text-red-600" : ""}>
                {item.underwriting
                  ? item.underwriting < 0
                    ? `($${Math.abs(item.underwriting).toLocaleString('en-US')})`
                    : `$${item.underwriting.toLocaleString('en-US')}`
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
                {value < 0 ? `($${Math.abs(value).toLocaleString('en-US')})` : `$${value.toLocaleString('en-US')}`}
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
                                ? `($${Math.abs(value).toLocaleString('en-US')})`
                                : `$${value.toLocaleString('en-US')}`}
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



  // Show loading state while property is being fetched
  if (propertyLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-8 text-center">
        <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Loading...</h2>
        <p className="text-gray-600">Fetching property details...</p>
      </div>
    )
  }

  // Only show "select property" if we don't have property AND don't have propertyId
  if (!property && !propertyId) {
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
    // Find the first document of this type
    const docOfType = documents.find(d => d.type === docType)
    if (docOfType) {
      setSelectedDoc(docOfType.id)
    }
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
            className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${activeSection === "t12" ? "text-blue-600" : "text-gray-700 hover:text-gray-900"
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
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${activeSection === "normalized"
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
              className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-colors ${activeSection === "summary"
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
                    className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${activeDocType === "OS"
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
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${activeDocType === "RR"
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
                      className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs transition-colors flex items-center gap-2 ${activeDocType === "OM"
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {activeDocType === "RR" && (<button
                        onClick={() => setRrConfigOpen(true)}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <InspectionPanel className="w-5 h-5" />
                      </button>)}

                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Configure Rent Roll</p>
                    </TooltipContent>
                  </Tooltip>

                </TooltipProvider>


                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>

                      <button
                        onClick={() => { }}
                        className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shadow-sm"
                      >
                        <Plus className="w-5 h-5" />
                      </button>

                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>Add New Document</p>
                    </TooltipContent>
                  </Tooltip>

                </TooltipProvider>

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
                <div className="flex-1 flex flex-col overflow-hidden h-[100%] relative">
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
                          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${rrValidated
                            ? "bg-green-100 text-green-700 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                          {rrValidated ? "✓ Validated" : "Validate Data"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="relative flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-auto">
                      <RRDocument
                        isOpen={rrConfigOpen}
                        onClose={() => setRrConfigOpen(false)}
                        config={rrConfig}
                        onConfigChange={setRrConfig}
                        documentId={selectedDoc || undefined}
                        processId={selectedDoc || undefined}
                      />
                    </div>
                  </div>
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
                          className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${omValidated
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
