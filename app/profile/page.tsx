"use client"

import { ProfileSidebar } from "@/components/profile/ProfileSidebar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { Terminal } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useState } from "react"

interface WatchlistItem {
  media_id: number
  media_type: "movie" | "tv"
  status: "watching" | "should-watch" | "dropped"
  title?: string | null
  poster_path?: string | null
  release_date?: string | null // YYYY-MM-DD or null
  created_at: string
  updated_at: string
}

function WatchlistContent() {
  const searchParams = useSearchParams()
  const listType = searchParams.get("list") || "watching"
  const [items, setItems] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchItems = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/watchlist?list=${listType}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch watchlist items")
        }
        const data: WatchlistItem[] = await response.json()
        setItems(data)
      } catch (err: any) {
        console.error("Error fetching watchlist:", err)
        setError(err.message || "An unexpected error occurred.")
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchItems()
  }, [listType])

  let contentTitle = ""
  switch (listType) {
    case "watching":
      contentTitle = "Currently Watching"
      break
    case "should-watch":
      contentTitle = "Should Watch"
      break
    case "dropped":
      contentTitle = "Dropped"
      break
    default:
      contentTitle = "Your Watchlist"
  }

  if (isLoading) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">{contentTitle}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[2/3] bg-muted rounded-md animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">{contentTitle}</h2>
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error Fetching List</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div>
        <h2 className="text-2xl font-semibold mb-6">{contentTitle}</h2>
        <p className="text-muted-foreground">
          Your {listType.replace("-", " ")} list is empty.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{contentTitle}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((item) => {
          const posterUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : "/placeholder.svg"

          const watchPath =
            item.media_type === "movie"
              ? `/watch/movie/${item.media_id}`
              : `/watch/tv/${item.media_id}/season/1/episode/1`

          return (
            <div key={`${item.media_type}-${item.media_id}`} className="group">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
                <Image
                  src={posterUrl}
                  alt={item.title || "Media poster"}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <Button asChild size="sm" className="w-full">
                    <Link href={watchPath}>Watch Now</Link>
                  </Button>
                </div>
              </div>
              <h3 className="text-sm font-medium truncate group-hover:text-primary">
                {item.title || "Untitled"}
              </h3>
              {item.release_date && (
                <p className="text-xs text-muted-foreground">
                  {new Date(item.release_date).getFullYear()}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { authState, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !authState.user) {
      router.push("/login?message=Please log in to view your profile.")
    }
  }, [authState.user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
        <p>Loading profile...</p>
      </div>
    )
  }

  if (!authState.user) {
    // This is a fallback, useEffect should handle redirect
    return null
  }

  return (
    <div className="container mx-auto pt-24 py-8 px-4 md:px-6 min-h-[calc(100vh-var(--header-height)-var(--footer-height))]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your watchlists, {authState.user.name || authState.user.email}.
        </p>
      </div>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/4">
          <Suspense
            fallback={
              <div className="p-4">
                <div className="h-8 w-3/4 bg-muted rounded animate-pulse mb-4"></div>
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-6 bg-muted rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            }
          >
            <ProfileSidebar />
          </Suspense>
        </aside>
        <div className="flex-1">
          <Suspense
            fallback={
              <div className="p-4">
                <div className="h-8 w-1/2 bg-muted rounded animate-pulse mb-6"></div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[2/3] bg-muted rounded-md animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            }
          >
            <WatchlistContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
