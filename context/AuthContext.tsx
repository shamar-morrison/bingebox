"use client"

import type { AuthSessionData, AuthUserData } from "@/lib/auth" // Using the inferred types
import authClient from "@/lib/auth-client" // Assuming authClient is your primary way to interact with better-auth
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"

interface SessionState {
  user: AuthUserData | null
  session: AuthSessionData | null
}

interface AuthContextType {
  authState: SessionState
  setAuthState: (sessionData: SessionState | null) => void
  isLoading: boolean
  // We can add specific login/logout handlers here later if needed,
  // or components can call authClient directly and then update context.
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<SessionState>({
    user: null,
    session: null,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInitialSession = async () => {
      setIsLoading(true)
      try {
        const response = await authClient.getSession()
        if (response && response.data) {
          setAuthState({
            user: response.data.user || null,
            session: response.data.session || null,
          })
        } else {
          setAuthState({ user: null, session: null })
        }
      } catch (error) {
        console.error("Failed to fetch initial session:", error)
        setAuthState({ user: null, session: null })
      } finally {
        setIsLoading(false)
      }
    }
    fetchInitialSession()
  }, [])

  // Function to update auth state, can be called after login/logout
  const handleSetAuthState = (sessionData: SessionState | null) => {
    if (sessionData) {
      setAuthState(sessionData)
    } else {
      setAuthState({ user: null, session: null })
    }
  }

  return (
    <AuthContext.Provider
      value={{ authState, setAuthState: handleSetAuthState, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Define the Session type for components if they need the raw structure from getSession
// This should match the structure observed in your console logs: { data: { session: ..., user: ... } }
export interface ClientSessionResponse {
  user?: AuthUserData | null
  session?: AuthSessionData | null
}
