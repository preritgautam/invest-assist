"use client"

import type React from "react"
import { useState, useCallback, useRef, useEffect } from "react"
import { Upload, FileArchive, File, Mail, Edit, X, Check, AlertCircle, Loader2, ChevronDown, ChevronRight, Calendar, FileText, Layers, Eye, Pencil } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AppButton } from "@/components/ui/app-button"
import { AppCard } from "@/components/ui/app-card"
import { Badge } from "@/components/ui/badge"
import { extractZipFile } from "@/lib/file-upload-utils"
import { uploadFilesToRex } from "@/lib/rex-client"
import { useRexPolling } from "@/hooks/use-rex-polling"
import { storeDocument, updateDocumentStatus } from "@/lib/document-utils"
import type { DocumentSegment, ClassificationResult } from "@/lib/supabase/database.types"
import { PDFViewer } from "./pdf-viewer"

// Segment with local tracking
interface DetectedSegment extends DocumentSegment {
  id: string
  sourceFileId: string
  enabled: boolean
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  selected: boolean
  file: File
  fromZip?: boolean
  zipParent?: string
  localPath?: string
  documentId?: number
  storagePath?: string
  classificationStatus?: 'pending' | 'processing' | 'completed' | 'failed'
  classificationType?: string
  classificationResult?: ClassificationResult
  totalPages?: number
}

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (files: UploadedFile[], propertyId?: string) => void
}

type UploadStep = 'select' | 'uploading' | 'classifying' | 'reviewing' | 'processing' | 'complete'

export function UploadDialog({ isOpen, onClose, onComplete }: UploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  console.log('[UploadDialog] Uploaded files:', uploadedFiles)
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"zip" | "files" | "email" | "manual" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [uploadStep, setUploadStep] = useState<UploadStep>('select');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const { isPolling, status, result, error: pollingError, startPolling, stopPolling } = useRexPolling();

  // Segment review state
  const [detectedSegments, setDetectedSegments] = useState<DetectedSegment[]>([])
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [previewFileId, setPreviewFileId] = useState<string | null>(null)
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null)
  const [editPageRange, setEditPageRange] = useState<string>("")

  // two separate refs: one for zip picker, one for regular files
  const fileInputZipRef = useRef<HTMLInputElement>(null)
  const fileInputFilesRef = useRef<HTMLInputElement>(null)

  // Reset dialog state when it closes, but NOT the polling queue
  useEffect(() => {
    if (!isOpen) {
      // Reset UI state when dialog closes, but preserve polling state
      // This allows background polling to continue even when dialog is closed
      setUploadedFiles([])
      setIsDragging(false)
      setIsProcessing(false)
      setUploadMethod(null)
      setError(null)
      setUploadSuccess(false)
      setProcessId(null)
      setDocumentId(null)
      setPropertyId(null)
      setUploadStep('select')
      setUploadProgress({ current: 0, total: 0 })
      setDetectedSegments([])
      setExpandedFiles(new Set())
      setPreviewFileId(null)
      setEditingSegmentId(null)
      setEditPageRange("")
      // NOTE: We intentionally do NOT clear the polling state here
      // The polling queue in sessionStorage will persist and resume on next page load
    }
  }, [isOpen])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  /**
   * handleFiles now accepts FileList | File[] | null
   * and enforces the current uploadMethod (if zip-only, skip non-zip and show an error)
   */
  const handleFiles = useCallback(
    async (filesInput: FileList | File[] | null) => {
      if (!filesInput) return
      setIsProcessing(true)
      setError(null)
      const newFiles: UploadedFile[] = []

      // normalize to array
      const filesArray: File[] = filesInput instanceof FileList ? Array.from(filesInput) : Array.isArray(filesInput) ? filesInput : []

      try {
        for (let i = 0; i < filesArray.length; i++) {
          const file = filesArray[i]

          // Enforce file selection mode: if we're in 'zip' mode, only allow zip files
          if (uploadMethod === "zip" && !(file.name.endsWith(".zip") || file.type === "application/zip")) {
            setError("Only .zip files are allowed for Zip upload. Non-zip files were skipped.")
            continue
          }

          // Check file size (50MB limit for Supabase Storage)
          if (file.size > 50 * 1024 * 1024) {
            setError(`File ${file.name} exceeds 50MB limit`)
            continue
          }

          // If it's a zip, extract contents
          if (file.name.endsWith(".zip") || file.type === "application/zip") {
            try {
              const extractedFiles = await extractZipFile(file)

              extractedFiles.forEach((extractedFile, index) => {
                newFiles.push({
                  id: `${Date.now()}-${i}-${index}`,
                  name: extractedFile.name,
                  size: extractedFile.size,
                  type: extractedFile.type,
                  selected: true,
                  file: extractedFile.file,
                  fromZip: true,
                  zipParent: file.name,
                })
              })
            } catch (err) {
              console.error("Error extracting zip:", err)
              setError(`Failed to extract ${file.name}`)
            }
          } else {
            // Regular file
            newFiles.push({
              id: `${Date.now()}-${i}`,
              name: file.name,
              size: file.size,
              type: file.type,
              selected: true,
              file: file,
            })
          }
        }

        setUploadedFiles((prev) => [...prev, ...newFiles])
      } catch (err) {
        console.error("Error processing files:", err)
        setError("Failed to process some files")
      } finally {
        setIsProcessing(false)
      }
    },
    [uploadMethod],
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
      // if user hasn't selected a mode, default to 'files' mode for drag-drop
      const mode = uploadMethod ?? "files"
      // handleFiles will enforce mode via uploadMethod (we already set uploadMethod when user clicked)
      handleFiles(e.dataTransfer.files)
    },
    [handleFiles, uploadMethod],
  )

  // called by the "Individual Files" input
  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // ensure we are in files mode
      setUploadMethod("files")
      handleFiles(e.target.files ? Array.from(e.target.files) : null)
      // reset input value so same file can be re-selected if needed
      e.currentTarget.value = ""
    },
    [handleFiles],
  )

  // called by the "Zip" input
  const handleZipInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setUploadMethod("zip")
      const raw = Array.from(e.target.files || [])
      // filter to only zips, but pass them to handleFiles (which also enforces)
      const zips = raw.filter((f) => f.name.endsWith(".zip") || f.type === "application/zip")
      if (zips.length === 0 && raw.length > 0) {
        setError("Please select .zip files only.")
      }
      handleFiles(zips)
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

    setIsProcessing(true)
    setError(null)
    setUploadSuccess(false)
    setUploadStep('uploading')
    setUploadProgress({ current: 0, total: selectedFiles.length })

    try {
      // Step 1: Create a placeholder property
      let propertyResponse: Response
      try {
        propertyResponse = await fetch('/api/properties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'processing',
          }),
        })
      } catch (networkError) {
        console.error('[Upload] Network error creating property:', networkError)
        throw new Error('Network error: Unable to connect to server. Please check your connection and try again.')
      }

      if (!propertyResponse.ok) {
        let errorMessage = 'Failed to create property'
        try {
          const errorData = await propertyResponse.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // Response wasn't JSON, use status text
          errorMessage = `Server error (${propertyResponse.status}): ${propertyResponse.statusText}`
        }
        throw new Error(errorMessage)
      }

      const { property } = await propertyResponse.json()
      setPropertyId(property.id)
      console.log('[Upload] Created property:', property.id)

      // Step 2: Upload files to Supabase Storage
      const uploadedDocs: UploadedFile[] = []

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setUploadProgress({ current: i + 1, total: selectedFiles.length })

        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('propertyId', property.id)

        let uploadResponse: Response
        try {
          uploadResponse = await fetch('/api/storage/upload', {
            method: 'POST',
            body: formData,
          })
        } catch (networkError) {
          console.error(`[Upload] Network error uploading ${file.name}:`, networkError)
          // Continue with other files instead of failing completely
          continue
        }

        if (!uploadResponse.ok) {
          let errorMessage = 'Unknown error'
          try {
            const errorData = await uploadResponse.json()
            errorMessage = errorData.error || errorMessage
          } catch {
            errorMessage = `Server error (${uploadResponse.status})`
          }
          console.error(`[Upload] Failed to upload ${file.name}:`, errorMessage)
          continue
        }

        const { document } = await uploadResponse.json()
        console.log(`[Upload] Uploaded ${file.name}:`, document)

        uploadedDocs.push({
          ...file,
          documentId: document.id,
          storagePath: document.storage_path,
          classificationStatus: 'pending',
        })
      }

      setUploadedFiles(uploadedDocs)

      // Check if any files were uploaded successfully
      if (uploadedDocs.length === 0) {
        throw new Error('No files were uploaded successfully. Please try again.')
      }

      console.log(`[Upload] Successfully uploaded ${uploadedDocs.length}/${selectedFiles.length} files`)

      // Step 3: Classify documents using Gemini Vision
      setUploadStep('classifying')

      // Track classification results locally (state updates are async)
      const classifiedDocs: UploadedFile[] = [...uploadedDocs]

      for (let i = 0; i < uploadedDocs.length; i++) {
        const doc = uploadedDocs[i]
        if (!doc.documentId) continue

        try {
          // Update file classification status
          setUploadedFiles(prev => prev.map(f =>
            f.id === doc.id ? { ...f, classificationStatus: 'processing' as const } : f
          ))

          const classifyResponse = await fetch('/api/documents/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documentId: doc.documentId }),
          })

          if (classifyResponse.ok) {
            const { classification } = await classifyResponse.json() as { classification: ClassificationResult }
            // Update local array with full classification result
            classifiedDocs[i] = {
              ...classifiedDocs[i],
              classificationStatus: 'completed',
              classificationType: classification.document_type,
              classificationResult: classification,
              totalPages: classification.total_pages,
            }
            setUploadedFiles(prev => prev.map(f =>
              f.id === doc.id
                ? {
                  ...f,
                  classificationStatus: 'completed' as const,
                  classificationType: classification.document_type,
                  classificationResult: classification,
                  totalPages: classification.total_pages,
                }
                : f
            ))
            console.log(`[Classification] ${doc.name}:`, classification.document_type, 'segments:', classification.segments?.length || 0)
          } else {
            classifiedDocs[i] = { ...classifiedDocs[i], classificationStatus: 'failed' }
            setUploadedFiles(prev => prev.map(f =>
              f.id === doc.id ? { ...f, classificationStatus: 'failed' as const } : f
            ))
          }
        } catch (classifyError) {
          console.error(`[Classification] Error for ${doc.name}:`, classifyError)
          classifiedDocs[i] = { ...classifiedDocs[i], classificationStatus: 'failed' }
          setUploadedFiles(prev => prev.map(f =>
            f.id === doc.id ? { ...f, classificationStatus: 'failed' as const } : f
          ))
        }
      }

      // Build detected segments from classification results
      const allSegments: DetectedSegment[] = []
      classifiedDocs.forEach((doc, fileIndex) => {
        if (doc.classificationResult?.segments) {
          doc.classificationResult.segments.forEach((segment, segIndex) => {
            allSegments.push({
              ...segment,
              id: `${doc.id}-seg-${segIndex}`,
              sourceFileId: doc.id,
              enabled: segment.type === 'rent_roll' || segment.type === 'operating_statement',
            })
          })
        }
      })

      setDetectedSegments(allSegments)
      setUploadedFiles(classifiedDocs)

      // Expand all files by default to show segments
      setExpandedFiles(new Set(classifiedDocs.map(d => d.id)))

      // Step 4: Show segment review UI
      setUploadStep('reviewing')
      setIsProcessing(false)

    } catch (err: any) {
      console.error("Upload failed:", err)
      setError(err.message || "Failed to upload files. Please try again.")
      setUploadStep('select')
      setIsProcessing(false)
    }
  }

  // Handle proceeding from segment review to extraction
  const handleProceedToExtraction = async () => {
    setIsProcessing(true)
    setError(null)
    setUploadStep('processing')

    try {
      // Get enabled segments for extraction
      const enabledSegments = detectedSegments.filter(s => s.enabled)

      console.log('[Extraction] Enabled segments:', enabledSegments.map(s => ({
        type: s.type,
        page_range: s.page_range,
        sourceFileId: s.sourceFileId,
        period: s.period_info?.period_label,
      })))

      if (enabledSegments.length === 0) {
        setUploadSuccess(true)
        setUploadStep('complete')
        onComplete?.(uploadedFiles, propertyId || undefined)
        return
      }

      // Group segments by source file
      const segmentsByFile = enabledSegments.reduce((acc, segment) => {
        if (!acc[segment.sourceFileId]) {
          acc[segment.sourceFileId] = []
        }
        acc[segment.sourceFileId].push(segment)
        return acc
      }, {} as Record<string, DetectedSegment[]>)

      // Track the first extraction for polling (others will be handled by background polling)
      let firstProcessId: string | null = null
      let firstDocumentId: string | null = null

      // Process each source file and its segments
      for (const [sourceFileId, fileSegments] of Object.entries(segmentsByFile)) {
        const sourceFile = uploadedFiles.find(f => f.id === sourceFileId)
        if (!sourceFile || !sourceFile.documentId) {
          console.warn(`[Extraction] Source file not found or missing documentId: ${sourceFileId}`)
          continue
        }

        // Create segment records in the database
        const segmentsToCreate = fileSegments.map(seg => ({
          type: seg.type,
          page_range: seg.page_range,
          confidence: seg.confidence,
          sheet_index: seg.sheet_index,
          sheet_name: seg.sheet_name,
          period_info: seg.period_info,
        }))

        let createdSegments: any[] = []
        try {
          const segmentResponse = await fetch('/api/documents/segments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceDocumentId: sourceFile.documentId,
              segments: segmentsToCreate,
            }),
          })

          if (segmentResponse.ok) {
            const segmentData = await segmentResponse.json()
            createdSegments = segmentData.segments || []
            console.log(`[Extraction] Created ${createdSegments.length} segment records`)
          } else {
            console.error('[Extraction] Failed to create segment records')
          }
        } catch (segmentErr) {
          console.error('[Extraction] Error creating segment records:', segmentErr)
        }

        // For each extractable segment (rent_roll or operating_statement), send to REX
        for (let i = 0; i < fileSegments.length; i++) {
          const segment = fileSegments[i]
          const createdSegment = createdSegments[i]

          // Only extract rent_roll and operating_statement types
          if (segment.type !== 'rent_roll' && segment.type !== 'operating_statement') {
            console.log(`[Extraction] Skipping non-extractable segment type: ${segment.type}`)
            continue
          }

          try {
            const result = await uploadFilesToRex([sourceFile.file], {
              documentType: segment.type,
              clientReference: `UPLOAD-${propertyId}-${segment.type}-${segment.page_range}`,
              pageRange: segment.page_range || 'all',
              sheetIndex: segment.sheet_index?.toString() || '',
              templateId: "docin-default",
              templateName: "Docin Default"
            })

            console.log(`[Extraction] REX upload successful for ${segment.type}:`, result)

            // Update the segment record with the REX process info
            if (createdSegment) {
              try {
                await fetch('/api/documents/update', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    processId: createdSegment.process_id,
                    extractionStatus: 'processing',
                    documentId: result.documentId,
                  }),
                })

                // Also update with the REX process ID for polling
                await fetch(`/api/documents/${createdSegment.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    process_id: result.processId,
                    document_id: result.documentId,
                    extraction_status: 'processing',
                  }),
                })
              } catch (updateErr) {
                console.error('[Extraction] Failed to update segment with REX info:', updateErr)
              }
            }

            // Track first extraction for immediate polling
            if (!firstProcessId) {
              firstProcessId = result.processId
              firstDocumentId = result.documentId
            }

          } catch (rexErr: any) {
            console.error(`[Extraction] REX upload failed for ${segment.type}:`, rexErr)
            // Mark segment as failed
            if (createdSegment) {
              try {
                await fetch(`/api/documents/${createdSegment.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    extraction_status: 'failed',
                    error_message: rexErr.message || 'REX upload failed',
                  }),
                })
              } catch (updateErr) {
                console.error('[Extraction] Failed to update segment error status:', updateErr)
              }
            }
          }
        }
      }

      // Set the first process ID for polling
      if (firstProcessId) {
        setProcessId(firstProcessId)
        setDocumentId(firstDocumentId)
      }

      setUploadSuccess(true)
      setUploadStep('complete')
      onComplete?.(uploadedFiles, propertyId || undefined)

    } catch (err: any) {
      console.error("Extraction failed:", err)
      setError(err.message || "Failed to start extraction. Please try again.")
      setUploadStep('reviewing')
    } finally {
      setIsProcessing(false)
    }
  }


  // Start polling only when processId is available
  useEffect(() => {
    if (processId) {
      startPolling(processId, {
        interval: 10000,      // Poll every 10 seconds
        maxAttempts: 120,    // Try for up to 20 minutes
        onStatusUpdate: async (status) => {
          console.log('[Polling] Status update:', status);

          // Periodically sync extraction status to database
          // NOTE: Only update the status field, NOT the extraction_result
          // The extraction_result should only contain the final result with data.extraction.units
          if (status?.status && status.status !== 'completed') {
            try {
              await updateDocumentStatus(
                processId,
                status.status || 'processing',
                undefined, // Don't save status as extraction_result - it doesn't have the right structure
                undefined
              );
              console.log('[DB] Document status synced during extraction');
            } catch (err) {
              console.error('[DB] Failed to sync document status during polling:', err);
              // Don't stop polling due to sync errors - extraction may still complete
            }
          }
        },
        onCompleted: async (result) => {
          console.log('[Polling] Extraction completed:', result);
          // Note: Result persistence is now handled in the polling hook itself
          // This ensures results are saved even if this callback is lost on page refresh
          setUploadSuccess(true);
          // Optional: Close dialog or show results
          setTimeout(() => {
            onClose();
          }, 1500);
        },
        onError: async (error) => {
          console.error('[Polling] Error:', error);
          // Note: Error persistence is now handled in the polling hook itself
          // This ensures errors are saved even if this callback is lost on page refresh

          setError(`Extraction failed: ${error.message}`);
        },
      }, documentId || undefined);
    }

    // NOTE: Do NOT stop polling when component unmounts.
    // The polling state is persisted in sessionStorage and will resume
    // when the component remounts or page refreshes. Only stopPolling()
    // is called by the hook when polling completes or errors.
  }, [processId, documentId, onClose]);


  const handleManualEntry = useCallback(() => {
    setUploadMethod("manual")
    onComplete?.([])
    onClose()
  }, [onComplete, onClose])

  const handleReset = useCallback(() => {
    setUploadedFiles([])
    setUploadMethod(null)
    setIsProcessing(false)
    setError(null)
    setUploadStep('select')
  }, [])

  const getStepMessage = () => {
    switch (uploadStep) {
      case 'uploading':
        return `Uploading files to storage (${uploadProgress.current}/${uploadProgress.total})...`
      case 'classifying':
        return 'Analyzing document types with AI...'
      case 'reviewing':
        return 'Review detected segments'
      case 'processing':
        return 'Extracting data from documents...'
      case 'complete':
        return 'Upload complete!'
      default:
        return ''
    }
  }

  // Segment management helpers
  const toggleFileExpand = (fileId: string) => {
    setExpandedFiles(prev => {
      const next = new Set(prev)
      if (next.has(fileId)) {
        next.delete(fileId)
      } else {
        next.add(fileId)
      }
      return next
    })
  }

  const toggleSegmentEnabled = (segmentId: string) => {
    setDetectedSegments(prev => prev.map(s =>
      s.id === segmentId ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const getSegmentsForFile = (fileId: string) => {
    console.log('[Segments] Getting segments for file:', detectedSegments.filter(s => s.sourceFileId === fileId))
    return detectedSegments.filter(s => s.sourceFileId === fileId)
  }

  const getSegmentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'rent_roll': 'Rent Roll',
      'operating_statement': 'T-12 / Operating Statement',
      'offering_memorandum': 'Offering Memorandum',
      'appraisal': 'Appraisal',
      'insurance': 'Insurance',
      'lease_abstract': 'Lease Abstract',
      'other': 'Other',
    }
    return labels[type] || type
  }

  const getSegmentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'rent_roll': 'bg-blue-100 text-blue-700 border-blue-200',
      'operating_statement': 'bg-green-100 text-green-700 border-green-200',
      'offering_memorandum': 'bg-purple-100 text-purple-700 border-purple-200',
      'appraisal': 'bg-orange-100 text-orange-700 border-orange-200',
      'insurance': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'lease_abstract': 'bg-pink-100 text-pink-700 border-pink-200',
      'other': 'bg-gray-100 text-gray-700 border-gray-200',
    }
    return colors[type] || colors['other']
  }

  // Parse page range string to array of page numbers
  const parsePageRange = (range: string): number[] => {
    if (!range || range === 'all') return []
    const pages: number[] = []
    const parts = range.split(',').map(p => p.trim())
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            pages.push(i)
          }
        }
      } else {
        const num = Number(part)
        if (!isNaN(num)) {
          pages.push(num)
        }
      }
    }
    return [...new Set(pages)].sort((a, b) => a - b)
  }

  // Get highlighted pages for the currently previewed file
  const getHighlightedPages = (): number[] => {
    if (!previewFileId) return []
    const fileSegments = detectedSegments.filter(s => s.sourceFileId === previewFileId && s.enabled)
    const pages: number[] = []
    for (const segment of fileSegments) {
      pages.push(...parsePageRange(segment.page_range))
    }
    return [...new Set(pages)].sort((a, b) => a - b)
  }

  // Start editing a segment's page range
  const startEditingPageRange = (segmentId: string, currentRange: string) => {
    setEditingSegmentId(segmentId)
    setEditPageRange(currentRange)
  }

  // Save edited page range
  const savePageRange = (segmentId: string) => {
    setDetectedSegments(prev => prev.map(s =>
      s.id === segmentId ? { ...s, page_range: editPageRange } : s
    ))
    setEditingSegmentId(null)
    setEditPageRange("")
  }

  // Cancel editing
  const cancelEditingPageRange = () => {
    setEditingSegmentId(null)
    setEditPageRange("")
  }

  // Get the file being previewed
  const previewFile = previewFileId ? uploadedFiles.find(f => f.id === previewFileId) : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-h-[90vh] overflow-y-auto p-4 sm:p-6 ${
        uploadStep === 'reviewing'
          ? 'max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-7xl'
          : 'max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl'
      }`}>
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold">Add Property - Step A: Upload Files</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Choose how you'd like to add property data to your portfolio
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-4">
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-500">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Upload Method Selection */}
          {uploadedFiles.length === 0 && uploadStep === 'select' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <AppCard
                hover
                className="cursor-pointer border-2 border-dashed border-border hover:border-muted-foreground transition-all touch-manipulation"
                onClick={() => {
                  // open zip-only picker
                  setUploadMethod("zip")
                  fileInputZipRef.current?.click()
                }}
              >
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-data-accent-blue/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <FileArchive className="w-5 h-5 sm:w-6 sm:h-6 text-data-accent-blue" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2">Upload Zip Folder</h3>
                  <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                    Upload entire zip folders downloaded from CRE MLS sites
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    Recommended
                  </Badge>
                </div>
              </AppCard>

              <AppCard
                hover
                className="cursor-pointer border-2 border-dashed border-border hover:border-muted-foreground transition-all touch-manipulation"
                onClick={() => {
                  // open individual files picker
                  setUploadMethod("files")
                  fileInputFilesRef.current?.click()
                }}
              >
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-data-accent-green/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <File className="w-5 h-5 sm:w-6 sm:h-6 text-data-accent-green" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2">Upload Individual Files</h3>
                  <p className="text-xs text-muted-foreground">
                    Select specific files like PDFs, Excel sheets, or images
                  </p>
                </div>
              </AppCard>

              <AppCard
                hover
                className="cursor-pointer border-2 border-dashed border-border hover:border-muted-foreground transition-all touch-manipulation"
                onClick={() => setUploadMethod("email")}
              >
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-data-accent-purple/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-data-accent-purple" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2">Email Forwarding</h3>
                  <p className="text-xs text-muted-foreground">
                    Forward emails with attachments to your dedicated address
                  </p>
                </div>
              </AppCard>

              <AppCard
                hover
                className="cursor-pointer border-2 border-dashed border-border hover:border-muted-foreground transition-all touch-manipulation"
                onClick={handleManualEntry}
              >
                <div className="flex flex-col items-center justify-center p-4 sm:p-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-data-accent-orange/10 rounded-full flex items-center justify-center mb-2 sm:mb-3">
                    <Edit className="w-5 h-5 sm:w-6 sm:h-6 text-data-accent-orange" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground mb-1 sm:mb-2">Manual Entry</h3>
                  <p className="text-xs text-muted-foreground">
                    Enter property details directly without uploading files
                  </p>
                </div>
              </AppCard>
            </div>
          )}

          {/* Email Forwarding Instructions */}
          {uploadMethod === "email" && uploadedFiles.length === 0 && (
            <AppCard className="bg-data-accent-purple/5 border-data-accent-purple/20">
              <div className="p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-data-accent-purple/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-data-accent-purple" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground mb-2">Email Forwarding Setup</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Forward property documents to your dedicated email address and they'll automatically appear in
                      your storage.
                    </p>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-3 sm:p-4 mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Your dedicated email address:</p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono text-foreground break-all">
                      property-upload-{"{user-id}"}@clik.ai
                    </code>
                    <AppButton size="sm" variant="outline" className="touch-manipulation">
                      Copy
                    </AppButton>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">How it works:</p>
                  <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                    <li>Forward any email with property documents to the address above</li>
                    <li>Attachments will be automatically extracted and stored</li>
                    <li>You'll receive a notification when files are ready to review</li>
                    <li>Access your uploaded files from the dashboard</li>
                  </ol>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <AppButton size="sm" onClick={() => setUploadMethod(null)} className="touch-manipulation">
                    Back to Options
                  </AppButton>
                  <AppButton size="sm" variant="outline" onClick={onClose} className="touch-manipulation">
                    Done
                  </AppButton>
                </div>
              </div>
            </AppCard>
          )}

          {/* File Upload Area (drag & drop) */}
          {(uploadMethod === "files" || uploadMethod === "zip") && uploadedFiles.length === 0 && uploadStep === 'select' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${isDragging
                  ? "border-data-accent-blue bg-data-accent-blue/5"
                  : "border-border hover:border-muted-foreground bg-muted/30"
                }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-2">
                  {isDragging ? "Drop files here" : uploadMethod === "zip" ? "Drop ZIP files here" : "Drag and drop files here"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">or</p>
                <div className="flex gap-2 justify-center">
                  <AppButton onClick={() => fileInputFilesRef.current?.click()} className="touch-manipulation">
                    Browse Files
                  </AppButton>
                  <AppButton onClick={() => fileInputZipRef.current?.click()} variant="outline" className="touch-manipulation">
                    Browse ZIPs
                  </AppButton>
                </div>
                <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                  {uploadMethod === "zip" ? "Supports: ZIP (Max 50MB per file)" : "Supports: ZIP, PDF, Excel, Images (Max 50MB per file)"}
                </p>
              </div>
            </div>
          )}

          {/* Hidden file inputs */}
          <input
            ref={fileInputZipRef}
            type="file"
            multiple
            accept=".zip,application/zip"
            onChange={handleZipInputChange}
            className="hidden"
          />

          <input
            ref={fileInputFilesRef}
            type="file"
            multiple
            accept=".zip,.pdf,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Processing Indicator */}
          {isProcessing && uploadStep !== 'select' && (
            <div className="flex flex-col items-center justify-center gap-3 p-6">
              <Loader2 className="w-8 h-8 animate-spin text-data-accent-blue" />
              <span className="text-sm text-muted-foreground">{getStepMessage()}</span>
              {uploadStep === 'uploading' && (
                <div className="w-full max-w-xs bg-muted rounded-full h-2">
                  <div
                    className="bg-data-accent-blue h-2 rounded-full transition-all"
                    style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Processing Indicator for file extraction */}
          {isProcessing && uploadStep === 'select' && (
            <div className="flex items-center justify-center gap-3 p-6">
              <Loader2 className="w-5 h-5 animate-spin text-data-accent-blue" />
              <span className="text-sm text-muted-foreground">Processing files...</span>
            </div>
          )}

          {/* Segment Review UI with Split Pane */}
          {uploadStep === 'reviewing' && !isProcessing && (
            <div className="space-y-4">
              {/* Split Pane Layout - Header and content side by side */}
              <div className="flex gap-4 min-h-[80vh] items-stretch">
                {/* Left Panel - File/Segment List */}
                <div className={`flex flex-col space-y-3 overflow-y-auto ${previewFile ? 'w-1/4' : 'w-full'}`}>
                  {/* Header */}
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-data-accent-blue" />
                    <h3 className="text-sm font-bold text-foreground">Review Detected Segments</h3>
                  </div>

                  {/* Info Box */}
                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <AlertCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-foreground">
                      <p className="font-medium mb-1">AI has analyzed your documents</p>
                      <p className="text-muted-foreground">
                        Select which segments to extract. Click the <Eye className="w-3 h-3 inline" /> icon to preview a file and verify page ranges. You can edit page ranges if needed.
                      </p>
                    </div>
                  </div>

                  {/* File List */}
                  {uploadedFiles.map((file) => {
                    const fileSegments = getSegmentsForFile(file.id)
                    const isExpanded = expandedFiles.has(file.id)
                    const enabledCount = fileSegments.filter(s => s.enabled).length
                    const isPreviewing = previewFileId === file.id

                    return (
                      <div key={file.id} className={`border rounded-lg overflow-hidden ${isPreviewing ? 'border-data-accent-blue border-2' : 'border-border'}`}>
                        {/* File Header */}
                        <div className="flex items-center gap-2 p-3 bg-card">
                          <button
                            onClick={() => toggleFileExpand(file.id)}
                            className="flex-shrink-0 hover:bg-muted rounded p-0.5"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            )}
                          </button>

                          <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                            <File className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="flex-1 min-w-0 text-left">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{formatFileSize(file.size)}</span>
                              {file.totalPages && (
                                <>
                                  <span>•</span>
                                  <span>{file.totalPages} pages</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{fileSegments.length} segment{fileSegments.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {file.classificationStatus === 'completed' && (
                              <Badge variant="secondary" className={`text-xs ${getSegmentTypeColor(file.classificationType || 'other')}`}>
                                {getSegmentTypeLabel(file.classificationType || 'other')}
                              </Badge>
                            )}
                            {file.classificationStatus === 'failed' && (
                              <Badge variant="destructive" className="text-xs">
                                Classification failed
                              </Badge>
                            )}

                            {/* Preview Button - only for PDFs */}
                            {file.file.type === 'application/pdf' && (
                              <button
                                onClick={() => setPreviewFileId(isPreviewing ? null : file.id)}
                                className={`p-1.5 rounded transition-colors ${
                                  isPreviewing
                                    ? 'bg-data-accent-blue text-white'
                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                }`}
                                title={isPreviewing ? 'Close preview' : 'Preview PDF'}
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}

                            <span className="text-xs text-muted-foreground">
                              {enabledCount}/{fileSegments.length}
                            </span>
                          </div>
                        </div>

                        {/* Segments List (expanded) */}
                        {isExpanded && fileSegments.length > 0 && (
                          <div className="border-t border-border bg-muted/30">
                            {fileSegments.map((segment) => (
                              <div
                                key={segment.id}
                                className={`flex items-center gap-3 p-3 border-b border-border last:border-b-0 ${
                                  segment.enabled ? 'bg-card' : 'bg-muted/50'
                                }`}
                              >
                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleSegmentEnabled(segment.id)}
                                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                    segment.enabled
                                      ? 'bg-data-accent-blue border-data-accent-blue'
                                      : 'bg-card border-border hover:border-muted-foreground'
                                  }`}
                                >
                                  {segment.enabled && <Check className="w-3 h-3 text-primary-foreground" />}
                                </button>

                                {/* Segment Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <Badge className={`text-xs ${getSegmentTypeColor(segment.type)}`}>
                                      {getSegmentTypeLabel(segment.type)}
                                    </Badge>

                                    {/* Editable Page Range */}
                                    {segment.page_range && segment.page_range !== 'all' && (
                                      editingSegmentId === segment.id ? (
                                        <div className="flex items-center gap-1">
                                          <FileText className="w-3 h-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">Pages</span>
                                          <input
                                            type="text"
                                            value={editPageRange}
                                            onChange={(e) => setEditPageRange(e.target.value)}
                                            className="w-20 px-1.5 py-0.5 text-xs border border-border rounded bg-card focus:outline-none focus:ring-1 focus:ring-data-accent-blue"
                                            placeholder="e.g. 1-5"
                                            autoFocus
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') savePageRange(segment.id)
                                              if (e.key === 'Escape') cancelEditingPageRange()
                                            }}
                                          />
                                          <button
                                            onClick={() => savePageRange(segment.id)}
                                            className="p-0.5 hover:bg-green-100 rounded text-green-600"
                                            title="Save"
                                          >
                                            <Check className="w-3 h-3" />
                                          </button>
                                          <button
                                            onClick={cancelEditingPageRange}
                                            className="p-0.5 hover:bg-red-100 rounded text-red-600"
                                            title="Cancel"
                                          >
                                            <X className="w-3 h-3" />
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => startEditingPageRange(segment.id, segment.page_range)}
                                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground group"
                                          title="Click to edit page range"
                                        >
                                          <FileText className="w-3 h-3" />
                                          Pages {segment.page_range}
                                          <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                      )
                                    )}

                                    {/* Sheet Info */}
                                    {segment.sheet_name && (
                                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Layers className="w-3 h-3" />
                                        Sheet: {segment.sheet_name}
                                      </span>
                                    )}
                                  </div>

                                  {/* Period/Date Info */}
                                  {segment.period_info && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                      <Calendar className="w-3 h-3" />
                                      {segment.period_info.period_label ? (
                                        <span>{segment.period_info.period_label}</span>
                                      ) : segment.period_info.document_date ? (
                                        <span>As of {new Date(segment.period_info.document_date).toLocaleDateString()}</span>
                                      ) : segment.period_info.period_start && segment.period_info.period_end ? (
                                        <span>
                                          {new Date(segment.period_info.period_start).toLocaleDateString()} - {new Date(segment.period_info.period_end).toLocaleDateString()}
                                        </span>
                                      ) : null}
                                    </div>
                                  )}
                                </div>

                                {/* Confidence */}
                                <div className="text-xs text-muted-foreground">
                                  {Math.round(segment.confidence * 100)}%
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* No segments message */}
                        {isExpanded && fileSegments.length === 0 && (
                          <div className="p-4 text-center text-sm text-muted-foreground bg-muted/30 border-t border-border">
                            No extractable segments detected in this file
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Right Panel - PDF Viewer */}
                {previewFile && previewFile.file.type === 'application/pdf' && (
                  <div className="w-3/4 border border-border rounded-lg overflow-hidden bg-muted/30 flex flex-col">
                    <div className="flex items-center justify-between p-2 bg-card border-b border-border flex-shrink-0">
                      <span className="text-xs font-medium text-foreground truncate">{previewFile.name}</span>
                      <button
                        onClick={() => setPreviewFileId(null)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground"
                        title="Close preview"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <PDFViewer
                        file={previewFile.file}
                        highlightedPages={getHighlightedPages()}
                        className="h-full"
                      />
                    </div>
                    {/* Page range hint */}
                    {getHighlightedPages().length > 0 && (
                      <div className="p-2 bg-data-accent-blue/10 border-t border-data-accent-blue/20 text-xs text-data-accent-blue flex-shrink-0">
                        Highlighted pages: {getHighlightedPages().join(', ')} (from enabled segments)
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border">
                <div className="text-sm">
                  <span className="font-medium">{detectedSegments.filter(s => s.enabled).length}</span>
                  <span className="text-muted-foreground"> of </span>
                  <span className="font-medium">{detectedSegments.length}</span>
                  <span className="text-muted-foreground"> segments selected for extraction</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDetectedSegments(prev => prev.map(s => ({ ...s, enabled: true })))}
                    className="text-xs text-data-accent-blue hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground">|</span>
                  <button
                    onClick={() => setDetectedSegments(prev => prev.map(s => ({ ...s, enabled: false })))}
                    className="text-xs text-muted-foreground hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                <AppButton variant="outline" onClick={onClose} className="touch-manipulation">
                  Cancel
                </AppButton>
                <AppButton
                  onClick={handleProceedToExtraction}
                  disabled={isProcessing}
                  className="touch-manipulation"
                >
                  {detectedSegments.filter(s => s.enabled).length === 0
                    ? 'Skip Extraction & Save'
                    : `Extract ${detectedSegments.filter(s => s.enabled).length} Segment${detectedSegments.filter(s => s.enabled).length !== 1 ? 's' : ''}`
                  }
                </AppButton>
              </div>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && uploadStep === 'select' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <h3 className="text-sm font-bold text-foreground">
                  Uploaded Files ({uploadedFiles.filter((f) => f.selected).length} selected)
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <AppButton
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1 sm:flex-none touch-manipulation"
                  >
                    Clear All
                  </AppButton>
                  <AppButton
                    size="sm"
                    onClick={() => (uploadMethod === "zip" ? fileInputZipRef.current?.click() : fileInputFilesRef.current?.click())}
                    className="flex-1 sm:flex-none touch-manipulation"
                  >
                    Add More Files
                  </AppButton>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 transition-all touch-manipulation ${file.selected
                        ? "border-data-accent-blue bg-data-accent-blue/5"
                        : "border-border bg-card hover:border-muted-foreground"
                      }`}
                  >
                    <button
                      onClick={() => toggleFileSelection(file.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all touch-manipulation ${file.selected
                          ? "bg-data-accent-blue border-data-accent-blue"
                          : "bg-card border-border hover:border-muted-foreground"
                        }`}
                    >
                      {file.selected && <Check className="w-3 h-3 text-primary-foreground" />}
                    </button>

                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      {file.name.endsWith(".zip") ? (
                        <FileArchive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      ) : (
                        <File className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-foreground truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        {file.fromZip && (
                          <>
                            <span>•</span>
                            <span className="truncate">From: {file.zipParent}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFile(file.id)}
                      className="w-7 h-7 sm:w-6 sm:h-6 rounded-full hover:bg-muted flex items-center justify-center flex-shrink-0 transition-colors touch-manipulation"
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2 p-3 bg-data-accent-blue/5 rounded-lg border border-data-accent-blue/20">
                <AlertCircle className="w-4 h-4 text-data-accent-blue flex-shrink-0 mt-0.5" />
                <div className="text-xs text-foreground">
                  <p className="font-medium mb-1">Next Steps:</p>
                  <p className="text-muted-foreground">
                    After proceeding, files will be uploaded to secure storage, classified by AI, and data will be extracted for your review.
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t">
                <AppButton variant="outline" onClick={onClose} className="touch-manipulation">
                  Cancel
                </AppButton>
                <AppButton
                  onClick={handleProceed}
                  disabled={uploadedFiles.filter((f) => f.selected).length === 0 || isProcessing}
                  className="touch-manipulation"
                >
                  {isProcessing ? "Processing..." : "Upload & Analyze"}
                </AppButton>
              </div>
            </div>
          )}

          {/* Classification Results */}
          {uploadStep === 'complete' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Check className="w-5 h-5 text-green-500" />
                <h3 className="text-sm font-bold text-foreground">Property Created Successfully</h3>
              </div>

              <div className="space-y-2">
                {uploadedFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                  >
                    <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                      <File className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        {file.classificationType && (
                          <>
                            <span>•</span>
                            <Badge variant="secondary" className="text-xs">
                              {file.classificationType.replace('_', ' ')}
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    {file.classificationStatus === 'completed' && (
                      <Check className="w-4 h-4 text-green-500" />
                    )}
                    {file.classificationStatus === 'failed' && (
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <AppButton variant="outline" onClick={onClose} className="touch-manipulation">
                  Close
                </AppButton>
                <AppButton onClick={() => {
                  // Navigate to property page
                  if (propertyId) {
                    window.location.href = `/properties/${propertyId}`
                  }
                }} className="touch-manipulation">
                  View Property
                </AppButton>
              </div>
            </div>
          )}
        </div>

        {uploadSuccess && processId && uploadStep !== 'complete' && (
          <div className="flex items-start gap-2 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-green-500">
              <p className="font-medium">Upload successful!</p>
              <p className="text-green-600 mt-1">Process ID: {processId}</p>
            </div>
          </div>
        )}

        {isPolling && (
          <div className="flex items-start gap-2 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
            <div className="text-xs text-blue-600">
              <p className="font-medium">Processing extraction...</p>
              <p className="mt-1">Current status: <span className="font-mono">{status?.status || 'pending'}</span></p>
            </div>
          </div>
        )}

        {pollingError && (
          <div className="flex items-start gap-2 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-600">
              <p className="font-medium">Extraction Error</p>
              <p className="mt-1">{pollingError.message}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
