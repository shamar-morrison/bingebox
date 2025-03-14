import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import VideoPlayer from "@/components/video-player"
import { VideoPlayerSkeleton } from "@/components/video-player-skeleton"
import { fetchTVDetails, fetchEpisodeDetails } from "@/lib/tmdb"

interface WatchTVEpisodePageProps {
  params: { id: string; seasonNumber: string; episodeNumber: string }
}

export default function WatchTVEpisodePage({ params }: WatchTVEpisodePageProps) {
  const showId = Number.parseInt(params.id)
  const seasonNumber = Number.parseInt(params.seasonNumber)
  const episodeNumber = Number.parseInt(params.episodeNumber)

  return (
    <main className="min-h-screen bg-black pt-16">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild className="text-white">
            <Link href={`/watch/tv/${showId}/season/${seasonNumber}`} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to season
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="text-white">
            <Link href="/" className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              StreamFlix
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<VideoPlayerSkeleton />}>
        <EpisodePlayer id={showId} seasonNumber={seasonNumber} episodeNumber={episodeNumber} />
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
  const episodeDetails = await fetchEpisodeDetails(id, seasonNumber, episodeNumber)

  if (!episodeDetails) {
    return (
      <div className="container px-4 pb-16">
        <div className="p-8 text-center text-white">
          <h2 className="text-xl font-medium">Episode not found</h2>
          <p className="mt-2 text-gray-400">The requested episode could not be found.</p>
        </div>
      </div>
    )
  }

  const episodeTitle = `${show.name} - S${seasonNumber}E${episodeNumber} - ${episodeDetails.name}`
  const episodeOverview = episodeDetails.overview || "No overview available for this episode."

  // In a real app, you would fetch the actual video source from your backend
  // For this demo, we'll use a sample video
  const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"

  const posterPath = episodeDetails.still_path
    ? `https://image.tmdb.org/t/p/w500${episodeDetails.still_path}`
    : show.poster_path
      ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
      : `/placeholder.svg?height=750&width=500&text=${encodeURIComponent(episodeTitle)}`

  return (
    <div className="container px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <VideoPlayer src={videoSrc} title={episodeTitle} posterImage={posterPath} />

        <div className="mt-6 space-y-4 text-white">
          <h1 className="text-2xl font-bold">{episodeTitle}</h1>
          <p className="text-gray-400">{episodeOverview}</p>
        </div>
      </div>
    </div>
  )
}

