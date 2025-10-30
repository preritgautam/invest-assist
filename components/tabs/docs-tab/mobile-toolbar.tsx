"use client"
import { X, Eye, Download, Undo, Redo, Search, ZoomIn, ZoomOut, Maximize, AlertCircle } from "lucide-react"

interface MobileToolbarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileToolbar({ isOpen, onClose }: MobileToolbarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={onClose}>
      <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Tools</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-80px)]">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Eye className="w-5 h-5" />
            <span className="font-medium">View Options</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
            <Download className="w-5 h-5" />
            <span className="font-medium">Save Document</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Undo className="w-5 h-5" />
            <span className="font-medium">Undo</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Redo className="w-5 h-5" />
            <span className="font-medium">Redo</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <Search className="w-5 h-5" />
            <span className="font-medium">Find</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <ZoomIn className="w-5 h-5" />
            <span className="font-medium">Zoom In</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <ZoomOut className="w-5 h-5" />
            <span className="font-medium">Zoom Out</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Maximize className="w-5 h-5" />
            <span className="font-medium">Fullscreen</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Issues (4)</span>
          </button>
        </div>
      </div>
    </div>
  )
}
