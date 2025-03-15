import { ArrowLeft, ArrowRight, ChevronLeft, Info } from "lucide-react"
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
}

export default function WatchTVEpisodePage({
  params,
}: WatchTVEpisodePageProps) {
  const showId = Number.parseInt(params.id)
  const seasonNumber = Number.parseInt(params.seasonNumber)
  const episodeNumber = Number.parseInt(params.episodeNumber)

  return (
    <main className="min-h-screen bg-background pt-16">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild>
            <Link
              href={`/watch/tv/${showId}/season/${seasonNumber}`}
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
        />
      </Suspense>
    </main>
  )
}

async function EpisodePlayer({
  id,
  seasonNumber,
  episodeNumber,
}: {
  id: number
  seasonNumber: number
  episodeNumber: number
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

  const episodeTitle = `${show.name} - S${seasonNumber}E${episodeNumber} - ${episodeDetails.name}`
  const episodeOverview =
    episodeDetails.overview || "No overview available for this episode."

  const episodes = seasonDetails.episodes || []
  const totalEpisodes = episodes.length

  // Previous episode - either previous in current season or last of previous season
  let prevEpisodeLink = null
  if (episodeNumber > 1) {
    // Previous episode in current season
    prevEpisodeLink = `/watch/tv/${id}/season/${seasonNumber}/episode/${episodeNumber - 1}`
  } else if (seasonNumber > 1) {
    // Last episode of previous season
    prevEpisodeLink = `/watch/tv/${id}/season/${seasonNumber - 1}/episode/1`
  }

  // Next episode - either next in current season or first of next season
  let nextEpisodeLink = null
  if (episodeNumber < totalEpisodes) {
    // Next episode in current season
    nextEpisodeLink = `/watch/tv/${id}/season/${seasonNumber}/episode/${episodeNumber + 1}`
  } else if (show.seasons && show.seasons.length > seasonNumber) {
    // First episode of next season
    nextEpisodeLink = `/watch/tv/${id}/season/${seasonNumber + 1}/episode/1`
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
            <div></div>
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
            <div></div>
          )}
        </div>

        <SeasonEpisodeSelector
          showId={id}
          currentSeasonNumber={seasonNumber}
          currentEpisodeNumber={episodeNumber}
          seasons={show.seasons || []}
          episodes={episodes}
        />

        <div className="mt-6 space-y-4">
          <h1 className="text-2xl font-bold">{episodeTitle}</h1>
          <p className="text-muted-foreground">{episodeOverview}</p>
        </div>
      </div>
    </div>
  )
}
