import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import {
  getSafeRedirectPath,
  requiresAuthGate,
} from "./lib/auth-config"

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
  const { pathname, search } = request.nextUrl

  // Handle session cleanup for non-remember sessions
  if (!shouldRemember && user) {
    // For non-remember sessions, we rely on browser session cookies
    // which will be cleared when the browser closes
  }

  // Send signed-out users trying to access app content back to auth entry (/).
  if (!user && requiresAuthGate(pathname)) {
    const url = request.nextUrl.clone()
    const destination = `${pathname}${search}`
    url.pathname = "/"
    url.search = ""
    url.searchParams.set("redirect", destination)
    return NextResponse.redirect(url)
  }

  // Preserve compatibility with legacy /login routes once signed in.
  if (user && pathname === "/login") {
    const redirectTarget = getSafeRedirectPath(
      request.nextUrl.searchParams.get("redirect"),
    )
    const url = request.nextUrl.clone()
    url.pathname = redirectTarget || "/"
    url.search = ""

    if (redirectTarget) {
      const parsed = new URL(redirectTarget, request.url)
      url.pathname = parsed.pathname
      url.search = parsed.search
    }

    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
