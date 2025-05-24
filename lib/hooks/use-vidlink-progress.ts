import { useCallback, useEffect, useState } from "react"

const VIDLINK_PROGRESS_STORAGE_KEY = "vidLinkProgress"

// Define the structure of the media data and progress
// Based on the VidLink documentation example
interface MediaProgress {
  watched: number
  duration: number
}

export interface EpisodeProgress {
  season: string
  episode: string
  progress: MediaProgress
  last_updated?: number
}

export interface MediaItem {
  id: number | string // TMDB ID for movies/TV, MAL ID for anime
  type: "movie" | "tv" | "anime"
  title: string
  poster_path?: string
  backdrop_path?: string
  progress: MediaProgress
  last_season_watched?: string
  last_episode_watched?: string
  show_progress?: {
    [seasonEpisodeKey: string]: EpisodeProgress // e.g., "s1e1"
  }
  last_updated?: number
}

// The overall structure stored in localStorage
interface VidLinkProgressData {
  [mediaId: string]: MediaItem
}

export function useVidlinkProgress() {
  const [progressData, setProgressData] = useState<VidLinkProgressData | null>(
    null,
  )

  useEffect(() => {
    const storedProgress = localStorage.getItem(VIDLINK_PROGRESS_STORAGE_KEY)
    if (storedProgress) {
      try {
        setProgressData(JSON.parse(storedProgress))
      } catch (error) {
        console.error(
          "[useVidlinkProgress] Error parsing VidLink progress from localStorage:",
          error,
        )
        localStorage.removeItem(VIDLINK_PROGRESS_STORAGE_KEY) // Clear corrupted data
      }
    } else {
      // Initialize to empty object if nothing is in localStorage after first load attempt
      setProgressData({})
    }

    // Event listener for VidLink messages
    const handleMessage = (event: MessageEvent) => {
      // Looser origin check for debugging - REMOVE or make more specific for production
      // if (!event.origin.includes('vidlink')) {
      //   console.log("[useVidlinkProgress] Message from other origin:", event.origin)
      //   return
      // }

      if (event.origin !== "https://vidlink.pro") {
        return
      }

      if (event.data?.type === "MEDIA_DATA") {
        const newMediaData = event.data.data as VidLinkProgressData
        setProgressData((prevData) => {
          const updatedData = { ...prevData, ...newMediaData }
          localStorage.setItem(
            VIDLINK_PROGRESS_STORAGE_KEY,
            JSON.stringify(updatedData),
          )
          return updatedData
        })
      }
    }

    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [])

  const getMediaProgress = useCallback(
    (mediaId: string | number): MediaItem | undefined => {
      return progressData?.[String(mediaId)]
    },
    [progressData],
  )

  // Optional: A function to manually clear progress if needed for testing or user action
  const clearAllProgress = useCallback(() => {
    localStorage.removeItem(VIDLINK_PROGRESS_STORAGE_KEY)
    setProgressData({}) // Set to empty object after clearing
  }, [])

  return { progressData, getMediaProgress, clearAllProgress }
}
