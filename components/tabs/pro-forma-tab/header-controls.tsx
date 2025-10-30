"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DollarSign, Users, Calculator, Download } from "lucide-react"
import type { InputMode } from "./types"

interface HeaderControlsProps {
  globalInputMode: InputMode
  setGlobalInputMode: (mode: InputMode) => void
  showProjections: boolean
  setShowProjections: (show: boolean) => void
}

export function HeaderControls({
  globalInputMode,
  setGlobalInputMode,
  showProjections,
  setShowProjections,
}: HeaderControlsProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={globalInputMode === "total" ? "default" : "outline"}
              onClick={() => setGlobalInputMode("total")}
              className="text-xs"
            >
              <DollarSign className="h-3 w-3 mr-1" />
              Total
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View values as totals</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={globalInputMode === "perUnit" ? "default" : "outline"}
              onClick={() => setGlobalInputMode("perUnit")}
              className="text-xs"
            >
              <Users className="h-3 w-3 mr-1" />
              Per Unit
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>View values per unit</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowProjections(!showProjections)}
              className="text-xs"
            >
              <Calculator className="h-3 w-3 mr-1" />
              {showProjections ? "Hide" : "Show"} Projections
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle multi-year projections</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline" className="text-xs bg-transparent">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Export to Excel</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
