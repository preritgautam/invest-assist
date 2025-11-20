import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isV0Preview = (request: Request) => {
  const url = new URL(request.url)
  return (
    url.hostname.includes("vusercontent.net") || url.hostname.includes("vercel.run") || url.hostname.includes("v0.dev")
  )
}

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/forgot-password(.*)",
  "/api/webhooks/clerk(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  if (isV0Preview(request)) {
    return NextResponse.next()
  }

  const { userId } = await auth()

  // If user is at root and not authenticated, redirect to sign-in
  if (request.nextUrl.pathname === "/" && !userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  // Protect all routes except public ones
  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
