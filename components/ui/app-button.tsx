"use client"

/**
 * App Button Component
 *
 * A customizable button component that extends the standard HTML button element
 * with consistent styling, multiple variants, and size options. Designed to maintain
 * visual consistency across the real estate analysis application.
 *
 * Features:
 * - Multiple visual variants (primary, secondary, ghost, outline)
 * - Three size options (small, medium, large)
 * - Consistent focus states and accessibility support
 * - Smooth transitions and hover effects
 * - Full TypeScript support with proper prop forwarding
 *
 * Design System:
 * - Uses gray-based color palette for neutral, professional appearance
 * - Consistent border radius and padding scales
 * - Focus ring for keyboard navigation accessibility
 * - Hover states for interactive feedback
 *
 * @module AppButton
 * @requires React
 * @requires @/lib/utils - Utility functions for className merging
 */

import type React from "react"
import { cn } from "@/lib/utils"

/**
 * Props interface for the AppButton component
 * Extends standard HTML button attributes with custom styling options
 *
 * @interface AppButtonProps
 * @extends React.ButtonHTMLAttributes<HTMLButtonElement>
 * @property {"primary" | "secondary" | "ghost" | "outline"} [variant="primary"] - Visual style variant
 * @property {"sm" | "md" | "lg"} [size="md"] - Button size
 * @property {React.ReactNode} children - Button content (text, icons, etc.)
 * @property {string} [className] - Additional CSS classes to apply
 */
interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
  className?: string
}

/**
 * AppButton Component
 *
 * A flexible button component with consistent styling and multiple variants.
 * Provides a unified interface for all button interactions in the application
 * while maintaining accessibility and visual consistency.
 *
 * @param {AppButtonProps} props - Component props
 * @returns {JSX.Element} Rendered button element
 *
 * @example
 * // Primary button (default)
 * <AppButton onClick={handleClick}>Save Changes</AppButton>
 *
 * @example
 * // Secondary button with small size
 * <AppButton variant="secondary" size="sm">Cancel</AppButton>
 *
 * @example
 * // Ghost button for subtle actions
 * <AppButton variant="ghost">Learn More</AppButton>
 *
 * @example
 * // Outline button with custom classes
 * <AppButton variant="outline" className="w-full">
 *   Submit Form
 * </AppButton>
 */
export function AppButton({ variant = "primary", size = "md", children, className, ...props }: AppButtonProps) {
  const baseStyles = "font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"

  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900 shadow-sm",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-500",
    outline: "border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
  }

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-4 py-2 text-sm rounded-lg",
    lg: "px-6 py-3 text-base rounded-xl",
  }

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  )
}
