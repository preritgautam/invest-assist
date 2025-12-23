"use client"

import React, { useState, useEffect, useCallback } from "react"
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
import { AddDocumentDialog } from "./add-document-dialog"

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

  // Fetch documents from database - extracted as a reusable function
  const fetchDocuments = useCallback(async () => {
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
          id: doc.document_id || doc.process_id || `doc-${doc.id}`, // Use document_id, fallback to process_id or db id
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
  }, [property?.name, propertyId])

  // Fetch documents on mount and when propertyId changes
  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  const [extractedData, setExtractedData] = useState<LineItem[]>(mockBrokerData)

  const activeDocument = documents.find((d) => d.id === selectedDoc)
  const [menuExpanded, setMenuExpanded] = useState(false)

  const [osValidated, setOsValidated] = useState(false)
  const [rrValidated, setRrValidated] = useState(false)
  const [omValidated, setOmValidated] = useState(false)
  const [hasAutoNavigatedAfterValidation, setHasAutoNavigatedAfterValidation] = useState(false)
  const [isLoadingValidationStatus, setIsLoadingValidationStatus] = useState(true)

  // Check if all documents are validated to unlock Analyze
  const allDocsValidated = osValidated && rrValidated && omValidated

  // Fetch validation status from database on component mount
  useEffect(() => {
    async function fetchValidationStatus() {
      if (!propertyId) {
        setIsLoadingValidationStatus(false)
        return
      }

      try {
        const response = await fetch(`/api/documents/validation?propertyId=${propertyId}`)
        if (response.ok) {
          const data = await response.json()
          if (data.validationStatus) {
            console.log('[DocsTab] Loaded validation status:', data.validationStatus)
            setOsValidated(data.validationStatus.OS)
            setRrValidated(data.validationStatus.RR)
            setOmValidated(data.validationStatus.OM)
          }
        }
      } catch (error) {
        console.error('[DocsTab] Error fetching validation status:', error)
      } finally {
        setIsLoadingValidationStatus(false)
      }
    }

    fetchValidationStatus()
  }, [propertyId])

  // Auto-navigate to Analyze when all docs are validated
  useEffect(() => {
    if (allDocsValidated && !hasAutoNavigatedAfterValidation && activeSection === "t12") {
      setTimeout(() => {
        setActiveSection("normalized")
        setHasAutoNavigatedAfterValidation(true)
      }, 1000)
    }
  }, [allDocsValidated])
  // </CHANGE>

  // Reset auto-navigation flag when user manually changes section
  useEffect(() => {
    if (activeSection !== "normalized") {
      setHasAutoNavigatedAfterValidation(false)
    }
  }, [activeSection])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileToolbarOpen, setMobileToolbarOpen] = useState(false)
  const [rrConfigOpen, setRrConfigOpen] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
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
    const paddingLeft = depth * 24 + 12
    const isMajorCategory = item.level === 0
    const isSubcategory = item.level === 1
    const isLineItem = item.level === 2

    return (
      <React.Fragment key={item.id}>
        <tr
          className={`border-b border-gray-100 transition-colors duration-150 ${
            isMajorCategory 
              ? "bg-gradient-to-r from-gray-50 to-slate-50 font-semibold" 
              : isSubcategory 
                ? "bg-gray-50/50 font-medium" 
                : "hover:bg-gray-50/50"
          }`}
        >
          {/* Expand/Collapse + Line Item Name */}
          <td className="border-r border-gray-100 py-2.5 px-3 sticky left-0 bg-inherit z-10" style={{ paddingLeft }}>
            <div className="flex items-center gap-2">
              {item.isCategory && item.children && (
                <button
                  onClick={() => toggleExpand(item.id)}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 transition-all duration-150 flex-shrink-0"
                  title={item.isExpanded ? "Collapse category" : "Expand category"}
                >
                  {item.isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              )}
              {!item.isCategory && (
                <button
                  onClick={() => toggleMonthly(item.id)}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-all duration-150 flex-shrink-0"
                  title={
                    item.showMonthly ? "Hide monthly breakdown" : "Show monthly breakdown (click to see T-12 values)"
                  }
                >
                  {item.showMonthly ? <ChevronDown className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </button>
              )}
              <span className={`${isMajorCategory ? "text-sm text-gray-900" : isSubcategory ? "text-xs text-gray-800" : "text-xs text-gray-700"}`}>{item.name}</span>
            </div>
          </td>

          {/* T-12 Actual */}
          <td className="border-r border-gray-100 py-2.5 px-3 text-right font-mono text-xs tabular-nums">
            <span className={item.t12Actual < 0 ? "text-red-500" : "text-gray-900"}>
              {item.t12Actual < 0
                ? `($${Math.abs(item.t12Actual).toLocaleString('en-US')})`
                : `$${item.t12Actual.toLocaleString('en-US')}`}
            </span>
          </td>

          {/* Underwriting */}
          <td className="border-r border-gray-100 py-2.5 px-3 text-right font-mono text-xs bg-blue-50/50 tabular-nums">
            <div className="flex items-center justify-end gap-1.5">
              <span className={item.underwriting && item.underwriting < 0 ? "text-red-500" : "text-gray-900"}>
                {item.underwriting
                  ? item.underwriting < 0
                    ? `($${Math.abs(item.underwriting).toLocaleString('en-US')})`
                    : `$${item.underwriting.toLocaleString('en-US')}`
                  : "-"}
              </span>
              {item.underwritingNote && (
                <MessageSquare className="w-3 h-3 text-blue-400" title={item.underwritingNote} />
              )}
            </div>
          </td>

          {/* Pro Forma Years */}
          {item.proForma.map((value, idx) => (
            <td key={idx} className="border-r border-gray-100 py-2.5 px-3 text-right font-mono text-xs bg-emerald-50/40 tabular-nums">
              <span className={value < 0 ? "text-red-500" : "text-gray-900"}>
                {value < 0 ? `($${Math.abs(value).toLocaleString('en-US')})` : `$${value.toLocaleString('en-US')}`}
              </span>
            </td>
          ))}
        </tr>

        {/* Monthly Breakdown Row */}
        {item.showMonthly && item.t12Monthly && (
          <tr className="bg-slate-50/50 border-b border-gray-100">
            <td
              className="border-r border-gray-100 py-2 px-3 text-xs text-gray-500 italic sticky left-0 bg-slate-50/50 z-10"
              style={{ paddingLeft: paddingLeft + 28 }}
            >
              Monthly Breakdown (T-12)
            </td>
            <td colSpan={1 + (activeDocument?.holdPeriod || 7) + 1} className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-100/60">
                      {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                        (month) => (
                          <th
                            key={month}
                            className="border-r border-gray-100 py-1.5 px-2 text-center font-medium text-gray-500 text-[10px] uppercase tracking-wide"
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
                          className="border-r border-gray-100 py-1.5 px-2 text-right font-mono text-xs hover:bg-blue-50/60 cursor-pointer transition-colors duration-150 tabular-nums"
                          title={`Double-click to edit ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}`}
                          onDoubleClick={(e) => {
                            const promptValue = prompt(
                              `Edit value for ${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx]}:`,
                              value.toString(),
                            )
                            if (promptValue !== null) {
                              console.log(`[v0] Updated monthly value: ${promptValue}`)
                            }
                          }}
                        >
                          <span className={value < 0 ? "text-red-500" : "text-gray-700"}>
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
      <div className="min-h-[400px] bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Loading Documents</h2>
        <p className="text-sm text-gray-500">Fetching property details...</p>
      </div>
    )
  }

  // Only show "select property" if we don't have property AND don't have propertyId
  if (!property && !propertyId) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center">
        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
          <FileText className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">No Property Selected</h2>
        <p className="text-sm text-gray-500 text-center max-w-sm">Select a property from your portfolio to view and manage its documents.</p>
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

  const handleValidateOS = async () => {
    setOsValidated(true)
    // Persist to database
    try {
      await fetch('/api/documents/validation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          documentType: 'OS',
          isValidated: true,
        }),
      })
      console.log('[DocsTab] OS validation persisted to database')
    } catch (error) {
      console.error('[DocsTab] Error persisting OS validation:', error)
    }
    // Auto-navigate to Rent Roll after validation
    handleDocTypeChange("RR")
  }

  const handleValidateRR = async () => {
    setRrValidated(true)
    // Persist to database
    try {
      await fetch('/api/documents/validation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          documentType: 'RR',
          isValidated: true,
        }),
      })
      console.log('[DocsTab] RR validation persisted to database')
    } catch (error) {
      console.error('[DocsTab] Error persisting RR validation:', error)
    }
    // Auto-navigate to OM after validation
    handleDocTypeChange("OM")
  }

  const handleValidateOM = async () => {
    setOmValidated(true)
    // Persist to database
    try {
      await fetch('/api/documents/validation/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          documentType: 'OM',
          isValidated: true,
        }),
      })
      console.log('[DocsTab] OM validation persisted to database')
    } catch (error) {
      console.error('[DocsTab] Error persisting OM validation:', error)
    }
  }

  const handleUnvalidateOS = async () => {
    if (confirm("Are you sure you want to unvalidate T-12 / OS? This will allow you to edit the data again.")) {
      setOsValidated(false)
      // Persist to database
      try {
        await fetch('/api/documents/validation/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            documentType: 'OS',
            isValidated: false,
          }),
        })
        console.log('[DocsTab] OS unvalidation persisted to database')
      } catch (error) {
        console.error('[DocsTab] Error persisting OS unvalidation:', error)
      }
    }
  }

  const handleUnvalidateRR = async () => {
    if (confirm("Are you sure you want to unvalidate Rent Roll? This will allow you to edit the data again.")) {
      setRrValidated(false)
      // Persist to database
      try {
        await fetch('/api/documents/validation/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            documentType: 'RR',
            isValidated: false,
          }),
        })
        console.log('[DocsTab] RR unvalidation persisted to database')
      } catch (error) {
        console.error('[DocsTab] Error persisting RR unvalidation:', error)
      }
    }
  }

  const handleUnvalidateOM = async () => {
    if (
      confirm("Are you sure you want to unvalidate Offering Memorandum? This will allow you to edit the data again.")
    ) {
      setOmValidated(false)
      // Persist to database
      try {
        await fetch('/api/documents/validation/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            documentType: 'OM',
            isValidated: false,
          }),
        })
        console.log('[DocsTab] OM unvalidation persisted to database')
      } catch (error) {
        console.error('[DocsTab] Error persisting OM unvalidation:', error)
      }
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
      <div className="relative flex h-screen bg-gradient-to-br from-gray-50/50 to-slate-50/30">

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
        <div className="hidden md:flex md:w-16 lg:w-20 bg-white/80 backdrop-blur-sm border-r border-gray-100 flex-col items-center gap-1.5 py-4 px-2 flex-shrink-0">
          <button
            onClick={() => setMenuExpanded(!menuExpanded)}
            className="w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            title="Toggle Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Expandable Menu Overlay */}
          {menuExpanded && (
            <div className="absolute left-16 lg:left-20 top-0 bg-white/95 backdrop-blur-xl shadow-2xl rounded-r-2xl border border-gray-200/60 p-5 z-50 min-w-[260px]">
              <div className="space-y-5">
                {/* Import Section */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <FileSpreadsheetIcon className="w-3.5 h-3.5" />
                    Import
                  </h4>
                  <div className="space-y-1">
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
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 truncate transition-colors duration-150"
                          title={doc.name}
                        >
                          {doc.name}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Analyze Section */}
                <div className={!allDocsValidated ? "opacity-40" : ""}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Analyze
                    {!allDocsValidated && <LockIcon className="w-3 h-3" />}
                  </h4>
                  <div className="space-y-1">
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      Inputs & Assumptions
                    </button>
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      Tabular Data
                    </button>
                  </div>
                </div>

                {/* Report Section */}
                <div className={!allDocsValidated ? "opacity-40" : ""}>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <BarChart3 className="w-3.5 h-3.5" />
                    Report
                    {!allDocsValidated && <LockIcon className="w-3 h-3" />}
                  </h4>
                  <div className="space-y-1">
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      Tabular Analysis
                    </button>
                    <button
                      disabled={!allDocsValidated}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
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
            className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${activeSection === "t12" 
              ? "bg-blue-50 text-blue-600 shadow-sm" 
              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            title="Upload Documents"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span className="text-[9px] mt-0.5 font-semibold">Upload</span>
          </button>

          {/* Analyze Button */}
          <div className="relative">
            <button
              onClick={() => allDocsValidated && setActiveSection("normalized")}
              disabled={!allDocsValidated}
              className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${activeSection === "normalized"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : allDocsValidated
                  ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
                }`}
              title={allDocsValidated ? "Analyze" : "Complete all validations to unlock"}
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-[9px] mt-0.5 font-semibold">Analyze</span>
            </button>
            {!allDocsValidated && (
              <div className="absolute -top-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                <Lock className="w-2.5 h-2.5 text-gray-400" />
              </div>
            )}
          </div>

          {/* Report Button */}
          <div className="relative">
            <button
              onClick={() => allDocsValidated && setActiveSection("summary")}
              disabled={!allDocsValidated}
              className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${activeSection === "summary"
                ? "bg-blue-50 text-blue-600 shadow-sm"
                : allDocsValidated
                  ? "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                  : "text-gray-300 cursor-not-allowed"
                }`}
              title={allDocsValidated ? "Report" : "Complete all validations to unlock"}
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-[9px] mt-0.5 font-semibold">Report</span>
            </button>
            {!allDocsValidated && (
              <div className="absolute -top-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                <Lock className="w-2.5 h-2.5 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Now properly centered between sidebars */}
        <div className="flex-1 flex flex-col bg-transparent min-w-0 overflow-hidden">
          <div className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              title="Open Menu"
            >
              <MenuIcon className="w-5 h-5 text-gray-600" />
            </button>
            <span className="text-sm font-semibold text-gray-900">Documents</span>
            <button
              onClick={() => setMobileToolbarOpen(true)}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
              title="Open Tools"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="bg-white/80 backdrop-blur-sm border-b border-gray-100 px-3 sm:px-4 py-3 flex-shrink-0">
              <div className="flex items-center justify-between gap-3">
                {/* Left side: Document type buttons */}
                <div className="flex items-center gap-1.5 p-1 bg-gray-100/80 rounded-xl">
                  <button
                    onClick={() => handleDocTypeChange("OS")}
                    className={`flex-shrink-0 px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeDocType === "OS"
                      ? "bg-white text-gray-900 shadow-sm"
                      : osValidated
                        ? "text-green-700 hover:bg-white/60"
                        : "text-gray-600 hover:bg-white/60"
                      }`}

                  >
                    <FileSpreadsheetIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">T-12 / OS</span>
                    <span className="sm:hidden">T-12</span>
                    {osValidated && <CheckCircle2Icon className="w-4 h-4 text-green-500" />}
                  </button>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => osValidated && handleDocTypeChange("RR")}
                      disabled={!osValidated}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeDocType === "RR"
                        ? "bg-white text-gray-900 shadow-sm"
                        : rrValidated
                          ? "text-green-700 hover:bg-white/60"
                          : osValidated
                            ? "text-gray-600 hover:bg-white/60"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <UsersIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Rent Roll</span>
                      <span className="sm:hidden">RR</span>
                      {rrValidated && <CheckCircle2Icon className="w-4 h-4 text-green-500" />}
                    </button>
                    {!osValidated && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <LockIcon className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="relative flex-shrink-0">
                    <button
                      onClick={() => rrValidated && handleDocTypeChange("OM")}
                      disabled={!rrValidated}
                      className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeDocType === "OM"
                        ? "bg-white text-gray-900 shadow-sm"
                        : omValidated
                          ? "text-green-700 hover:bg-white/60"
                          : rrValidated
                            ? "text-gray-600 hover:bg-white/60"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                    >
                      <BookOpenIcon className="w-4 h-4" />
                      <span className="hidden sm:inline">Offering Memorandum</span>
                      <span className="sm:hidden">OM</span>
                      {omValidated && <CheckCircle2Icon className="w-4 h-4 text-green-500" />}
                    </button>
                    {!rrValidated && (
                      <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                        <LockIcon className="w-2.5 h-2.5 text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        {activeDocType === "RR" && (<button
                          onClick={() => setRrConfigOpen(true)}
                          className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <InspectionPanel className="w-4 h-4" />
                        </button>)}

                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="rounded-lg">
                        <p className="text-xs">Configure Rent Roll</p>
                      </TooltipContent>
                    </Tooltip>

                  </TooltipProvider>


                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>

                        <button
                          onClick={() => setUploadDialogOpen(true)}
                          className="flex-shrink-0 w-9 h-9 rounded-xl bg-gray-900 hover:bg-gray-800 text-white flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>

                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="rounded-lg">
                        <p className="text-xs">Add New Document</p>
                      </TooltipContent>
                    </Tooltip>

                  </TooltipProvider>
                </div>

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
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-3 shadow-sm m-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {rrValidated ? (
                          <span className="text-green-600 font-medium flex items-center gap-2">
                            <CheckCircle2Icon className="w-4 h-4" />
                            Rent Roll Data Validated
                          </span>
                        ) : (
                          <span className="text-gray-500">Review all rent roll units and validate the data before proceeding</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {rrValidated && (
                          <button
                            onClick={handleUnvalidateRR}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1.5"
                          >
                            <Edit3Icon className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={handleValidateRR}
                          disabled={rrValidated}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${rrValidated
                            ? "bg-green-50 text-green-700 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
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
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 p-3 shadow-sm m-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {omValidated ? (
                          <span className="text-green-600 font-medium flex items-center gap-2">
                            <CheckCircle2Icon className="w-4 h-4" />
                            Offering Memorandum Data Validated
                          </span>
                        ) : (
                          <span className="text-gray-500">Review the offering memorandum and validate the data before proceeding</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {omValidated && (
                          <button
                            onClick={handleUnvalidateOM}
                            className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-1.5"
                          >
                            <Edit3Icon className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={handleValidateOM}
                          disabled={omValidated}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${omValidated
                            ? "bg-green-50 text-green-700 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-gray-800 shadow-md hover:shadow-lg"
                            }`}
                        >
                          {omValidated ? "✓ Validated" : "Validate Data"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <OMDocument propertyId={propertyId} />
                </div>
              )}

              {activeSection === "normalized" && <AnalyzeTab />}

              {activeSection === "summary" && (
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">Generate Reports</h2>
                    <p className="text-sm text-gray-500">
                      Export comprehensive analysis reports in various formats for stakeholders and lenders.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer p-5 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-800">Investment Summary</h3>
                          <p className="text-sm text-gray-500">Executive summary with key metrics and highlights</p>
                        </div>
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg">PDF</span>
                      </div>
                      <button className="mt-3 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <FileDown className="w-4 h-4" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer p-5 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-800">Detailed Underwriting</h3>
                          <p className="text-sm text-gray-500">
                            Complete analysis with all assumptions and calculations
                          </p>
                        </div>
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg">PDF</span>
                      </div>
                      <button className="mt-3 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <FileDown className="w-4 h-4" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer p-5 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-800">Pro Forma Financials</h3>
                          <p className="text-sm text-gray-500">10-year cash flow projections and returns analysis</p>
                        </div>
                        <span className="px-2.5 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-lg">
                          Excel
                        </span>
                      </div>
                      <button className="mt-3 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <FileDown className="w-4 h-4" />
                        Download Report
                      </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-200/60 hover:border-gray-300 hover:shadow-lg transition-all duration-300 cursor-pointer p-5 group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-gray-800">Market Analysis</h3>
                          <p className="text-sm text-gray-500">Comparative market data and benchmarking</p>
                        </div>
                        <span className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-lg">PDF</span>
                      </div>
                      <button className="mt-3 w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                        <FileDown className="w-4 h-4" />
                        Download Report
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Toolbar - Hidden on mobile */}
            {/* <div className="hidden lg:block flex-shrink-0 border-l border-gray-200">
              <RightToolbar />
            </div> */}
          </div>
        </div>
      </div>

      {/* Add Document Dialog */}
      <AddDocumentDialog
        isOpen={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        propertyId={propertyId}
        onDocumentsRefresh={fetchDocuments}
        onComplete={(files, documentType) => {
          setUploadDialogOpen(false)
          // Switch to the uploaded document type
          handleDocTypeChange(documentType)
        }}
      />
    </div>
  )
}

export { DocumentsTab as DocsTab }
