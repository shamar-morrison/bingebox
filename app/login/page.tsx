import { LoginForm } from "@/components/auth/LoginForm"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
      <Suspense
        fallback={
          <div className="w-full max-w-md p-8 text-center">Loading form...</div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
