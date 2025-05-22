"use client"

// Original signup form - commented out to disable signups temporarily
// import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Separator } from "@/components/ui/separator"
// import { createClient } from "@/lib/supabase/client"
// import { Loader2 } from "lucide-react"
import { UserX } from "lucide-react"
import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { useState } from "react"
// import { toast } from "sonner"

export default function SignupPage() {
  // Original signup state - commented out
  // const [email, setEmail] = useState("")
  // const [password, setPassword] = useState("")
  // const [confirmPassword, setConfirmPassword] = useState("")
  // const [isLoading, setIsLoading] = useState(false)
  // const router = useRouter()
  // const supabase = createClient()

  // Original signup handler - commented out
  // const handleSignUp = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   if (!email || !password || !confirmPassword) {
  //     toast.error("Please fill in all fields")
  //     return
  //   }

  //   if (password !== confirmPassword) {
  //     toast.error("Passwords don't match")
  //     return
  //   }

  //   if (password.length < 6) {
  //     toast.error("Password must be at least 6 characters")
  //     return
  //   }

  //   setIsLoading(true)

  //   try {
  //     const { error } = await supabase.auth.signUp({
  //       email,
  //       password,
  //       options: {
  //         emailRedirectTo: `${window.location.origin}/auth/callback`,
  //       },
  //     })

  //     if (error) {
  //       toast.error(error.message)
  //     } else {
  //       toast.success("Check your email to confirm your account!")
  //       router.push("/signup/confirm-email")
  //     }
  //   } catch (error) {
  //     toast.error("An unexpected error occurred")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          {/* Temporary disabled signup message */}
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <UserX className="w-6 h-6 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              Account Creation Disabled
            </CardTitle>
            <CardDescription>
              We are currently not accepting new users. Please come back later.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent>

          {/* Original signup form - commented out */}
          {/* <CardHeader className="text-center">
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <CardDescription>
              Join BingeBox to create and manage your watchlists
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Sign up"
                )}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardContent> */}
        </Card>
      </div>
    </div>
  )
}
