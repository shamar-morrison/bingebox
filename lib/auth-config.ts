// List of routes that require authentication
export const PROTECTED_ROUTES = ["/profile"]

// Helper function to check if a route is protected
export const isProtectedRoute = (pathname: string): boolean => {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
}
