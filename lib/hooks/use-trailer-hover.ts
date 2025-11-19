"use client"

import { useState, useCallback } from "react"
import { getTrailers } from "@/lib/tmdb-client"

export function useTrailerHover(mediaType: string, mediaId: number) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false)
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false)

  const fetchTrailer = useCallback(async () => {
    if (hasAttemptedFetch) return

    if (mediaType === "person" || mediaType === "unknown") return

    setIsLoadingTrailer(true)
    try {
      const trailers = await getTrailers(mediaType, mediaId)
      if (trailers && trailers.length > 0) {
        // Prefer official trailers
        const officialTrailer = trailers.find(
          (t) => t.type === "Trailer"
        )
        setTrailerKey(officialTrailer ? officialTrailer.key : trailers[0].key)
      }
    } catch (error) {
      console.error("Failed to load trailer", error)
    } finally {
      setIsLoadingTrailer(false)
      setHasAttemptedFetch(true)
    }
  }, [mediaType, mediaId, hasAttemptedFetch])

  const toggleMute = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsMuted(!isMuted)
  }

  return {
    trailerKey,
    isMuted,
    isLoadingTrailer,
    fetchTrailer,
    toggleMute,
  }
}
