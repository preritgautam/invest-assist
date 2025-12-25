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
  ImageIcon,
} from "lucide-react"
import { uploadFilesToRex } from "@/lib/rex-client"
import { useRexPolling } from "@/hooks/use-rex-polling"

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  selected: boolean
  file: File
}

type DocumentType = "OS" | "RR" | "OM" | "Photos"

interface AddDocumentDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (files: UploadedFile[], documentType: DocumentType) => void
  propertyId?: string
  onDocumentsRefresh?: () => void
}

export function AddDocumentDialog({ isOpen, onClose, onComplete, propertyId, onDocumentsRefresh }: AddDocumentDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null)
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [isPollingInProgress, setIsPollingInProgress] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { startPolling, isPolling: pollingActive } = useRexPolling()

  // Reset dialog state when it closes
  useEffect(() => {
    if (!isOpen) {
      setUploadedFiles([])
      setIsDragging(false)
      setIsProcessing(false)
      setError(null)
      setUploadSuccess(false)
      setSelectedDocType(null)
      setUploadProgress("")
      setIsPollingInProgress(false)
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

  // Handle Photos upload - direct to storage without REX processing
  const handlePhotosUpload = async (selectedFiles: UploadedFile[]) => {
    try {
      if (!propertyId) {
        setError("Property ID is required to upload photos")
        setIsProcessing(false)
        return
      }

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadProgress(`Uploading photo ${file.name} (${i + 1}/${selectedFiles.length})...`)

        // Create FormData for storage upload
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('propertyId', propertyId)
        formData.append('imageCategory', 'user_uploaded') // Mark as user uploaded

        // Upload to storage API
        const response = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to upload photo')
        }

        const result = await response.json()
        console.log(`[AddDocumentDialog] Photo uploaded successfully:`, result)

        // Create property_images record
        const imageResponse = await fetch('/api/properties/images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId: propertyId,
            filename: file.name,
            storagePath: result.document?.storage_path,
            imageCategory: 'user_uploaded',
            displayOrder: i,
          }),
        })

        if (!imageResponse.ok) {
          console.error(`[AddDocumentDialog] Failed to create property_images record for ${file.name}`)
        } else {
          console.log(`[AddDocumentDialog] Property image record created for ${file.name}`)
        }
      }

      setUploadProgress("Photos uploaded successfully!")
      setUploadSuccess(true)

      // Trigger refresh
      onDocumentsRefresh?.()
      onComplete?.(selectedFiles, "Photos")

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error("[AddDocumentDialog] Photo upload failed:", err)
      setError(err.message || "Failed to upload photos. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle OS and OM documents - upload to storage then use Gemini extraction
  const handleGeminiDocumentUpload = async (selectedFiles: UploadedFile[], docType: "OS" | "OM") => {
    try {
      if (!propertyId) {
        setError("Property ID is required to upload documents")
        setIsProcessing(false)
        return
      }

      const documentType = docType === "OS" ? "operating_statement" : "offering_memorandum"
      const extractionEndpoint = docType === "OS" ? "/api/documents/os-extract" : "/api/documents/om-extract"

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${selectedFiles.length})...`)

        // 1. Upload to storage
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('propertyId', propertyId)
        formData.append('documentType', documentType)

        const uploadResponse = await fetch('/api/storage/upload', {
          method: 'POST',
          body: formData,
        })

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json()
          throw new Error(errorData.error || 'Failed to upload document')
        }

        const uploadResult = await uploadResponse.json()
        console.log(`[AddDocumentDialog] Document uploaded to storage:`, uploadResult)

        const documentId = uploadResult.document?.id

        if (!documentId) {
          throw new Error('No document ID returned from upload')
        }

        // 2. Trigger Gemini extraction
        setUploadProgress(`Extracting data from ${file.name}... This may take a minute.`)

        const extractResponse = await fetch(extractionEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            documentId: documentId,
            propertyId: propertyId,
          }),
        })

        if (!extractResponse.ok) {
          const errorData = await extractResponse.json()
          console.error(`[AddDocumentDialog] Extraction failed for ${file.name}:`, errorData)
          // Don't throw, continue with partial success
          setUploadProgress(`Warning: Extraction failed for ${file.name}, but document was uploaded.`)
        } else {
          const extractResult = await extractResponse.json()
          console.log(`[AddDocumentDialog] Extraction completed for ${file.name}:`, extractResult)
        }
      }

      setUploadProgress(`${docType === "OS" ? "Operating Statement" : "Offering Memorandum"} uploaded and processed!`)
      setUploadSuccess(true)

      // Trigger refresh
      onDocumentsRefresh?.()
      onComplete?.(selectedFiles, docType)

      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (err: any) {
      console.error(`[AddDocumentDialog] ${docType} upload failed:`, err)
      setError(err.message || `Failed to upload ${docType} document. Please try again.`)
    } finally {
      setIsProcessing(false)
    }
  }

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
    setUploadProgress("Preparing upload...")

    try {
      // Handle Photos upload separately (direct to storage, no REX processing)
      if (selectedDocType === "Photos") {
        await handlePhotosUpload(selectedFiles)
        return
      }

      // Handle OS and OM documents with Gemini extraction (not REX)
      if (selectedDocType === "OS" || selectedDocType === "OM") {
        await handleGeminiDocumentUpload(selectedFiles, selectedDocType)
        return
      }

      // REX is only for Rent Roll documents
      const rexDocType = "rent_roll"
      const uploadedProcessIds: { processId: string; documentId: string; filename: string }[] = []

      // Process each selected file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${selectedFiles.length})...`)

        // 1. Upload to REX API
        const rexResult = await uploadFilesToRex([file.file], {
          documentType: rexDocType,
          clientReference: `UPLOAD-${propertyId || 'no-property'}-${rexDocType}-${Date.now()}`,
          pageRange: 'all',
          templateId: "docin-default",
          templateName: "Docin Default"
        })

        console.log(`[AddDocumentDialog] REX upload successful for ${file.name}:`, rexResult)
        setUploadProgress(`Storing ${file.name} in database...`)

        // 2. Store document in database with propertyId
        const storeResponse = await fetch('/api/documents/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processId: rexResult.processId,
            documentId: rexResult.documentId,
            filename: file.name,
            documentType: rexDocType,
            fileSize: file.size,
            propertyId: propertyId,
          }),
        })

        if (!storeResponse.ok) {
          const errorData = await storeResponse.json()
          throw new Error(errorData.error || 'Failed to store document in database')
        }

        const storeResult = await storeResponse.json()
        console.log(`[AddDocumentDialog] Document stored successfully:`, storeResult)

        // 3. Update extraction status to processing
        await fetch('/api/documents/update', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            processId: rexResult.processId,
            extractionStatus: 'processing',
            uploadStatus: 'completed',
          }),
        })

        uploadedProcessIds.push({
          processId: rexResult.processId,
          documentId: rexResult.documentId,
          filename: file.name,
        })
      }
      
      setUploadProgress("Processing documents... This may take a few minutes.")
      setIsPollingInProgress(true)

      // 4. Start polling for each uploaded document
      for (const { processId, documentId, filename } of uploadedProcessIds) {
        console.log(`[AddDocumentDialog] Starting polling for ${filename} (processId: ${processId})`)
        
        startPolling(processId, {
          maxAttempts: 120, // 10 minutes with 5-second interval
          interval: 5000,
          onStatusUpdate: (status) => {
            console.log(`[AddDocumentDialog] Status update for ${filename}:`, status)
            setUploadProgress(`Processing ${filename}: ${status.status || 'in progress'}...`)
          },
          onCompleted: async (result) => {
            console.log(`[AddDocumentDialog] Extraction completed for ${filename}:`, result)
            
            // Update document status to completed and store the extraction result
            try {
              await fetch('/api/documents/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  processId: processId,
                  extractionStatus: 'completed',
                  extractionResult: result,
                  documentId: documentId,
                }),
              })
              console.log(`[AddDocumentDialog] Document ${filename} updated with extraction result`)
            } catch (updateErr) {
              console.error(`[AddDocumentDialog] Failed to update document ${filename}:`, updateErr)
            }

            // Refresh documents list
            onDocumentsRefresh?.()
          },
          onError: async (err) => {
            console.error(`[AddDocumentDialog] Polling error for ${filename}:`, err)
            
            // Update document status to failed
            try {
              await fetch('/api/documents/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  processId: processId,
                  extractionStatus: 'failed',
                  errorMessage: err.message,
                }),
              })
            } catch (updateErr) {
              console.error(`[AddDocumentDialog] Failed to update error status for ${filename}:`, updateErr)
            }
          },
        }, documentId)
      }
      
      setUploadProgress("Upload complete! Documents are being processed in the background.")
      setUploadSuccess(true)
      
      // Trigger documents refresh
      onDocumentsRefresh?.()
      onComplete?.(selectedFiles, selectedDocType)
      
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (err: any) {
      console.error("[AddDocumentDialog] Upload failed:", err)
      setError(err.message || "Failed to upload files. Please try again.")
      setIsPollingInProgress(false)
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
      case "Photos":
        return <ImageIcon className="w-6 h-6" />
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
      case "Photos":
        return "Property Photos"
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
      case "Photos":
        return "Upload property images and photos"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-5 sm:p-6 max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">Add New Document</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Upload a document and select its type
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {uploadSuccess && (
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600">Document uploaded successfully!</p>
            </div>
          )}

          {/* Document Type Selection */}
          {!uploadSuccess && (
            <>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">Select Document Type</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {(["OS", "RR", "OM", "Photos"] as DocumentType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedDocType(type)}
                      className={`flex flex-col items-center gap-3 py-5 px-4 rounded-xl transition-all duration-200 cursor-pointer border-2 touch-manipulation text-center ${
                        selectedDocType === type
                          ? "border-gray-900 bg-gray-50 shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`p-3 rounded-xl transition-colors duration-200 ${selectedDocType === type ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600"}`}>
                        {getDocTypeIcon(type)}
                      </div>
                      <div>
                        <h4 className={`text-sm font-medium mb-1 ${selectedDocType === type ? "text-gray-900" : "text-gray-800"}`}>
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
                  className={`border-2 border-dashed rounded-xl p-10 sm:p-12 text-center transition-all duration-200 ${
                    isDragging
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                  }`}
                >
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-xl flex items-center justify-center ${isDragging ? "bg-gray-900 text-white" : "bg-gray-100"}`}>
                    <Upload className={`w-7 h-7 ${isDragging ? "text-white" : "text-gray-500"}`} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drag and drop your {getDocTypeLabel(selectedDocType)} {selectedDocType === "Photos" ? "images" : "file"} here
                  </p>
                  <p className="text-xs text-gray-500 mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Browse Files
                  </button>
                  <p className="text-xs text-gray-400 mt-4">
                    {selectedDocType === "Photos" 
                      ? "Supported: JPG, PNG, GIF, WebP (max 50MB)"
                      : "Supported: PDF, Excel, Images (max 50MB)"}
                  </p>
                </div>
              )}

              {/* Processing Indicator */}
              {isProcessing && uploadedFiles.length === 0 && (
                <div className="flex items-center justify-center gap-3 p-6">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  <span className="text-sm text-gray-600">Processing files...</span>
                </div>
              )}

              {/* Upload Progress Indicator */}
              {isProcessing && uploadProgress && uploadedFiles.length > 0 && (
                <div className="flex items-center justify-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-700" />
                  <span className="text-sm text-gray-700 font-medium">{uploadProgress}</span>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={selectedDocType === "Photos" ? ".jpg,.jpeg,.png,.gif,.webp" : ".pdf,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"}
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                      Selected Files ({uploadedFiles.filter((f) => f.selected).length})
                    </h3>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      + Add more files
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.id}
                        className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${
                          file.selected
                            ? "bg-gray-50 border-gray-300"
                            : "bg-white border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={file.selected}
                          onChange={() => toggleFileSelection(file.id)}
                          className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-500"
                        />
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <button
                      onClick={handleReset}
                      className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Reset
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleProceed}
                        disabled={isProcessing || uploadedFiles.filter((f) => f.selected).length === 0}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
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
