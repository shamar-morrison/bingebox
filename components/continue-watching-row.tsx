"use client"

import ContinueWatchingMediaCard from "@/components/continue-watching-media-card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useVidlinkProgress,
  type EpisodeProgress,
  type MediaItem as VidLinkMediaItem,
} from "@/lib/hooks/use-vidlink-progress"
import { useMemo } from "react"

// minimum watch time in seconds to be considered for "Continue Watching"
const MIN_WATCH_SECONDS = 60 // e.g., 1 minute
// maximum progress percentage to avoid showing nearly completed items (e.g. > 95%)
const MAX_PROGRESS_PERCENT = 95

export default function ContinueWatchingRow() {
  const { progressData } = useVidlinkProgress()

  const itemsToDisplay = useMemo(() => {
    // If progressData is null (still loading) or an empty object (loaded, but no data)
    if (!progressData || Object.keys(progressData).length === 0) {
      return []
    }
    return Object.values(progressData)
      .filter((item) => {
        let watched: number | undefined
        let duration: number | undefined
        let satisfiesMinWatchRequirement = false // Flag to check if min watch time or S1E1+ condition is met

        if (item.type === "tv") {
          if (
            item.last_season_watched &&
            item.last_episode_watched &&
            item.show_progress
          ) {
            const episodeKey = `s${item.last_season_watched}e${item.last_episode_watched}`
            const episodeData: EpisodeProgress | undefined =
              item.show_progress[episodeKey]

            if (episodeData && episodeData.progress) {
              watched = episodeData.progress.watched
              duration = episodeData.progress.duration

              const lastSeasonNum = parseInt(item.last_season_watched, 10)
              const lastEpisodeNum = parseInt(item.last_episode_watched, 10)

              const isBeyondS1E1 =
                lastSeasonNum > 1 || (lastSeasonNum === 1 && lastEpisodeNum > 1)

              if (isBeyondS1E1) {
                satisfiesMinWatchRequirement = true // If past S1E1, it's eligible
              } else if (typeof watched === "number") {
                // For S1E1, check MIN_WATCH_SECONDS
                satisfiesMinWatchRequirement = watched > MIN_WATCH_SECONDS
              }
            }
          }
        } else {
          // For movies and other types (if any in future)
          watched = item.progress?.watched
          duration = item.progress?.duration
          if (typeof watched === "number") {
            satisfiesMinWatchRequirement = watched > MIN_WATCH_SECONDS
          }
        }

        if (
          typeof watched !== "number" ||
          typeof duration !== "number" ||
          duration === 0 // also check duration is not zero to prevent division by zero
        ) {
          return false // Skip if progress data is incomplete or duration is zero
        }
        const progressPercent = (watched / duration) * 100
        return (
          satisfiesMinWatchRequirement && progressPercent < MAX_PROGRESS_PERCENT
        )
      })
      .sort((a, b) => (b.last_updated || 0) - (a.last_updated || 0)) // Sort by most recently updated
  }, [progressData])

  // If data is still loading from localStorage
  if (progressData === null) {
    return (
      <div className="container px-4 mt-8">
        <section className="pb-8">
          {/* Optionally, show a title skeleton too, or just the RowSkeleton */}
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-1/3 rounded" />{" "}
            {/* Skeleton for title */}
          </div>
          <RowSkeleton count={4} />
        </section>
      </div>
    )
  }

  // If no items to display after loading and filtering
  if (itemsToDisplay.length === 0) {
    return null // Don't render the section if there's nothing to show
  }

  return (
    <div className="container px-4 mt-8">
      <section className="pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Continue Watching</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
          {itemsToDisplay.map((item) => (
            <ContinueWatchingMediaCard
              key={`${item.id}-${item.type}`}
              item={item as VidLinkMediaItem}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function RowSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="aspect-[2/3] rounded-md" />
          <Skeleton className="h-4 w-3/4 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  )
}
