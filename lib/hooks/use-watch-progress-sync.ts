import { createClient } from "@/lib/supabase/client"
import {
  convertItemToDbFormat,
  convertToDbFormat,
  convertToVidLinkFormat,
} from "@/lib/watch-progress-utils"
import { useCallback, useEffect, useRef } from "react"
import { useUser } from "./use-user"
import type { MediaItem, VidLinkProgressData } from "./use-vidlink-progress"

const VIDLINK_PROGRESS_STORAGE_KEY = "vidLinkProgress"

// Module-level Supabase client singleton (avoids re-creation on each hook call)
let supabaseClient: ReturnType<typeof createClient> | null = null
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

export function useWatchProgressSync() {
  const { user } = useUser()
  const supabase = getSupabaseClient()
  const syncInProgressRef = useRef(false)

  const syncLocalStorageToAccount = useCallback(async () => {
    if (!user || syncInProgressRef.current) return

    try {
      syncInProgressRef.current = true
      const localData = localStorage.getItem(VIDLINK_PROGRESS_STORAGE_KEY)

      if (!localData) return

      const parsedData: VidLinkProgressData = JSON.parse(localData)
      const itemsToSync = convertToDbFormat(parsedData, user.id)

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
  }, [user, supabase])

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
    }, [user, supabase])

  /**
   * Save a single media item to the account (optimized - only saves one item)
   * This is the preferred method for frequent progress updates
   */
  const saveItemToAccount = useCallback(
    async (mediaId: string, item: MediaItem) => {
      if (!user) return

      try {
        const dbItem = convertItemToDbFormat(item, user.id)

        const { error } = await supabase.from("watch_progress").upsert(dbItem, {
          onConflict: "user_id,media_id,media_type",
          ignoreDuplicates: false,
        })

        if (error) {
          console.error("Error saving item to account:", error)
        }
      } catch (error) {
        console.error("Error saving watch progress item:", error)
      }
    },
    [user, supabase],
  )

  /**
   * Save all progress data to the account (use sparingly - for bulk sync only)
   * Prefer saveItemToAccount for individual updates
   */
  const saveToAccount = useCallback(
    async (progressData: VidLinkProgressData) => {
      if (!user || syncInProgressRef.current) return

      try {
        const itemsToSave = convertToDbFormat(progressData, user.id)

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
    [user, supabase],
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
    saveItemToAccount,
    clearAccountData,
  }
}
