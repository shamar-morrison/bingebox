import { useEffect, useState } from "react"

const REMEMBER_ME_KEY = "supabase-remember-me"
const REMEMBER_ME_COOKIE = "supabase-remember-me"

export function useRememberMe() {
  const [rememberMe, setRememberMeState] = useState<boolean>(true)

  useEffect(() => {
    const getInitialPreference = (): boolean => {
      // Check localStorage first
      const stored = localStorage.getItem(REMEMBER_ME_KEY)
      if (stored !== null) {
        return stored === "true"
      }

      // Fallback to cookie
      const cookies = document.cookie.split(";")
      const rememberMeCookie = cookies.find((cookie) =>
        cookie.trim().startsWith(`${REMEMBER_ME_COOKIE}=`),
      )

      if (rememberMeCookie) {
        return rememberMeCookie.split("=")[1].trim() === "true"
      }

      return true // Default to remember
    }

    setRememberMeState(getInitialPreference())
  }, [])

  const setRememberMe = (value: boolean) => {
    setRememberMeState(value)

    // Store in localStorage
    localStorage.setItem(REMEMBER_ME_KEY, value.toString())

    // Store in cookie
    if (value) {
      // Set long-term cookie (30 days)
      const maxAge = 30 * 24 * 60 * 60 // 30 days in seconds
      document.cookie = `${REMEMBER_ME_COOKIE}=true; max-age=${maxAge}; path=/; secure; samesite=lax`
    } else {
      // Remove cookie by setting max-age to 0
      document.cookie = `${REMEMBER_ME_COOKIE}=; max-age=0; path=/; secure; samesite=lax`
    }
  }

  const clearRememberMe = () => {
    localStorage.removeItem(REMEMBER_ME_KEY)
    document.cookie = `${REMEMBER_ME_COOKIE}=; max-age=0; path=/; secure; samesite=lax`
    setRememberMeState(true) // Reset to default
  }

  return {
    rememberMe,
    setRememberMe,
    clearRememberMe,
  }
}
