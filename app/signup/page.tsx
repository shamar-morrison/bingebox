import { SignUpForm } from "@/components/auth/SignUpForm"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background text-foreground">
      <SignUpForm />
    </div>
  )
}
