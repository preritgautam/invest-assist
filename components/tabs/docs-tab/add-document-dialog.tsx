"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Upload,
  FileText,
  X,
  Check,
  AlertCircle,
  Loader2,
  FileSpreadsheet,
  Users,
  BookOpen,
} from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  selected: boolean
  file: File
}

type DocumentType = "OS" | "RR" | "OM"

interface AddDocumentDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (files: UploadedFile[], documentType: DocumentType) => void
  propertyId?: string
}

export function AddDocumentDialog({ isOpen, onClose, onComplete, propertyId }: AddDocumentDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset dialog state when it closes
  useEffect(() => {
    if (!isOpen) {
      setUploadedFiles([])
      setIsDragging(false)
      setIsProcessing(false)
      setError(null)
      setUploadSuccess(false)
      setSelectedDocType(null)
    }
  }, [isOpen])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleFiles = useCallback(
    async (filesInput: FileList | File[] | null) => {
      if (!filesInput) return
      setIsProcessing(true)
      setError(null)
      const newFiles: UploadedFile[] = []

      const filesArray: File[] = filesInput instanceof FileList ? Array.from(filesInput) : Array.isArray(filesInput) ? filesInput : []

      try {
        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i]

          // Check file size (50MB limit)
          if (file.size > 50 * 1024 * 1024) {
            setError(`File ${file.name} exceeds 50MB limit`)
            continue
          }

          // Only allow PDF, Excel, and image files
          const allowedTypes = [
            'application/pdf',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
          ]
          
          const allowedExtensions = ['.pdf', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.gif', '.webp']
          const hasAllowedExtension = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext))
          
          if (!allowedTypes.includes(file.type) && !hasAllowedExtension) {
            setError(`File ${file.name} is not a supported format. Please use PDF, Excel, or image files.`)
            continue
          }

          newFiles.push({
            id: `${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            selected: true,
            file: file,
          })
        }

        setUploadedFiles((prev) => [...prev, ...newFiles])
      } catch (err) {
        console.error("Error processing files:", err)
        setError("Failed to process some files")
      } finally {
        setIsProcessing(false)
      }
    },
    [],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles],
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files ? Array.from(e.target.files) : null)
      e.currentTarget.value = ""
    },
    [handleFiles],
  )

  const toggleFileSelection = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f)))
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const handleProceed = async () => {
    const selectedFiles = uploadedFiles.filter((f) => f.selected)

    if (selectedFiles.length === 0) {
      setError("Please select at least one file")
      return
    }

    if (!selectedDocType) {
      setError("Please select a document type")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // TODO: Implement actual upload logic here
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setUploadSuccess(true)
      onComplete?.(selectedFiles, selectedDocType)
      
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error("Upload failed:", err)
      setError(err.message || "Failed to upload files. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = useCallback(() => {
    setUploadedFiles([])
    setSelectedDocType(null)
    setIsProcessing(false)
    setError(null)
  }, [])

  const getDocTypeIcon = (type: DocumentType) => {
    switch (type) {
      case "OS":
        return <FileSpreadsheet className="w-6 h-6" />
      case "RR":
        return <Users className="w-6 h-6" />
      case "OM":
        return <BookOpen className="w-6 h-6" />
    }
  }

  const getDocTypeLabel = (type: DocumentType) => {
    switch (type) {
      case "OS":
        return "T-12 / Operating Statement"
      case "RR":
        return "Rent Roll"
      case "OM":
        return "Offering Memorandum"
    }
  }

  const getDocTypeDescription = (type: DocumentType) => {
    switch (type) {
      case "OS":
        return "Financial performance data for the past 12 months"
      case "RR":
        return "Current tenant and unit information"
      case "OM":
        return "Property marketing and investment details"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-4 sm:p-6 max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold">Add New Document</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Upload a document and select its type
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">Document uploaded successfully!</p>
            </div>
          )}

          {/* Document Type Selection */}
          {!uploadSuccess && (
            <>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Document Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(["OS", "RR", "OM"] as DocumentType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedDocType(type)}
                      className={`text-card-foreground flex flex-col items-center gap-3 py-6 px-4 rounded-2xl shadow-lg hover:shadow-xl duration-200 cursor-pointer border-2 border-dashed transition-all touch-manipulation text-center ${
                        selectedDocType === type
                          ? "border-blue-500 bg-blue-50 shadow-blue-100"
                          : "bg-white border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className={`p-3 rounded-xl ${selectedDocType === type ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                        {getDocTypeIcon(type)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-semibold mb-1 ${selectedDocType === type ? "text-blue-900" : "text-gray-900"}`}>
                          {getDocTypeLabel(type)}
                        </h4>
                        <p className="text-xs text-gray-500">{getDocTypeDescription(type)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Area */}
              {selectedDocType && uploadedFiles.length === 0 && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${
                    isDragging
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400 bg-gray-50"
                  }`}
                >
                  <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drag and drop your {getDocTypeLabel(selectedDocType)} file here
                  </p>
                  <p className="text-xs text-gray-500 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-400 mt-4">Supported: PDF, Excel, Images (max 50MB)</p>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessing && uploadedFiles.length === 0 && (
                <div className="flex items-center justify-center gap-3 p-6">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm text-gray-600">Processing files...</span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Selected Files ({uploadedFiles.filter((f) => f.selected).length})
                    </h3>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      + Add more files
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          file.selected
                            ? "bg-blue-50 border-blue-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={file.selected}
                          onChange={() => toggleFileSelection(file.id)}
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1 rounded hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      Reset
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProceed}
                        disabled={isProcessing || uploadedFiles.filter((f) => f.selected).length === 0}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Document
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
