import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { SeasonEpisodeSelector } from "@/components/season-episode-selector"
import { Button } from "@/components/ui/button"
import { VideoPlayerSkeleton } from "@/components/video-player-skeleton"
import VidsrcPlayer from "@/components/vidsrc-player"
import {
  fetchEpisodeDetails,
  fetchSeasonDetails,
  fetchTVDetails,
} from "@/lib/tmdb"

interface WatchTVEpisodePageProps {
  params: { id: string; seasonNumber: string; episodeNumber: string }
  searchParams: { source?: string }
}

export async function generateMetadata({
  params,
}: WatchTVEpisodePageProps): Promise<Metadata> {
  const showId = Number.parseInt(params.id)
  const seasonNumber = Number.parseInt(params.seasonNumber)
  const episodeNumber = Number.parseInt(params.episodeNumber)

  const show = await fetchTVDetails(showId)
  const episodeDetails = await fetchEpisodeDetails(
    showId,
    seasonNumber,
    episodeNumber,
  )

  const episodeTitle = episodeDetails?.name || `Episode ${episodeNumber}`
  const title = `Watch ${show.name} S${seasonNumber}E${episodeNumber} - ${episodeTitle} Free Online - BingeBox`

  return {
    title,
    description: `Stream ${show.name} Season ${seasonNumber} Episode ${episodeNumber} in HD quality for free on BingeBox`,
  }
}

export default function WatchTVEpisodePage({
  params,
  searchParams,
}: WatchTVEpisodePageProps) {
  const showId = Number.parseInt(params.id)
  const seasonNumber = Number.parseInt(params.seasonNumber)
  const episodeNumber = Number.parseInt(params.episodeNumber)
  const source = searchParams.source
  const sourceParam = source ? `?source=${source}` : ""

  return (
    <main className="min-h-screen bg-background pt-16">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/watch/tv/${showId}/season/${seasonNumber}${sourceParam}`}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to season
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<VideoPlayerSkeleton />}>
        <EpisodePlayer
          id={showId}
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
          source={source}
        />
      </Suspense>
    </main>
  )
}

async function EpisodePlayer({
  id,
  seasonNumber,
  episodeNumber,
  source,
}: {
  id: number
  seasonNumber: number
  episodeNumber: number
  source?: string
}) {
  const show = await fetchTVDetails(id)
  const episodeDetails = await fetchEpisodeDetails(
    id,
    seasonNumber,
    episodeNumber,
  )
  const seasonDetails = await fetchSeasonDetails(id, seasonNumber)

  if (!episodeDetails) {
    return (
      <div className="container px-4 pb-16">
        <div className="p-8 text-center">
          <h2 className="text-xl font-medium">Episode not found</h2>
          <p className="mt-2 text-muted-foreground">
            The requested episode could not be found.
          </p>
        </div>
      </div>
    )
  }

  const episodeTitle = `${show.name || "TV Show"} - S${seasonNumber}E${episodeNumber} - ${episodeDetails.name || "Untitled Episode"}`
  const episodeOverview =
    episodeDetails.overview || "No overview available for this episode."
  const posterPath = show.poster_path
    ? `https://image.tmdb.org/t/p/w185${show.poster_path}`
    : "/placeholder.svg"
  const showFirstAirDate = show.first_air_date
  const episodeAirDate = episodeDetails.air_date
  const cast = show.credits?.cast || []

  const formattedShowDate = showFirstAirDate
    ? new Date(showFirstAirDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  const formattedEpisodeDate = episodeAirDate
    ? new Date(episodeAirDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  const episodes = seasonDetails.episodes || []
  const totalEpisodes = episodes.length

  const sourceParam = source ? `?source=${source}` : ""

  // Previous episode - either previous in current season or last of previous season
  let prevEpisodeLink = null
  if (episodeNumber > 1) {
    // Previous episode in current season
    prevEpisodeLink = `/watch/tv/${id}/season/${seasonNumber}/episode/${episodeNumber - 1}${sourceParam}`
  } else if (seasonNumber > 1) {
    // Last episode of previous season
    prevEpisodeLink = `/watch/tv/${id}/season/${seasonNumber - 1}/episode/1${sourceParam}`
  }

  // Next episode - either next in current season or first of next season
  let nextEpisodeLink = null
  if (episodeNumber < totalEpisodes) {
    // Next episode in current season
    nextEpisodeLink = `/watch/tv/${id}/season/${seasonNumber}/episode/${episodeNumber + 1}${sourceParam}`
  } else if (show.seasons && show.seasons.length > seasonNumber) {
    // First episode of next season
    nextEpisodeLink = `/watch/tv/${id}/season/${seasonNumber + 1}/episode/1${sourceParam}`
  }

  return (
    <div className="container px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <VidsrcPlayer
          tmdbId={id}
          mediaType="tv"
          seasonNumber={seasonNumber}
          episodeNumber={episodeNumber}
          title={episodeTitle}
        />

        <div className="flex justify-between mt-4">
          {prevEpisodeLink ? (
            <Button
              variant="outline"
              asChild
              className="flex items-center gap-1"
            >
              <Link href={prevEpisodeLink}>
                <ArrowLeft className="w-4 h-4" />
                Previous Episode
              </Link>
            </Button>
          ) : (
            <div></div> // Placeholder to maintain layout
          )}

          {nextEpisodeLink ? (
            <Button
              variant="outline"
              asChild
              className="flex items-center gap-1"
            >
              <Link href={nextEpisodeLink}>
                Next Episode
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          ) : (
            <div></div> // Placeholder to maintain layout
          )}
        </div>

        <SeasonEpisodeSelector
          showId={id}
          currentSeasonNumber={seasonNumber}
          currentEpisodeNumber={episodeNumber}
          seasons={show.seasons || []}
          episodes={episodes}
          source={source}
        />

        <div className="mt-6 flex flex-col md:flex-row gap-6">
          <div className="hidden md:block flex-shrink-0 w-48">
            {posterPath && (
              <Image
                src={posterPath}
                alt={`${show.name || "TV Show"} Poster`}
                width={185}
                height={278}
                className="rounded-lg object-cover"
              />
            )}
          </div>

          <div className="flex-grow space-y-4 text-foreground">
            <h1 className="text-2xl font-bold">{episodeTitle}</h1>
            <p className="text-muted-foreground">{episodeOverview}</p>

            <div className="hidden md:block space-y-2">
              {formattedEpisodeDate && (
                <p className="text-sm">
                  <span className="font-semibold">Aired:</span>{" "}
                  {formattedEpisodeDate}
                </p>
              )}
              {formattedShowDate && (
                <p className="text-sm">
                  <span className="font-semibold">Show First Aired:</span>{" "}
                  {formattedShowDate}
                </p>
              )}
              {cast.length > 0 && (
                <p className="text-sm">
                  <span className="font-semibold">Cast:</span>{" "}
                  {cast
                    .slice(0, 10)
                    .map((c) => c.name)
                    .join(", ")}
                  {cast.length > 10 ? ", ..." : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
