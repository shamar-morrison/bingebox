import { useCallback } from "react"
import { useUser } from "./use-user"
import { useWatchProgressSync } from "./use-watch-progress-sync"

const VIDLINK_PROGRESS_STORAGE_KEY = "vidLinkProgress"

export function useWatchProgressManager() {
  const { user } = useUser()
  const { saveToAccount, clearAccountData, syncLocalStorageToAccount } =
    useWatchProgressSync()

  const clearAllProgressData = useCallback(async () => {
    // Clear localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem(VIDLINK_PROGRESS_STORAGE_KEY)
    }

    // Clear account data if user is logged in
    if (user) {
      await clearAccountData()
    }
  }, [user, clearAccountData])

  const syncCurrentProgressToAccount = useCallback(async () => {
    if (!user) return

    // Get current localStorage data and sync it
    if (typeof window !== "undefined") {
      const localData = localStorage.getItem(VIDLINK_PROGRESS_STORAGE_KEY)
      if (localData) {
        try {
          const parsedData = JSON.parse(localData)
          await saveToAccount(parsedData)
          console.log("Successfully synced current progress to account")
        } catch (error) {
          console.error("Error syncing current progress:", error)
        }
      }
    }
  }, [user, saveToAccount])

  const handleSignOut = useCallback(async () => {
    // Before signing out, sync any unsaved progress to account
    if (user) {
      await syncCurrentProgressToAccount()
    }

    // Note: We don't clear localStorage here because the user might want to
    // continue watching on the same device even when not logged in
  }, [user, syncCurrentProgressToAccount])

  const handleSignIn = useCallback(async () => {
    // When user signs in, automatically sync localStorage data if it exists
    if (user) {
      await syncLocalStorageToAccount()
    }
  }, [user, syncLocalStorageToAccount])

  return {
    clearAllProgressData,
    syncCurrentProgressToAccount,
    handleSignOut,
    handleSignIn,
  }
}
