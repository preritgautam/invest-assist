/**
 * Metric Card Component
 *
 * Displays a single financial metric with icon, value, and description.
 */

import type React from "react"

interface MetricCardProps {
  title: string
  value: string
  description: string
  icon: React.ReactNode
  color?: "blue" | "emerald" | "amber" | "slate"
}

export function MetricCard({ title, value, description, icon, color = "slate" }: MetricCardProps) {
  const colorClasses = {
    blue: "border-l-blue-500 bg-blue-50",
    emerald: "border-l-emerald-500 bg-emerald-50",
    amber: "border-l-amber-500 bg-amber-50",
    slate: "border-l-slate-500 bg-slate-50",
  }

  const iconColorClasses = {
    blue: "text-blue-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    slate: "text-slate-600",
  }

  return (
    <div className={`rounded border border-slate-200 border-l-4 p-3 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-slate-700">{title}</h4>
        <div className={iconColorClasses[color]}>{icon}</div>
      </div>
      <div className="text-xl font-bold text-slate-900 mb-1">{value}</div>
      <div className="text-xs text-slate-600">{description}</div>
    </div>
  )
}
