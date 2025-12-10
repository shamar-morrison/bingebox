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
  const {
    loadAccountData,
    saveItemToAccount,
    saveToAccount,
    retryFailedSaves,
  } = useWatchProgressSync()
  const [progressData, setProgressData] = useState<VidLinkProgressData | null>(
    null,
  )
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  // Ref to always access latest progressData in event handlers (avoids stale closure)
  const progressDataRef = useRef<VidLinkProgressData | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    progressDataRef.current = progressData
  }, [progressData])
  // Track which media IDs have been modified since last save
  const dirtyItemsRef = useRef<Set<string>>(new Set())

  // Auto-save debounced function - saves all dirty items
  // Uses progressDataRef.current to always get latest data (avoids stale closure)
  const debouncedSaveToAccount = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const data = progressDataRef.current
      if (user && data) {
        // Capture dirty IDs upfront (we'll clear only on success)
        const dirtyIds = Array.from(dirtyItemsRef.current)

        try {
          // First, retry any previously failed saves
          await retryFailedSaves()

          // Filter to only valid items and track which IDs we're saving
          const itemsToSave = dirtyIds.filter((mediaId) => data[mediaId])

          // Save all dirty items in parallel using Promise.allSettled
          // to handle partial failures gracefully
          const results = await Promise.allSettled(
            itemsToSave.map((mediaId) =>
              saveItemToAccount(mediaId, data[mediaId]).then(() => mediaId),
            ),
          )

          // Process results: only clear successful saves, keep failed ones for retry
          results.forEach((result, index) => {
            const mediaId = itemsToSave[index]
            if (result.status === "fulfilled") {
              // Successfully saved - remove from dirty set
              dirtyItemsRef.current.delete(mediaId)
            } else {
              // Failed - keep in dirty set for retry and log the error
              console.error(
                `[useVidlinkProgress] Failed to save item ${mediaId}:`,
                result.reason,
              )
              // Ensure it stays in dirty set (it might have been re-added already)
              dirtyItemsRef.current.add(mediaId)
            }
          })
        } catch (error) {
          // This catches errors from retryFailedSaves() or unexpected errors
          console.error(
            "[useVidlinkProgress] Error during debounced save:",
            error,
          )
          // Re-add all dirty IDs for retry on next save cycle
          dirtyIds.forEach((id) => dirtyItemsRef.current.add(id))
        }
      }
    }, 2000) // Save 2 seconds after last update
  }, [user, saveItemToAccount, retryFailedSaves])

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
        // Extract the media ID(s) that changed
        const changedMediaIds = Object.keys(newMediaData)

        setProgressData((prevData) => {
          const updatedData = { ...prevData, ...newMediaData }

          // Always save to localStorage (full merge is fine for local storage)
          localStorage.setItem(
            VIDLINK_PROGRESS_STORAGE_KEY,
            JSON.stringify(updatedData),
          )

          // If user is logged in, debounce save only the changed items
          if (user && changedMediaIds.length > 0) {
            // Mark all changed items as dirty
            changedMediaIds.forEach((mediaId) => {
              dirtyItemsRef.current.add(mediaId)
            })
            // Trigger single debounced save
            debouncedSaveToAccount()
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
      const currentProgressData = progressDataRef.current
      if (user && dirtyItemsRef.current.size > 0 && currentProgressData) {
        // Use sendBeacon for reliable saving during page unload
        // Only send the dirty items, not the entire progress data
        const dirtyItems: VidLinkProgressData = {}
        dirtyItemsRef.current.forEach((mediaId) => {
          if (currentProgressData[mediaId]) {
            dirtyItems[mediaId] = currentProgressData[mediaId]
          }
        })

        if (Object.keys(dirtyItems).length > 0) {
          const blob = new Blob(
            [
              JSON.stringify({
                action: "save_progress",
                data: dirtyItems,
                userId: user.id,
              }),
            ],
            { type: "application/json" },
          )

          if ("sendBeacon" in navigator) {
            navigator.sendBeacon("/api/save-progress", blob)
          } else {
            // Fallback: save all dirty items
            saveToAccount(dirtyItems)
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

      const currentProgressData = progressDataRef.current
      if (user && dirtyItemsRef.current.size > 0 && currentProgressData) {
        const dirtyItems: VidLinkProgressData = {}
        dirtyItemsRef.current.forEach((mediaId) => {
          if (currentProgressData[mediaId]) {
            dirtyItems[mediaId] = currentProgressData[mediaId]
          }
        })

        if (Object.keys(dirtyItems).length > 0) {
          saveToAccount(dirtyItems)
        }
      }
    }
  }, [user, saveToAccount])

  const getMediaProgress = useCallback(
    (mediaId: string | number): MediaItem | undefined => {
      return progressData?.[String(mediaId)]
    },
    [progressData],
  )

  const clearAllProgress = useCallback(() => {
    localStorage.removeItem(VIDLINK_PROGRESS_STORAGE_KEY)
    setProgressData({})
    dirtyItemsRef.current.clear()
  }, [])

  return {
    progressData: isDataLoaded ? progressData : null,
    getMediaProgress,
    clearAllProgress,
  }
}
