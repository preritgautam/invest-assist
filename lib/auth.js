// lib/auth.js
import { getAuth } from "@clerk/nextjs/server";

/**
 * Require and return Clerk userId from App Router Request.
 * Throws an Error with .status if not authenticated.
 *
 * Usage in route handlers: const userId = requireUserId(request)
 */
export function requireUserId(request) {
  // getAuth accepts the Request object in App Router
  const { userId } = getAuth(request);
  if (!userId) {
    const err = new Error("Not authenticated");
    err.status = 401;
    throw err;
  }
  return userId;
}
