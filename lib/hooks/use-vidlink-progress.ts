import { useCallback, useEffect, useRef, useState } from "react"
import { useUser } from "./use-user"
import { useWatchProgressSync } from "./use-watch-progress-sync"

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
export interface VidLinkProgressData {
  [mediaId: string]: MediaItem
}

export function useVidlinkProgress() {
  const { user } = useUser()
  const { loadAccountData, saveToAccount } = useWatchProgressSync()
  const [progressData, setProgressData] = useState<VidLinkProgressData | null>(
    null,
  )
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSavedDataRef = useRef<VidLinkProgressData>({})

  // Auto-save debounced function
  const debouncedSaveToAccount = useCallback(
    (data: VidLinkProgressData) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (user && data) {
          saveToAccount(data)
          lastSavedDataRef.current = { ...data }
        }
      }, 2000) // Save 2 seconds after last update
    },
    [user, saveToAccount],
  )

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      if (user) {
        // User is logged in, load from account
        const accountData = await loadAccountData()
        if (accountData) {
          setProgressData(accountData)
          setIsDataLoaded(true)
          return
        }
      }

      // Load from localStorage (either user not logged in or no account data)
      const storedProgress = localStorage.getItem(VIDLINK_PROGRESS_STORAGE_KEY)
      if (storedProgress) {
        try {
          const parsed = JSON.parse(storedProgress)
          setProgressData(parsed)
          lastSavedDataRef.current = { ...parsed }
        } catch (error) {
          console.error(
            "[useVidlinkProgress] Error parsing VidLink progress from localStorage:",
            error,
          )
          localStorage.removeItem(VIDLINK_PROGRESS_STORAGE_KEY)
        }
      } else {
        setProgressData({})
      }
      setIsDataLoaded(true)
    }

    loadInitialData()
  }, [user, loadAccountData])

  // Handle VidLink messages and auto-save
  useEffect(() => {
    if (!isDataLoaded) return

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://vidlink.pro") {
        return
      }

      if (event.data?.type === "MEDIA_DATA") {
        const newMediaData = event.data.data as VidLinkProgressData
        setProgressData((prevData) => {
          const updatedData = { ...prevData, ...newMediaData }

          // Always save to localStorage
          localStorage.setItem(
            VIDLINK_PROGRESS_STORAGE_KEY,
            JSON.stringify(updatedData),
          )

          // If user is logged in, debounce save to account
          if (user) {
            debouncedSaveToAccount(updatedData)
          }

          return updatedData
        })
      }
    }

    window.addEventListener("message", handleMessage)
    return () => {
      window.removeEventListener("message", handleMessage)
    }
  }, [user, debouncedSaveToAccount, isDataLoaded])

  // Save to account when user stops watching (component unmount, page unload, etc.)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && progressData && Object.keys(progressData).length > 0) {
        // Check if there are unsaved changes
        const currentDataStr = JSON.stringify(progressData)
        const lastSavedDataStr = JSON.stringify(lastSavedDataRef.current)

        if (currentDataStr !== lastSavedDataStr) {
          // Use sendBeacon for reliable saving during page unload
          const blob = new Blob(
            [
              JSON.stringify({
                action: "save_progress",
                data: progressData,
                userId: user.id,
              }),
            ],
            { type: "application/json" },
          )

          // If sendBeacon is not available, try synchronous save
          if ("sendBeacon" in navigator) {
            navigator.sendBeacon("/api/save-progress", blob)
          } else {
            // Fallback: immediate save (might not complete if page unloads)
            saveToAccount(progressData)
          }
        }
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)

      // Save any pending changes when component unmounts
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      if (user && progressData && Object.keys(progressData).length > 0) {
        const currentDataStr = JSON.stringify(progressData)
        const lastSavedDataStr = JSON.stringify(lastSavedDataRef.current)

        if (currentDataStr !== lastSavedDataStr) {
          saveToAccount(progressData)
        }
      }
    }
  }, [user, progressData, saveToAccount])

  const getMediaProgress = useCallback(
    (mediaId: string | number): MediaItem | undefined => {
      return progressData?.[String(mediaId)]
    },
    [progressData],
  )

  const clearAllProgress = useCallback(() => {
    localStorage.removeItem(VIDLINK_PROGRESS_STORAGE_KEY)
    setProgressData({})
    lastSavedDataRef.current = {}
  }, [])

  return {
    progressData: isDataLoaded ? progressData : null,
    getMediaProgress,
    clearAllProgress,
  }
}
