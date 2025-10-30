/**
 * Scenario Card Component
 *
 * Displays a comparison scenario with key metrics.
 */

import { cn } from "@/lib/utils"

interface ScenarioCardProps {
  title: string
  description: string
  metrics: {
    irr: string
    cocReturn: string
    equity: string
  }
  color?: "blue" | "emerald" | "amber" | "slate"
}

export function ScenarioCard({ title, description, metrics, color = "slate" }: ScenarioCardProps) {
  const borderColorClasses = {
    blue: "border-blue-300 hover:border-blue-400 hover:shadow-blue-100",
    emerald: "border-emerald-300 hover:border-emerald-400 hover:shadow-emerald-100",
    amber: "border-amber-300 hover:border-amber-400 hover:shadow-amber-100",
    slate: "border-slate-300 hover:border-slate-400 hover:shadow-slate-100",
  }

  const bgColorClasses = {
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
    slate: "bg-slate-50",
  }

  return (
    <div
      className={cn(
        `${bgColorClasses[color]} rounded border-2 p-3 transition-all hover:shadow-md ${borderColorClasses[color]}`,
      )}
    >
      <h3 className="text-sm font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-xs text-slate-600 mb-3">{description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-slate-700">IRR:</span>
          <span className="font-bold text-slate-900">{metrics.irr}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-700">CoC Return:</span>
          <span className="font-bold text-slate-900">{metrics.cocReturn}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-700">Equity Multiple:</span>
          <span className="font-bold text-slate-900">{metrics.equity}</span>
        </div>
      </div>
    </div>
  )
}
