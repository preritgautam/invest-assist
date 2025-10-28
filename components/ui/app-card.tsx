"use client"

import type React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

interface AppCardProps {
  children: React.ReactNode
  className?: string
  padding?: "sm" | "md" | "lg"
  hover?: boolean
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void
}

export function AppCard({ children, className, padding = "md", hover = false, onClick }: AppCardProps) {
  const paddingStyles = {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  }

  return (
    <Card
      onClick={onClick}
      className={cn(
        "bg-white rounded-2xl shadow-lg border-2 border-white",
        hover && "hover:shadow-xl transition-all duration-200",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <CardContent className={paddingStyles[padding]}>{children}</CardContent>
    </Card>
  )
}

interface AppCardHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function AppCardHeader({ title, subtitle, icon, action, className }: AppCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        {icon && <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">{icon}</div>}
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-600">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  className?: string
}

export function MetricCard({ icon, label, value, className }: MetricCardProps) {
  return (
    <div className={cn("bg-gray-50 rounded-lg p-3 sm:p-4", className)}>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-gray-100 rounded-lg flex-shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-600 leading-tight break-words">{label}</p>
          <p className="text-sm sm:text-lg font-bold text-gray-900 leading-tight break-words">{value}</p>
        </div>
      </div>
    </div>
  )
}
