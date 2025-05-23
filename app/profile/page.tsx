"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signOut } from "@/lib/auth-utils"
import { useRememberMe } from "@/lib/hooks/use-remember-me"
import { useUser } from "@/lib/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { Film, LogOut, Play, Settings, User, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type WatchlistItem = {
  id: string
  media_id: number
  media_type: string
  status: "watching" | "should_watch" | "dropped"
  title: string
  poster_path: string | null
  added_at: string
}

export default function ProfilePage() {
  const { user, loading } = useUser()
  const { rememberMe, setRememberMe } = useRememberMe()
  const [watchlists, setWatchlists] = useState<{
    watching: WatchlistItem[]
    should_watch: WatchlistItem[]
    dropped: WatchlistItem[]
  }>({
    watching: [],
    should_watch: [],
    dropped: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      fetchWatchlists()
    }
  }, [user])

  const fetchWatchlists = async () => {
    try {
      const { data, error } = await supabase
        .from("watchlists")
        .select("*")
        .order("added_at", { ascending: false })

      if (error) throw error

      const grouped = data?.reduce(
        (acc, item) => {
          acc[item.status].push(item)
          return acc
        },
        {
          watching: [] as WatchlistItem[],
          should_watch: [] as WatchlistItem[],
          dropped: [] as WatchlistItem[],
        },
      ) || { watching: [], should_watch: [], dropped: [] }

      setWatchlists(grouped)
    } catch (error) {
      console.error("Error fetching watchlists:", error)
      toast.error("Failed to load watchlists")
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWatchlist = async (id: string) => {
    try {
      const { error } = await supabase.from("watchlists").delete().eq("id", id)

      if (error) throw error

      await fetchWatchlists()
      toast.success("Removed from watchlist")
    } catch (error) {
      console.error("Error removing from watchlist:", error)
      toast.error("Failed to remove from watchlist")
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const { error } = await signOut()
      if (error) {
        toast.error("Failed to sign out")
      } else {
        toast.success("Signed out successfully")
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      toast.error("An error occurred while signing out")
    } finally {
      setIsSigningOut(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const renderWatchlistItems = (items: WatchlistItem[]) => {
    if (items.length === 0) {
      return (
        <div className="text-center py-8">
          <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No items in this list yet</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {items.map((item) => {
          const detailsPath = `/${item.media_type}/${item.media_id}`
          const watchPath =
            item.media_type === "movie"
              ? `/watch/movie/${item.media_id}`
              : `/watch/tv/${item.media_id}/season/1/episode/1`

          return (
            <Card key={item.id} className="overflow-hidden group relative">
              <Link href={detailsPath}>
                <div className="relative aspect-[2/3]">
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                      alt={item.title}
                      className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75 absolute top-0 left-0 w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Film className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
                    </div>
                  )}
                </div>
              </Link>

              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={() => removeFromWatchlist(item.id)}
              >
                <X className="w-3 h-3" />
              </Button>

              <CardContent className="p-3">
                <Link href={detailsPath}>
                  <h3 className="font-medium line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.media_type === "movie" ? "Movie" : "TV Show"}
                  </p>
                </Link>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  <Link
                    href={watchPath}
                    className="flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3" /> Watch Now
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6 text-primary" />
                <h1 className="text-3xl font-bold">My Profile</h1>
              </div>
              <p className="text-muted-foreground">
                Welcome back, {user.email}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Manage your account preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me-setting"
                    checked={rememberMe}
                    onCheckedChange={(checked: boolean) =>
                      setRememberMe(checked)
                    }
                  />
                  <Label
                    htmlFor="remember-me-setting"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Remember me for 30 days
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  {rememberMe
                    ? "Your session will persist for 30 days even after closing the browser."
                    : "Your session will end when you close the browser."}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>My Watchlists</CardTitle>
                <CardDescription>
                  Manage your movie and TV show collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="watching" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger
                      value="watching"
                      className="text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Watching</span>
                      <span className="sm:hidden">Watch</span>
                      <span className="ml-1">
                        ({watchlists.watching.length})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="should_watch"
                      className="text-xs sm:text-sm"
                    >
                      <span className="hidden sm:inline">Should Watch</span>
                      <span className="sm:hidden">Should</span>
                      <span className="ml-1">
                        ({watchlists.should_watch.length})
                      </span>
                    </TabsTrigger>
                    <TabsTrigger value="dropped" className="text-xs sm:text-sm">
                      <span className="hidden sm:inline">Dropped</span>
                      <span className="sm:hidden">Drop</span>
                      <span className="ml-1">
                        ({watchlists.dropped.length})
                      </span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="watching">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">
                          Loading watchlist...
                        </p>
                      </div>
                    ) : (
                      renderWatchlistItems(watchlists.watching)
                    )}
                  </TabsContent>

                  <TabsContent value="should_watch">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">
                          Loading watchlist...
                        </p>
                      </div>
                    ) : (
                      renderWatchlistItems(watchlists.should_watch)
                    )}
                  </TabsContent>

                  <TabsContent value="dropped">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-t-2 border-primary rounded-full mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">
                          Loading watchlist...
                        </p>
                      </div>
                    ) : (
                      renderWatchlistItems(watchlists.dropped)
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
