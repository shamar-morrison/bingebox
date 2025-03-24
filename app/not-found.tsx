"use client"

import { ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mx-auto rounded-full bg-muted p-6 mb-8">
          <span className="text-6xl font-bold">404</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Page not found
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
          Sorry, we couldn&#39;t find the page you&#39;re looking for. It might
          have been removed, renamed, or didn&#39;t exist in the first place.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Button asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
