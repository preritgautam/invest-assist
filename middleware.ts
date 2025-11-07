// import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// // Define public routes that don't require authentication
// const isPublicRoute = createRouteMatcher([
//   '/',  
//   '/sign-in(.*)', 
//   '/sign-up(.*)',
//   '/forgot-password(.*)',
//   '/api/webhooks/clerk(.*)',
// ])

// export default clerkMiddleware(async (auth, request) => {
//   // Protect all routes except public ones
//   if (!isPublicRoute(request)) {
//     await auth.protect()
//   }
// })

// export const config = {
//   matcher: [
//     '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
//     '/(api|trpc)(.*)',
//   ],
// }

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)', 
  '/sign-up(.*)',
  '/forgot-password(.*)',
  '/api/webhooks/clerk(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()
  
  // If user is at root and not authenticated, redirect to sign-in
  if (request.nextUrl.pathname === '/' && !userId) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }
  
  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
