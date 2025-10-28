import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import { Suspense } from "react"
import "./globals.css"

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
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {/* Suspense wrapper for better loading experience */}
        <Suspense fallback={null}>
          {children}
          {/* Vercel Analytics for performance and usage tracking */}
          <Analytics />
          {/* Global toast notification system */}
          <Toaster />
        </Suspense>
      </body>
    </html>
  )
}
