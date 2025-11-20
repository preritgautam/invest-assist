import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import { headers } from "next/headers"

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const host = headersList.get("host") || ""
  const isPreview =
    host.includes("vusercontent.net") ||
    host.includes("vercel.run") ||
    host.includes("v0.dev") ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"

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
