"use client"

import { useState, useEffect, useMemo } from "react"
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Loader2, ExternalLink } from "lucide-react"
import { AppButton } from "@/components/ui/app-button"

interface PDFViewerProps {
  file: File | null
  currentPage?: number
  onPageChange?: (page: number) => void
  highlightedPages?: number[] // Pages to highlight (e.g., selected segment pages)
  className?: string
}

export function PDFViewer({
  file,
  highlightedPages = [],
  className = "",
}: PDFViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  // Create object URL for the file
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file)
      setObjectUrl(url)
      setIsLoading(false)

      // Cleanup on unmount or file change
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setObjectUrl(null)
      setIsLoading(false)
    }
  }, [file])

  // Get the first highlighted page to navigate to
  const initialPage = useMemo(() => {
    if (highlightedPages.length > 0) {
      return Math.min(...highlightedPages)
    }
    return 1
  }, [highlightedPages])

  // Build the PDF URL with page navigation parameter
  const pdfUrl = useMemo(() => {
    if (!objectUrl) return null
    // Use #page=X to navigate to specific page, toolbar=1 for controls
    return `${objectUrl}#page=${initialPage}&toolbar=1&navpanes=0&scrollbar=1`
  }, [objectUrl, initialPage])

  // Format highlighted pages for display
  const highlightedPagesText = useMemo(() => {
    if (highlightedPages.length === 0) return null
    if (highlightedPages.length <= 10) {
      return highlightedPages.join(', ')
    }
    return `${highlightedPages.slice(0, 10).join(', ')}... (${highlightedPages.length} pages)`
  }, [highlightedPages])

  if (!file) {
    return (
      <div className={`flex items-center justify-center h-full bg-muted/30 rounded-lg ${className}`}>
        <p className="text-sm text-muted-foreground">Select a file to preview</p>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full bg-muted/30 rounded-lg overflow-hidden ${className}`}>
      {/* Info bar */}
      {highlightedPagesText && (
        <div className="px-3 py-2 bg-data-accent-blue/10 border-b border-data-accent-blue/20">
          <span className="text-xs text-data-accent-blue font-medium">
            Selected pages: {highlightedPagesText}
          </span>
        </div>
      )}

      {/* PDF Content using native browser viewer */}
      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Loading PDF...</span>
            </div>
          </div>
        )}

        {pdfUrl && (
          <iframe
            key={`pdf-${initialPage}`}
            src={pdfUrl}
            className="w-full h-full border-0"
            title="PDF Preview"
            onLoad={() => setIsLoading(false)}
          />
        )}
      </div>

      {/* Open in new tab button */}
      {pdfUrl && (
        <div className="flex items-center justify-between px-3 py-2 bg-card border-t border-border">
          <span className="text-xs text-muted-foreground">
            Use browser controls to navigate pages
          </span>
          <AppButton
            size="sm"
            variant="ghost"
            onClick={() => window.open(pdfUrl, '_blank')}
            className="h-7 text-xs gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Open in new tab
          </AppButton>
        </div>
      )}
    </div>
  )
}
