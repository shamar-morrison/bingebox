import { ChevronLeft, Play } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchSeasonDetails, fetchTVDetails } from "@/lib/tmdb"
import { Episode } from "@/lib/types"

interface WatchTVSeasonPageProps {
  params: { id: string; seasonNumber: string }
  searchParams: { source?: string }
}

export default function WatchTVSeasonPage({
  params,
  searchParams,
}: WatchTVSeasonPageProps) {
  const showId = Number.parseInt(params.id)
  const seasonNumber = Number.parseInt(params.seasonNumber)
  const source = searchParams.source
  const sourceParam = source ? `?source=${source}` : ""

  return (
    <main className="min-h-screen">
      <div className="container px-4 py-24 mt-16">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/tv/${showId}${sourceParam}`}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to show details
            </Link>
          </Button>
        </div>

        <Suspense fallback={<SeasonEpisodesSkeleton />}>
          <SeasonEpisodes
            id={showId}
            seasonNumber={seasonNumber}
            source={source}
          />
        </Suspense>
      </div>
    </main>
  )
}

async function SeasonEpisodes({
  id,
  seasonNumber,
  source,
}: {
  id: number
  seasonNumber: number
  source?: string
}) {
  const show = await fetchTVDetails(id)
  const seasonDetails = await fetchSeasonDetails(id, seasonNumber)
  const sourceParam = source ? `?source=${source}` : ""

  if (!seasonDetails) {
    return (
      <div className="p-8 text-center border rounded-lg">
        <h2 className="text-xl font-medium">Season not found</h2>
        <p className="mt-2 text-muted-foreground">
          The requested season could not be found.
        </p>
      </div>
    )
  }

  const episodes = seasonDetails.episodes || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{show.name}</h1>
        <h2 className="text-xl font-semibold text-muted-foreground">
          {seasonDetails.name}
        </h2>
      </div>

      <div className="grid gap-4">
        {episodes.map((episode: Episode) => (
          <Card key={episode.id}>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">
                {episode.episode_number}. {episode.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                <div className="relative overflow-hidden rounded-md aspect-video bg-muted">
                  {episode.still_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                      alt={episode.name}
                      className="object-cover absolute top-0 left-0 w-full h-full"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {episode.overview ||
                      "No overview available for this episode."}
                  </p>
                  <div className="mt-4">
                    <Button asChild>
                      <Link
                        href={`/watch/tv/${id}/season/${seasonNumber}/episode/${episode.episode_number}${sourceParam}`}
                      >
                        Watch Episode
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function SeasonEpisodesSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-6 w-1/4 mt-2" />
      </div>

      <div className="grid gap-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-4">
                <Skeleton className="h-6 w-1/3" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                  <Skeleton className="aspect-video w-full" />
                  <div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                    <Skeleton className="h-10 w-32 mt-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
