import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type {
  EpisodeProgress,
  MediaItem as VidLinkMediaItem,
} from "@/lib/hooks/use-vidlink-progress"
import { Film, Play, Tv } from "lucide-react"
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

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <Link
        href={detailsPath}
        className="block relative group aspect-[2/3] overflow-hidden"
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
}
