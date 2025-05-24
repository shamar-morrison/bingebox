import { createClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/database.types"
import { useCallback, useEffect, useRef } from "react"
import { useUser } from "./use-user"
import type { MediaItem, VidLinkProgressData } from "./use-vidlink-progress"

const VIDLINK_PROGRESS_STORAGE_KEY = "vidLinkProgress"

type WatchProgressRow = Tables<"watch_progress">
type WatchProgressInsert = Omit<
  WatchProgressRow,
  "id" | "created_at" | "updated_at"
>

export function useWatchProgressSync() {
  const { user } = useUser()
  const supabase = createClient()
  const syncInProgressRef = useRef(false)

  const convertToVidLinkFormat = useCallback(
    (dbData: WatchProgressRow[]): VidLinkProgressData => {
      const result: VidLinkProgressData = {}

      dbData.forEach((item) => {
        result[item.media_id] = {
          id: item.media_id,
          type: item.media_type as "movie" | "tv" | "anime",
          title: item.title,
          poster_path: item.poster_path || undefined,
          backdrop_path: item.backdrop_path || undefined,
          progress: {
            watched: item.watched_seconds,
            duration: item.duration_seconds,
          },
          last_season_watched: item.last_season_watched || undefined,
          last_episode_watched: item.last_episode_watched || undefined,
          show_progress: (item.show_progress as Record<string, any>) || {},
          last_updated: new Date(item.updated_at || "").getTime(),
        }
      })

      return result
    },
    [],
  )

  const convertFromVidLinkFormat = useCallback(
    (vidLinkData: VidLinkProgressData): WatchProgressInsert[] => {
      return Object.values(vidLinkData).map((item: MediaItem) => ({
        media_id: String(item.id),
        media_type: item.type,
        title: item.title,
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        watched_seconds: item.progress?.watched || 0,
        duration_seconds: item.progress?.duration || 0,
        last_season_watched: item.last_season_watched || null,
        last_episode_watched: item.last_episode_watched || null,
        show_progress: (item.show_progress || {}) as any,
        user_id: user?.id || "",
      }))
    },
    [user?.id],
  )

  const syncLocalStorageToAccount = useCallback(async () => {
    if (!user || syncInProgressRef.current) return

    try {
      syncInProgressRef.current = true
      const localData = localStorage.getItem(VIDLINK_PROGRESS_STORAGE_KEY)

      if (!localData) return

      const parsedData: VidLinkProgressData = JSON.parse(localData)
      const itemsToSync = convertFromVidLinkFormat(parsedData)

      if (itemsToSync.length === 0) return

      const { error } = await supabase
        .from("watch_progress")
        .upsert(itemsToSync, {
          onConflict: "user_id,media_id,media_type",
          ignoreDuplicates: false,
        })

      if (error) {
        console.error("Error syncing localStorage to account:", error)
        return
      }

      console.log("Successfully synced localStorage data to account")

      localStorage.removeItem(VIDLINK_PROGRESS_STORAGE_KEY)
    } catch (error) {
      console.error("Error syncing watch progress:", error)
    } finally {
      syncInProgressRef.current = false
    }
  }, [user, supabase, convertFromVidLinkFormat])

  const loadAccountData =
    useCallback(async (): Promise<VidLinkProgressData | null> => {
      if (!user) return null

      try {
        const { data, error } = await supabase
          .from("watch_progress")
          .select("*")
          .eq("user_id", user.id)
          .order("updated_at", { ascending: false })

        if (error) {
          console.error("Error loading account watch progress:", error)
          return null
        }

        return convertToVidLinkFormat(data || [])
      } catch (error) {
        console.error("Error loading account data:", error)
        return null
      }
    }, [user, supabase, convertToVidLinkFormat])

  const saveToAccount = useCallback(
    async (progressData: VidLinkProgressData) => {
      if (!user || syncInProgressRef.current) return

      try {
        const itemsToSave = convertFromVidLinkFormat(progressData)

        if (itemsToSave.length === 0) return

        const { error } = await supabase
          .from("watch_progress")
          .upsert(itemsToSave, {
            onConflict: "user_id,media_id,media_type",
            ignoreDuplicates: false,
          })

        if (error) {
          console.error("Error saving to account:", error)
        }
      } catch (error) {
        console.error("Error saving watch progress to account:", error)
      }
    },
    [user, supabase, convertFromVidLinkFormat],
  )

  const clearAccountData = useCallback(async () => {
    if (!user) return

    try {
      const { error } = await supabase
        .from("watch_progress")
        .delete()
        .eq("user_id", user.id)

      if (error) {
        console.error("Error clearing account data:", error)
      }
    } catch (error) {
      console.error("Error clearing account data:", error)
    }
  }, [user, supabase])

  // Auto-sync when user signs in and has localStorage data
  useEffect(() => {
    if (user) {
      const localData = localStorage.getItem(VIDLINK_PROGRESS_STORAGE_KEY)
      if (localData) {
        syncLocalStorageToAccount()
      }
    }
  }, [user, syncLocalStorageToAccount])

  return {
    syncLocalStorageToAccount,
    loadAccountData,
    saveToAccount,
    clearAccountData,
  }
}
