import type React from "react"
import { cn } from "@/lib/utils"

interface AppIconProps {
  children: React.ReactNode
  size?: "xs" | "sm" | "md" | "lg"
  className?: string
}

export function AppIcon({ children, size = "md", className }: AppIconProps) {
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }

  return <div className={cn(sizes[size], "text-gray-600", className)}>{children}</div>
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  size?: "xs" | "sm" | "md" | "lg"
  variant?: "default" | "ghost" | "outline"
  className?: string
}

export function IconButton({ icon, size = "md", variant = "default", className, ...props }: IconButtonProps) {
  const sizes = {
    xs: "p-1",
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  }

  const variants = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-600",
    ghost: "hover:bg-gray-100 text-gray-600",
    outline: "border border-gray-200 hover:bg-gray-50 text-gray-600",
  }

  return (
    <button
      className={cn(
        "rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1",
        sizes[size],
        variants[variant],
        className,
      )}
      {...props}
    >
      <AppIcon size={size}>{icon}</AppIcon>
    </button>
  )
}
