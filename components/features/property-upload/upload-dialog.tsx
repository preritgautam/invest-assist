"use client"

import type React from "react"
import { useState, useCallback, useRef } from "react"
import { Upload, FileArchive, File, Mail, Edit, X, Check, AlertCircle, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AppButton } from "@/components/ui/app-button"
import { AppCard } from "@/components/ui/app-card"
import { Badge } from "@/components/ui/badge"
import { extractZipFile, uploadFiles } from "@/lib/file-upload-utils"

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
}

interface UploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: (files: UploadedFile[]) => void
}

export function UploadDialog({ isOpen, onClose, onComplete }: UploadDialogProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<"files" | "email" | "manual" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setIsProcessing(true)
    setError(null)
    const newFiles: UploadedFile[] = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        // Check file size (100MB limit)
        if (file.size > 100 * 1024 * 1024) {
          setError(`File ${file.name} exceeds 100MB limit`)
          continue
        }

        // Check if it's a zip file
        if (file.name.endsWith(".zip") || file.type === "application/zip") {
          try {
            const extractedFiles = await extractZipFile(file)
            
            // Add extracted files to the list
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
  }, [])

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
      handleFiles(e.target.files)
    },
    [handleFiles],
  )

  const toggleFileSelection = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, selected: !f.selected } : f)))
  }, [])

  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId))
  }, [])

  const handleProceed = useCallback(async () => {
    const selectedFiles = uploadedFiles.filter((f) => f.selected)
    
    if (selectedFiles.length === 0) {
      setError("Please select at least one file")
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      // Upload files to server (local storage for now, S3 later)
      const uploadedFilesData = await uploadFiles(selectedFiles)
      
      // Update files with their local paths
      const filesWithPaths = selectedFiles.map((file, index) => ({
        ...file,
        localPath: uploadedFilesData[index]?.path,
      }))

      onComplete?.(filesWithPaths)
      onClose()
    } catch (err) {
      console.error("Error uploading files:", err)
      setError("Failed to upload files. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }, [uploadedFiles, onComplete, onClose])

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
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
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
          {uploadedFiles.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <AppCard
                hover
                className="cursor-pointer border-2 border-dashed border-border hover:border-muted-foreground transition-all touch-manipulation"
                onClick={() => {
                  setUploadMethod("files")
                  fileInputRef.current?.click()
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
                  setUploadMethod("files")
                  fileInputRef.current?.click()
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

          {/* File Upload Area */}
          {uploadMethod === "files" && uploadedFiles.length === 0 && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all ${
                isDragging
                  ? "border-data-accent-blue bg-data-accent-blue/5"
                  : "border-border hover:border-muted-foreground bg-muted/30"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-3 sm:mb-4">
                  <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-foreground mb-2">
                  {isDragging ? "Drop files here" : "Drag and drop files here"}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">or</p>
                <AppButton onClick={() => fileInputRef.current?.click()} className="touch-manipulation">
                  Browse Files
                </AppButton>
                <p className="text-xs text-muted-foreground mt-3 sm:mt-4">
                  Supports: ZIP, PDF, Excel, Word, Images (Max 100MB per file)
                </p>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".zip,.pdf,.xls,.xlsx,.doc,.docx,.jpg,.jpeg,.png,.gif"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center justify-center gap-3 p-6">
              <Loader2 className="w-5 h-5 animate-spin text-data-accent-blue" />
              <span className="text-sm text-muted-foreground">Processing files...</span>
            </div>
          )}

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
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
                    onClick={() => fileInputRef.current?.click()}
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
                    className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg border-2 transition-all touch-manipulation ${
                      file.selected
                        ? "border-data-accent-blue bg-data-accent-blue/5"
                        : "border-border bg-card hover:border-muted-foreground"
                    }`}
                  >
                    <button
                      onClick={() => toggleFileSelection(file.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all touch-manipulation ${
                        file.selected
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
                    After proceeding, the system will extract data from selected files and present it in a tabular
                    format for your review and editing.
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
                  {isProcessing ? "Uploading..." : "Proceed to Step B"}
                </AppButton>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}