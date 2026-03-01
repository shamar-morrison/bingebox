const AUTH_ENTRY_PATHS = ["/", "/login"] as const
const AUTH_EXEMPT_PATHS = ["/auth/callback", "/auth/error"] as const
const AUTH_EXEMPT_PREFIXES = ["/api", "/_next"] as const

export const isAuthEntryPath = (pathname: string): boolean => {
  return AUTH_ENTRY_PATHS.includes(pathname as (typeof AUTH_ENTRY_PATHS)[number])
}

export const isAuthExemptPath = (pathname: string): boolean => {
  if (AUTH_EXEMPT_PATHS.includes(pathname as (typeof AUTH_EXEMPT_PATHS)[number])) {
    return true
  }

  return AUTH_EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export const requiresAuthGate = (pathname: string): boolean => {
  return !isAuthEntryPath(pathname) && !isAuthExemptPath(pathname)
}

// Only allow internal relative redirects that resolve to gated content pages.
export const getSafeRedirectPath = (
  redirectValue: string | null | undefined,
): string | null => {
  if (!redirectValue) return null
  if (!redirectValue.startsWith("/")) return null
  if (redirectValue.startsWith("//")) return null

  try {
    const parsed = new URL(redirectValue, "https://bingebox.local")
    if (parsed.origin !== "https://bingebox.local") return null

    const normalizedPath = parsed.pathname
    if (isAuthEntryPath(normalizedPath) || isAuthExemptPath(normalizedPath)) {
      return null
    }

    return `${normalizedPath}${parsed.search}`
  } catch {
    return null
  }
}
