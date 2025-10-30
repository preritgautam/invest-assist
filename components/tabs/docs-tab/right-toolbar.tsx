"use client"

import { Eye, Download, Undo, Redo, Search, ZoomIn, ZoomOut, Maximize, AlertCircle } from "lucide-react"

interface RightToolbarProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFullscreen?: () => void
  onSave?: () => void
  onUndo?: () => void
  onRedo?: () => void
  onFind?: () => void
  onView?: () => void
  onIssues?: () => void
}

export function RightToolbar({
  onZoomIn,
  onZoomOut,
  onFullscreen,
  onSave,
  onUndo,
  onRedo,
  onFind,
  onView,
  onIssues,
}: RightToolbarProps = {}) {
  const handleView = () => {
    console.log("[v0] View clicked")
    onView?.()
  }

  const handleSave = () => {
    console.log("[v0] Save clicked")
    // Trigger browser download
    const dataStr = JSON.stringify({ saved: true, timestamp: new Date().toISOString() })
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `document_${Date.now()}.json`
    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
    onSave?.()
  }

  const handleUndo = () => {
    console.log("[v0] Undo clicked")
    // Trigger browser undo if available
    document.execCommand("undo")
    onUndo?.()
  }

  const handleRedo = () => {
    console.log("[v0] Redo clicked")
    // Trigger browser redo if available
    document.execCommand("redo")
    onRedo?.()
  }

  const handleFind = () => {
    console.log("[v0] Find clicked")
    // Trigger browser find dialog
    if (typeof window !== "undefined") {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const findKey = isMac ? "Meta+F" : "Ctrl+F"
      // Simulate keyboard shortcut
      const event = new KeyboardEvent("keydown", {
        key: "f",
        code: "KeyF",
        ctrlKey: !isMac,
        metaKey: isMac,
        bubbles: true,
      })
      document.dispatchEvent(event)
    }
    onFind?.()
  }

  const handleZoomIn = () => {
    console.log("[v0] Zoom In clicked")
    // Increase document zoom
    if (typeof document !== "undefined") {
      const currentZoom = Number.parseFloat(document.body.style.zoom || "1")
      document.body.style.zoom = String(Math.min(currentZoom + 0.1, 2))
    }
    onZoomIn?.()
  }

  const handleZoomOut = () => {
    console.log("[v0] Zoom Out clicked")
    // Decrease document zoom
    if (typeof document !== "undefined") {
      const currentZoom = Number.parseFloat(document.body.style.zoom || "1")
      document.body.style.zoom = String(Math.max(currentZoom - 0.1, 0.5))
    }
    onZoomOut?.()
  }

  const handleFullscreen = () => {
    console.log("[v0] Fullscreen clicked")
    // Toggle fullscreen mode
    if (typeof document !== "undefined") {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      } else {
        document.exitFullscreen()
      }
    }
    onFullscreen?.()
  }

  const handleIssues = () => {
    console.log("[v0] Issues clicked")
    // Show issues panel (placeholder - would open a modal or sidebar)
    alert(
      "Issues Panel\n\n4 issues found:\n- Missing data in row 5\n- Validation error in column C\n- Duplicate entry detected\n- Format inconsistency",
    )
    onIssues?.()
  }

  return (
    <div className="w-16 bg-gradient-to-b from-slate-50 to-white border-l border-slate-200 flex flex-col py-2 shadow-sm">
      {/* View Button */}
      <button
        onClick={handleView}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-1"
        title="View Options"
      >
        <Eye className="w-5 h-5 text-slate-700 hover:text-blue-600 transition-colors" />
        <span className="text-[10px] font-medium text-slate-700">View</span>
      </button>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-emerald-50 hover:text-emerald-600 transition-all duration-200 rounded-lg mx-1"
        title="Save Document"
      >
        <Download className="w-5 h-5 text-slate-700 hover:text-emerald-600 transition-colors" />
        <span className="text-[10px] font-medium text-slate-700">Save</span>
      </button>

      {/* Undo Button */}
      <button
        onClick={handleUndo}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-slate-100 transition-all duration-200 rounded-lg mx-1"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-medium text-slate-700">Undo</span>
      </button>

      {/* Redo Button */}
      <button
        onClick={handleRedo}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-slate-100 transition-all duration-200 rounded-lg mx-1"
        title="Redo (Ctrl+Y)"
      >
        <Redo className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-medium text-slate-700">Redo</span>
      </button>

      {/* Find Button */}
      <button
        onClick={handleFind}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-lg mx-1"
        title="Find (Ctrl+F)"
      >
        <Search className="w-5 h-5 text-slate-700 hover:text-blue-600 transition-colors" />
        <span className="text-[10px] font-medium text-slate-700">Find</span>
      </button>

      {/* Zoom+ Button */}
      <button
        onClick={handleZoomIn}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-slate-100 transition-all duration-200 rounded-lg mx-1"
        title="Zoom In"
      >
        <ZoomIn className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-medium text-slate-700">Zoom+</span>
      </button>

      {/* Zoom- Button */}
      <button
        onClick={handleZoomOut}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-slate-100 transition-all duration-200 rounded-lg mx-1"
        title="Zoom Out"
      >
        <ZoomOut className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-medium text-slate-700">Zoom-</span>
      </button>

      {/* Full Button */}
      <button
        onClick={handleFullscreen}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-slate-100 transition-all duration-200 rounded-lg mx-1"
        title="Toggle Fullscreen (F11)"
      >
        <Maximize className="w-5 h-5 text-slate-700" />
        <span className="text-[10px] font-medium text-slate-700">Full</span>
      </button>

      {/* Issues Button */}
      <button
        onClick={handleIssues}
        className="flex flex-col items-center gap-1 py-3 px-2 hover:bg-amber-50 transition-all duration-200 rounded-lg mx-1 mt-auto"
        title="View Issues (4)"
      >
        <div className="relative">
          <AlertCircle className="w-5 h-5 text-amber-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg">
            4
          </span>
        </div>
        <span className="text-[10px] font-medium text-amber-600">Issues</span>
      </button>
    </div>
  )
}
