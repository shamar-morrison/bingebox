"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import authClient from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setAuthState } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(
    searchParams.get("message"),
  )
  const [isLoading, setIsLoading] = useState(false)

  // Get the redirect path from query parameters
  const redirectPath = searchParams.get("redirect")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setIsLoading(true)

    try {
      const signInResult = await authClient.signIn.email({
        email,
        password,
      })

      if (signInResult.error) {
        setError(
          signInResult.error.message ||
            "Login failed. Please check your credentials.",
        )
        setAuthState(null)
      } else if (signInResult.data?.user) {
        // Login was successful, now fetch the full session data to update context
        const sessionResponse = await authClient.getSession()
        if (sessionResponse && sessionResponse.data) {
          setAuthState({
            user: sessionResponse.data.user || null,
            session: sessionResponse.data.session || null,
          })
        } else {
          // Fallback if getSession fails, though unlikely after successful login
          setAuthState({ user: signInResult.data.user, session: null })
        }

        const targetPath = redirectPath || "/"
        router.push(targetPath)
        router.refresh()
      } else {
        setError("An unexpected error occurred during login.")
        setAuthState(null)
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
      setAuthState(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Log In</CardTitle>
        <CardDescription>
          Enter your email and password to access your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message && (
          <p className="mb-4 text-sm text-green-600 bg-green-100 p-3 rounded-md">
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging In..." : "Log In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm">
        <p>
          Don&apos;t have an account?{" "}
          <a href="/signup" className="underline">
            Sign up
          </a>
        </p>
      </CardFooter>
    </Card>
  )
}
