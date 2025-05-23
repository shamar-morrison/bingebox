import { createClient } from "./supabase/client"

export async function signOut() {
  const supabase = createClient()

  // Clear remember me preferences
  if (typeof window !== "undefined") {
    localStorage.removeItem("supabase-remember-me")
    document.cookie =
      "supabase-remember-me=; max-age=0; path=/; secure; samesite=lax"
  }

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Error signing out:", error.message)
    return { error }
  }

  return { error: null }
}

export function getRememberMePreference(): boolean {
  if (typeof window === "undefined") return true

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

export function setRememberMePreference(remember: boolean) {
  if (typeof window === "undefined") return

  localStorage.setItem("supabase-remember-me", remember.toString())

  if (remember) {
    const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
    document.cookie = `supabase-remember-me=true; max-age=${maxAge}; path=/; secure; samesite=lax`
  } else {
    document.cookie = "supabase-remember-me=false; path=/; secure; samesite=lax"
  }
}
