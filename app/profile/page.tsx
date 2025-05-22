"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/lib/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { Film, User, X } from "lucide-react"
import Link from "next/link"
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
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <Link
              href={`/${item.media_type}/${item.media_id}`}
              className="block relative overflow-hidden rounded-lg shadow-lg aspect-[2/3] hover:scale-105 transition-transform"
            >
              {item.poster_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                  alt={item.title}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Film className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </Link>

            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeFromWatchlist(item.id)}
            >
              <X className="w-3 h-3" />
            </Button>

            <h3 className="mt-2 text-sm font-medium text-center line-clamp-2">
              {item.title}
            </h3>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">My Profile</h1>
          </div>
          <p className="text-muted-foreground">Welcome back, {user.email}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Watchlists</CardTitle>
            <CardDescription>
              Manage your movie and TV show collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="watching" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="watching">
                  Watching ({watchlists.watching.length})
                </TabsTrigger>
                <TabsTrigger value="should_watch">
                  Should Watch ({watchlists.should_watch.length})
                </TabsTrigger>
                <TabsTrigger value="dropped">
                  Dropped ({watchlists.dropped.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="watching" className="mt-6">
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

              <TabsContent value="should_watch" className="mt-6">
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

              <TabsContent value="dropped" className="mt-6">
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
  )
}
