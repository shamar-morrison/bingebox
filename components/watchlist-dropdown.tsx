"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser } from "@/lib/hooks/use-user"
import { createClient } from "@/lib/supabase/client"
import { Check, Heart, ListPlus, Loader2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface WatchlistDropdownProps {
  mediaId: number
  mediaType: "movie" | "tv"
  title: string
  posterPath?: string | null
}

type WatchlistStatus = "watching" | "should_watch" | "dropped" | null

export default function WatchlistDropdown({
  mediaId,
  mediaType,
  title,
  posterPath,
}: WatchlistDropdownProps) {
  const { user } = useUser()
  const [currentStatus, setCurrentStatus] = useState<WatchlistStatus>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      checkWatchlistStatus()
    } else {
      setIsChecking(false)
    }
  }, [user, mediaId, mediaType])

  const checkWatchlistStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("watchlists")
        .select("status")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 means no rows returned
        throw error
      }

      setCurrentStatus(data?.status || null)
    } catch (error) {
      console.error("Error checking watchlist status:", error)
    } finally {
      setIsChecking(false)
    }
  }

  const updateWatchlistStatus = async (status: WatchlistStatus) => {
    if (!user) {
      toast.error("Please sign in to use watchlists")
      return
    }

    setIsLoading(true)

    try {
      if (status === null) {
        // Remove from watchlist
        const { error } = await supabase
          .from("watchlists")
          .delete()
          .eq("media_id", mediaId)
          .eq("media_type", mediaType)

        if (error) throw error
        toast.success("Removed from watchlist")
      } else if (currentStatus === null) {
        // Add to watchlist
        const { error } = await supabase.from("watchlists").insert({
          media_id: mediaId,
          media_type: mediaType,
          status,
          title,
          poster_path: posterPath,
          user_id: user.id,
        })

        if (error) throw error
        toast.success(`Added to ${status.replace("_", " ")} list`)
      } else {
        // Update existing entry
        const { error } = await supabase
          .from("watchlists")
          .update({ status })
          .eq("media_id", mediaId)
          .eq("media_type", mediaType)

        if (error) throw error
        toast.success(`Moved to ${status.replace("_", " ")} list`)
      }

      setCurrentStatus(status)
    } catch (error) {
      console.error("Error updating watchlist:", error)
      toast.error("Failed to update watchlist")
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return null
  }

  const getButtonText = () => {
    if (isChecking) return "Loading..."
    if (currentStatus === null) return "Add to List"
    return `In ${currentStatus.replace("_", " ")} list`
  }

  const getButtonIcon = () => {
    if (isChecking || isLoading)
      return <Loader2 className="w-4 h-4 animate-spin" />
    if (currentStatus === null) return <ListPlus className="w-4 h-4" />
    return <Check className="w-4 h-4" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isChecking || isLoading}>
          {getButtonIcon()}
          <span>{getButtonText()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Add to List</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => updateWatchlistStatus("watching")}
          className="cursor-pointer"
        >
          <div className="flex items-center w-full">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            <span>Watching</span>
            {currentStatus === "watching" && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => updateWatchlistStatus("should_watch")}
          className="cursor-pointer"
        >
          <div className="flex items-center w-full">
            <ListPlus className="w-4 h-4 mr-2 text-blue-500" />
            <span>Should Watch</span>
            {currentStatus === "should_watch" && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => updateWatchlistStatus("dropped")}
          className="cursor-pointer"
        >
          <div className="flex items-center w-full">
            <X className="w-4 h-4 mr-2 text-gray-500" />
            <span>Dropped</span>
            {currentStatus === "dropped" && (
              <Check className="w-4 h-4 ml-auto" />
            )}
          </div>
        </DropdownMenuItem>

        {currentStatus !== null && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => updateWatchlistStatus(null)}
              className="cursor-pointer text-destructive"
            >
              <X className="w-4 h-4" />
              <span>Remove from List</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
