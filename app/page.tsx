// "use client"

// import { InvestmentApp } from "@/components/real-estate-analyzer"
// import { useAuth } from "@clerk/nextjs"
// import { useRouter } from "next/navigation"
// import { useEffect, useRef } from "react"

// export default function Home() {
//   const { isLoaded, userId } = useAuth()
//   const router = useRouter()
//   const hasRedirected = useRef(false)

//   useEffect(() => {
//     // Only redirect once and only if not authenticated
//     if (isLoaded && !userId && !hasRedirected.current) {
//       hasRedirected.current = true
//       router.push('/sign-in')
//     }
//   }, [isLoaded, userId, router])

//   // Show loading state while auth is loading OR while redirecting
//   if (!isLoaded || (!userId && isLoaded)) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     )
//   }

//   // User is authenticated, show the app
//   return <InvestmentApp />
// }

"use client"

import { InvestmentApp } from "@/components/real-estate-analyzer"

export default function Home() {
  // No auth checks, no redirects, no loaders
  // Middleware handles everything
  return <InvestmentApp />
}
