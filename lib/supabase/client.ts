import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "./database.types"

export function createClient() {
  // Check if user has "remember me" preference
  const getRememberMePreference = (): boolean => {
    if (typeof window === "undefined") return true // Default to true on server

    // Check localStorage first
    const stored = localStorage.getItem("supabase-remember-me")
    if (stored !== null) {
      return stored === "true"
    }

    // Fallback to cookie
    const cookies = document.cookie.split(";")
    const rememberMeCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("supabase-remember-me="),
    )

    if (rememberMeCookie) {
      return rememberMeCookie.split("=")[1].trim() === "true"
    }

    return true // Default to remember
  }

  const shouldRemember = getRememberMePreference()

  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: shouldRemember,
        autoRefreshToken: shouldRemember,
        storage: shouldRemember
          ? undefined
          : {
              // Use sessionStorage for temporary sessions
              getItem: (key: string) => {
                if (typeof window === "undefined") return null
                return sessionStorage.getItem(key)
              },
              setItem: (key: string, value: string) => {
                if (typeof window === "undefined") return
                sessionStorage.setItem(key, value)
              },
              removeItem: (key: string) => {
                if (typeof window === "undefined") return
                sessionStorage.removeItem(key)
              },
            },
      },
    },
  )
}
