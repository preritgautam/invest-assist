// lib/route-utils.ts
export function tabToRoute(tabId: string, propertyId?: string) {
  if (tabId === "home") return "/"
  if (!propertyId) return "/" // fallback, or might throw/alert upstream

  // map the UI tab ids to the route slug you use in file system
  const slug = tabId === "documents" ? "docs" : tabId
  return `/property/${encodeURIComponent(propertyId)}/${slug}`
}

/**
 * Derives tabId from the third segment of a property path.
 * e.g. /property/:id/summary -> "summary"
 * returns 'documents' if path ends at /property/:id or the route segment is absent.
 */
export function routeToTab(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean)
  if (parts.length >= 3 && parts[0] === "property") return parts[2]
  if (parts.length === 2 && parts[0] === "property") return "documents"
  if (pathname === "/") return "home"
  return parts[0] ?? "home"
}
