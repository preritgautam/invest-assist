import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"

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

export const metadata: Metadata = {
  title: "Invest Assist",
  description: "Created with v0",
  generator: "v0.app",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const isPreview =
    typeof window !== "undefined" &&
    (window.location.hostname.includes("vusercontent.net") ||
      window.location.hostname.includes("vercel.run") ||
      window.location.hostname.includes("v0.dev"))

  return (
    <html lang="en">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans`}>
        {isPreview ? (
          <>
            {children}
            <Toaster />
          </>
        ) : (
          <ClerkProvider>
            {children}
            <Toaster />
          </ClerkProvider>
        )}
      </body>
    </html>
  )
}
