"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"
import { MediaItem } from "@/lib/types"
import { CheckCircle, ListPlus, Loader2, Trash2, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

export type WatchlistStatusType = "watching" | "should-watch" | "dropped" | null

interface AddToWatchlistButtonProps {
  mediaItem: MediaItem
  mediaType: "movie" | "tv"
}

export function AddToWatchlistButton({
  mediaItem,
  mediaType,
}: AddToWatchlistButtonProps) {
  const { authState, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<WatchlistStatusType>(null)
  const [isLoading, setIsLoading] = useState(false) // For API calls
  const [isFetchingStatus, setIsFetchingStatus] = useState(true)

  const fetchWatchlistStatus = useCallback(async () => {
    if (!authState.user || !mediaItem?.id) return
    setIsFetchingStatus(true)
    try {
      const response = await fetch(
        `/api/watchlist/${mediaType}/${mediaItem.id}`,
      )
      if (!response.ok) {
        if (response.status === 401) {
          // Don't toast for 401, user is just not logged in or session expired
          console.log("User not authenticated to fetch watchlist status.")
          setCurrentStatus(null) // Ensure status is null if not authed
          return
        }
        throw new Error("Failed to fetch watchlist status")
      }
      const data = await response.json()
      setCurrentStatus(data.status as WatchlistStatusType)
    } catch (error) {
      console.error("Error fetching watchlist status:", error)
      // Do not show toast for initial fetch error, button will just be default
      setCurrentStatus(null)
    } finally {
      setIsFetchingStatus(false)
    }
  }, [authState.user, mediaItem?.id, mediaType])

  useEffect(() => {
    if (authState.user && mediaItem?.id) {
      fetchWatchlistStatus()
    } else if (!authLoading) {
      // If auth is loaded and there is no user, set status to null and stop loading
      setCurrentStatus(null)
      setIsFetchingStatus(false)
    }
  }, [authState.user, authLoading, mediaItem?.id, fetchWatchlistStatus])

  const handleSetStatus = async (status: WatchlistStatusType) => {
    if (!authState.user) {
      toast.error("Please log in to manage your watchlist.", {
        action: {
          label: "Log In",
          onClick: () => router.push("/login"),
        },
      })
      return
    }
    setIsLoading(true)
    const loadingToastId = toast.loading(
      status ? "Updating watchlist..." : "Removing from watchlist...",
    )

    try {
      let response
      if (status === null) {
        // Remove from list
        response = await fetch(`/api/watchlist/${mediaType}/${mediaItem.id}`, {
          method: "DELETE",
        })
      } else {
        // Add/Update list
        const requestBody = {
          status,
          title: mediaType === "movie" ? mediaItem.title : mediaItem.name,
          poster_path: mediaItem.poster_path,
          release_date:
            mediaType === "movie"
              ? mediaItem.release_date
              : mediaItem.first_air_date,
        }

        response = await fetch(`/api/watchlist/${mediaType}/${mediaItem.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error ||
            (status
              ? "Failed to update watchlist"
              : "Failed to remove from watchlist"),
        )
      }

      // If DELETE, response is { message: ... }, if POST, response is { status: ... }
      const responseData = await response.json()
      const newApiStatus = status === null ? null : responseData.status

      setCurrentStatus(newApiStatus as WatchlistStatusType)
      toast.success(
        status
          ? `Added to ${status.replace("-", " ")} list!`
          : "Removed from watchlist!",
        { id: loadingToastId },
      )
    } catch (error: any) {
      console.error("Error updating watchlist:", error)
      toast.error(error.message || "An unexpected error occurred.", {
        id: loadingToastId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isFetchingStatus) {
    return (
      <Button variant="outline" disabled className="w-[150px]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading List
      </Button>
    )
  }

  if (!authState.user) {
    return (
      <Button
        variant="outline"
        onClick={() => {
          toast.error("Please log in to manage your watchlist.", {
            action: {
              label: "Log In",
              onClick: () => router.push("/login"),
            },
          })
        }}
        className="w-[150px]"
      >
        <ListPlus className="mr-2 h-4 w-4" /> Add to List
      </Button>
    )
  }

  // Main button content for logged-in users
  let buttonText = "Add to List"
  let ButtonIcon = ListPlus
  const dropdownItems: JSX.Element[] = [
    <DropdownMenuItem
      key="watching"
      onClick={() => handleSetStatus("watching")}
    >
      <CheckCircle className="h-4 w-4 text-green-500" /> Add to Watching
    </DropdownMenuItem>,
    <DropdownMenuItem
      key="should-watch"
      onClick={() => handleSetStatus("should-watch")}
    >
      <ListPlus className="h-4 w-4 text-blue-500" /> Add to Should Watch
    </DropdownMenuItem>,
    <DropdownMenuItem key="dropped" onClick={() => handleSetStatus("dropped")}>
      <XCircle className="h-4 w-4 text-red-500" /> Add to Dropped
    </DropdownMenuItem>,
  ]

  if (currentStatus) {
    switch (currentStatus) {
      case "watching":
        buttonText = "Watching"
        ButtonIcon = CheckCircle
        break
      case "should-watch":
        buttonText = "Should Watch"
        ButtonIcon = ListPlus
        break
      case "dropped":
        buttonText = "Dropped"
        ButtonIcon = XCircle
        break
    }
    // Modify dropdown items if already in a list
    dropdownItems.push(<DropdownMenuSeparator key="separator" />)
    dropdownItems.push(
      <DropdownMenuItem
        key="remove"
        onClick={() => handleSetStatus(null)}
        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/50"
      >
        <Trash2 className="mr-2 h-4 w-4" /> Remove from List
      </DropdownMenuItem>,
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading} className="w-[150px]">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ButtonIcon className="h-4 w-4" />
          )}
          {isLoading
            ? currentStatus
              ? "Updating..."
              : "Adding..."
            : buttonText}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">{dropdownItems}</DropdownMenuContent>
    </DropdownMenu>
  )
}
