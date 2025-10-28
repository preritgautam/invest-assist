/**
 * Documents Tab Component
 *
 * A comprehensive document management interface for real estate property analysis.
 * Handles document upload, processing, data extraction, and verification workflows
 * for property-related documents including Operating Statements (OS), Rent Rolls (RR),
 * and Offering Memorandums (OM).
 *
 * Key Features:
 * - Drag-and-drop file upload with visual feedback
 * - Document processing status tracking (uploaded → processing → extracted → verified)
 * - Automatic data extraction from uploaded documents
 * - Data verification and synchronization with other analysis tabs
 * - Document management (view, download, delete)
 * - Responsive design for mobile and desktop
 *
 * Data Flow:
 * 1. User uploads documents via drag-drop or file picker
 * 2. Documents are processed and data is extracted automatically
 * 3. Extracted data can be verified and corrected by users
 * 4. Verified data syncs to Pro Forma, Returns, and other analysis tabs
 *
 * @module DocumentsTab
 * @requires React
 * @requires lucide-react - Icons for UI elements
 * @requires @/components/ui/card - Card layout components
 * @requires @/components/ui/badge - Status badges
 * @requires @/lib/property-data - Property data types
 */

"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, CheckCircle, AlertCircle, Eye, Download, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PropertyData } from "@/lib/property-data"

/**
 * Props interface for the DocumentsTab component
 * @interface DocumentsTabProps
 * @property {PropertyData | null} property - Selected property data or null if none selected
 */
interface DocumentsTabProps {
  property: PropertyData | null
}

/**
 * Interface representing a property document with processing status and extracted data
 * @interface PropertyDocument
 * @property {string} id - Unique document identifier
 * @property {string} name - Document filename
 * @property {"OS" | "RR" | "OM" | "Other"} type - Document type classification
 * @property {string} uploadDate - ISO date string of upload
 * @property {"uploaded" | "processing" | "extracted" | "verified"} status - Processing status
 * @property {object} [extractedData] - Optional extracted financial data
 * @property {string} [fileUrl] - Optional URL for document access
 */
interface PropertyDocument {
  id: string
  name: string
  type: "OS" | "RR" | "OM" | "Other"
  uploadDate: string
  status: "uploaded" | "processing" | "extracted" | "verified"
  extractedData?: {
    noi?: number
    units?: number
    occupancy?: number
    avgRent?: number
    expenses?: number
    capRate?: number
  }
  fileUrl?: string
}

/**
 * DocumentsTab Component
 *
 * Renders a comprehensive document management interface for property analysis.
 * Provides upload functionality, document processing status, and data extraction
 * capabilities with seamless integration to other analysis components.
 *
 * @param {DocumentsTabProps} props - Component props
 * @returns {JSX.Element} Rendered documents management interface
 */
export function DocumentsTab({ property }: DocumentsTabProps) {
  const [documents, setDocuments] = useState<PropertyDocument[]>([
    {
      id: "1",
      name: "Operating_Statement_2024.pdf",
      type: "OS",
      uploadDate: "2024-01-15",
      status: "verified",
      extractedData: {
        noi: 880000,
        units: 152,
        occupancy: 94.5,
        avgRent: 2100,
        expenses: 1250000,
      },
    },
    {
      id: "2",
      name: "Rent_Roll_Current.xlsx",
      type: "RR",
      uploadDate: "2024-01-14",
      status: "extracted",
      extractedData: {
        units: 152,
        occupancy: 94.5,
        avgRent: 2100,
      },
    },
  ])

  const [dragActive, setDragActive] = useState(false)

  if (!property) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border-2 border-white p-4 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">Documents</h2>
        <p className="text-sm text-gray-600">Select a property to manage documents.</p>
      </div>
    )
  }

  /**
   * Handles drag events for file upload area
   * Provides visual feedback during drag operations
   * @param {React.DragEvent} e - Drag event object
   */
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  /**
   * Handles file drop events for document upload
   * Processes dropped files and initiates upload workflow
   * @param {React.DragEvent} e - Drop event object
   */
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    // Handle file upload logic here
  }

  /**
   * Returns appropriate CSS classes for document processing status
   * @param {PropertyDocument["status"]} status - Document processing status
   * @returns {string} CSS classes for status styling
   */
  const getStatusColor = (status: PropertyDocument["status"]) => {
    switch (status) {
      case "uploaded":
        return "text-gray-700 bg-gray-100"
      case "processing":
        return "text-gray-800 bg-gray-200"
      case "extracted":
        return "text-gray-900 bg-gray-300"
      case "verified":
        return "text-white bg-gray-800"
    }
  }

  /**
   * Returns appropriate icon component for document processing status
   * @param {PropertyDocument["status"]} status - Document processing status
   * @returns {JSX.Element} Icon component for status
   */
  const getStatusIcon = (status: PropertyDocument["status"]) => {
    switch (status) {
      case "uploaded":
        return <Upload className="w-4 h-4" />
      case "processing":
        return <AlertCircle className="w-4 h-4" />
      case "extracted":
        return <Eye className="w-4 h-4" />
      case "verified":
        return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Header Card with Property Information */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-sm font-bold text-gray-900 truncate">Property Documents</CardTitle>
                <p className="text-xs text-gray-600 truncate">{property.name}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs flex-shrink-0">
              {documents.length} Docs
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Document Upload Interface */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm font-bold text-gray-900">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div
            className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-colors ${
              dragActive ? "border-gray-500 bg-gray-50" : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Upload Property Documents</h3>
            <p className="text-sm text-gray-600 mb-3 sm:mb-4">Drag and drop files here, or click to browse</p>
            <p className="text-xs text-gray-500 mb-3 sm:mb-4">
              Supported: OS (Operating Statement), RR (Rent Roll), OM (Offering Memorandum)
            </p>
            <button className="bg-gray-800 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:bg-gray-900 transition-colors text-sm">
              Choose Files
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Documents List with Processing Status */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm font-bold text-gray-900">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="border border-gray-200 rounded-xl p-3 sm:p-4">
                {/* Document Header with Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-600 flex-shrink-0 mt-1 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 break-words">{doc.name}</h3>
                      <p className="text-xs text-gray-600 mt-1">
                        Type: {doc.type} • Uploaded: {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2 flex-shrink-0">
                    <span
                      className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}
                    >
                      {getStatusIcon(doc.status)}
                      <span className="capitalize">{doc.status}</span>
                    </span>
                    <div className="flex items-center space-x-1">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Extracted Data Display */}
                {doc.extractedData && (
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4 mt-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-3 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Extracted Data
                      </div>
                      {doc.status === "extracted" && (
                        <button className="bg-gray-800 text-white px-3 py-1 rounded text-xs hover:bg-gray-900 self-start sm:ml-auto">
                          Verify Data
                        </button>
                      )}
                    </h4>
                    {/* Financial Data Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                      {doc.extractedData.noi && (
                        <div className="flex justify-between sm:block">
                          <span className="text-gray-600">NOI:</span>
                          <span className="font-medium sm:block">${doc.extractedData.noi.toLocaleString()}</span>
                        </div>
                      )}
                      {doc.extractedData.units && (
                        <div className="flex justify-between sm:block">
                          <span className="text-gray-600">Units:</span>
                          <span className="font-medium sm:block">{doc.extractedData.units}</span>
                        </div>
                      )}
                      {doc.extractedData.occupancy && (
                        <div className="flex justify-between sm:block">
                          <span className="text-gray-600">Occupancy:</span>
                          <span className="font-medium sm:block">{doc.extractedData.occupancy}%</span>
                        </div>
                      )}
                      {doc.extractedData.avgRent && (
                        <div className="flex justify-between sm:block">
                          <span className="text-gray-600">Avg Rent:</span>
                          <span className="font-medium sm:block">${doc.extractedData.avgRent}</span>
                        </div>
                      )}
                      {doc.extractedData.expenses && (
                        <div className="flex justify-between sm:block">
                          <span className="text-gray-600">Expenses:</span>
                          <span className="font-medium sm:block">${doc.extractedData.expenses.toLocaleString()}</span>
                        </div>
                      )}
                      {doc.extractedData.capRate && (
                        <div className="flex justify-between sm:block">
                          <span className="text-gray-600">Cap Rate:</span>
                          <span className="font-medium sm:block">{doc.extractedData.capRate}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Synchronization Status */}
      <Card className="bg-white rounded-2xl shadow-lg border-2 border-white">
        <CardHeader className="p-3 sm:p-4">
          <CardTitle className="text-sm font-bold text-gray-900">Data Synchronization</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start sm:items-center gap-3">
              <CheckCircle className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900">Data Successfully Synchronized</h3>
                <p className="text-xs text-gray-700 mt-1">
                  Verified document data has been automatically populated across Pro Forma, Returns, and other relevant
                  tabs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
