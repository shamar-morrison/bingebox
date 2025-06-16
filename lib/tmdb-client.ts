"use client"

interface Trailer {
  key: string
  name: string
  type: string
}

// Client-side TMDB functions for use in client components
export async function getTrailers(
  mediaType: string,
  mediaId: number,
): Promise<Trailer[]> {
  try {
    const response = await fetch(
      `/api/trailer?mediaType=${mediaType}&mediaId=${mediaId}`,
    )

    if (!response.ok) {
      throw new Error("Failed to fetch trailers")
    }

    const data = await response.json()

    if (!data.trailers || data.trailers.length === 0) {
      throw new Error("No trailers available")
    }

    return data.trailers
  } catch (error) {
    console.error("Error fetching trailers:", error)
    throw error
  }
}

// Legacy function for backward compatibility
export async function getTrailerKey(
  mediaType: string,
  mediaId: number,
): Promise<string> {
  const trailers = await getTrailers(mediaType, mediaId)
  return trailers[0].key
}
