import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useTrailerHover } from "@/lib/hooks/use-trailer-hover"
import type {
  EpisodeProgress,
  MediaItem as VidLinkMediaItem,
} from "@/lib/hooks/use-vidlink-progress"
import { Film, Play, Tv, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"

interface ContinueWatchingMediaCardProps {
  item: VidLinkMediaItem
}

export default function ContinueWatchingMediaCard({
  item,
}: ContinueWatchingMediaCardProps) {
  const title = item.title || "Untitled"
  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : `/placeholder.svg` // Fallback for missing poster

  let itemMediaType: "movie" | "tv"
  switch (item.type) {
    case "movie":
      itemMediaType = "movie"
      break
    case "tv":
    case "anime":
      itemMediaType = "tv"
      break
    default:
      itemMediaType = "movie" // Default or throw error
  }

  const {
    trailerKey,
    isMuted,
    isLoadingTrailer,
    fetchTrailer,
    toggleMute,
  } = useTrailerHover(itemMediaType, Number(item.id))

  const detailsPath =
    itemMediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`

  let watchPath = "#"
  let currentWatchedSeconds = 0
  let currentDurationSeconds = item.progress?.duration || 0 // Default to item's main duration
  let progressPercent = 0

  if (
    itemMediaType === "tv" &&
    item.last_season_watched &&
    item.last_episode_watched &&
    item.show_progress
  ) {
    const episodeKey = `s${item.last_season_watched}e${item.last_episode_watched}`
    const episodeData: EpisodeProgress | undefined =
      item.show_progress[episodeKey]
    if (episodeData) {
      currentWatchedSeconds = episodeData.progress.watched
      currentDurationSeconds = episodeData.progress.duration
      const season = episodeData.season
      const episode = episodeData.episode
      watchPath = `/watch/tv/${item.id}/season/${season}/episode/${episode}?source=vidlink&startAt=${Math.floor(currentWatchedSeconds)}`
    }
  } else if (itemMediaType === "movie") {
    currentWatchedSeconds = item.progress?.watched || 0
    // currentDurationSeconds is already set from item.progress.duration
    watchPath = `/watch/movie/${item.id}?startAt=${Math.floor(currentWatchedSeconds)}`
  }

  if (currentDurationSeconds > 0) {
    progressPercent = (currentWatchedSeconds / currentDurationSeconds) * 100
  }

  const cardContent = (
    <Card className="overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div className="relative aspect-[2/3] group overflow-hidden bg-muted">
        <Link
          href={detailsPath}
          className="block w-full h-full"
        >
          <img
            src={posterPath}
            alt={title}
            className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75 absolute top-0 left-0 w-full h-full"
            onError={(e) => (e.currentTarget.src = "/placeholder.svg")} // Basic image error handling
          />
          {!posterPath && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              {itemMediaType === "movie" ? (
                <Film className="h-10 w-10 text-muted-foreground" />
              ) : (
                <Tv className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          )}
          {/* Progress Bar Overlay on Poster */}
          {currentDurationSeconds > 0 &&
            progressPercent > 0 &&
            progressPercent < 100 && (
              <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gray-700/70">
                <div
                  className="h-full bg-red-600"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            )}
        </Link>
      </div>
      <CardContent className="p-2 flex flex-col flex-grow">
        <Link href={detailsPath} className="mb-1">
          <h3 className="font-medium line-clamp-1" title={title}>
            {title}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground mb-2 flex-grow">
          {itemMediaType === "movie" ? "Movie" : "TV Show"}
          {item.type === "tv" &&
            item.last_season_watched &&
            item.last_episode_watched && (
              <span className="block">
                S{item.last_season_watched} E{item.last_episode_watched}
              </span>
            )}
        </p>
        <Button
          asChild
          variant="secondary"
          size="sm"
          className="w-full mt-auto"
        >
          <Link
            href={watchPath}
            className="flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" /> Resume
          </Link>
        </Button>
      </CardContent>
    </Card>
  )

  return (
    <HoverCard openDelay={4000} onOpenChange={(open) => {
      if (open) fetchTrailer()
    }}>
      <HoverCardTrigger asChild>
        {cardContent}
      </HoverCardTrigger>
      <HoverCardContent className="w-[320px] p-0 overflow-hidden border-none bg-black" side="right" align="start">
        <div className="aspect-video w-full relative bg-black">
          {isLoadingTrailer ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trailerKey ? (
            <>
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${trailerKey}${isMuted ? "&mute=1" : ""}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                className="w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute bottom-2 right-2 z-20 pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white text-xs">
              No trailer available
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
