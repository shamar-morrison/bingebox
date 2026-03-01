import { getSafeRedirectPath } from "@/lib/auth-config"
import { redirect } from "next/navigation"

type LoginPageProps = {
  searchParams?: {
    redirect?: string | string[]
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectParam = Array.isArray(searchParams?.redirect)
    ? searchParams?.redirect[0]
    : searchParams?.redirect
  const redirectTarget = getSafeRedirectPath(redirectParam)

  if (redirectTarget) {
    redirect(`/?redirect=${encodeURIComponent(redirectTarget)}`)
  }

  redirect("/")
}
