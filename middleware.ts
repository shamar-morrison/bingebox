import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { isProtectedRoute } from "./lib/auth-config"

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check remember me preference from cookies
  const rememberMeCookie = request.cookies.get("supabase-remember-me")
  const shouldRemember = rememberMeCookie?.value === "true"

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Adjust cookie options based on remember me preference
            const adjustedOptions = shouldRemember
              ? options
              : { ...options, maxAge: undefined, expires: undefined }

            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            const adjustedOptions = shouldRemember
              ? options
              : { ...options, maxAge: undefined, expires: undefined }

            supabaseResponse.cookies.set(name, value, adjustedOptions)
          })
        },
      },
    },
  )

  // Refresh the user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Handle session cleanup for non-remember sessions
  if (!shouldRemember && user) {
    // For non-remember sessions, we rely on browser session cookies
    // which will be cleared when the browser closes
  }

  // Protect routes that require authentication
  if (isProtectedRoute(request.nextUrl.pathname) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("redirect", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
