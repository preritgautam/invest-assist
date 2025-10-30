import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

/**
 * Application Metadata Configuration
 *
 * Defines the default metadata for the application including title,
 * description, and generator information for SEO purposes.
 */
export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.app",
}

/**
 * Root Layout Component
 *
 * The main layout component that wraps all pages in the application.
 * Sets up the HTML structure with proper font loading, analytics tracking,
 * and global UI components.
 *
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render
 * @returns {JSX.Element} The complete HTML document structure
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        {/* Suspense wrapper for better loading experience */}
        <Suspense fallback={null}>
          {children}
          {/* Global toast notification system */}
          <Toaster />
        </Suspense>
      </body>
    </html>
  )
}
