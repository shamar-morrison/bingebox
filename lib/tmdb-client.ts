"use client"

// Client-side TMDB functions for use in client components
export async function getTrailerKey(mediaType: string, mediaId: number): Promise<string> {
  try {
    const response = await fetch(`/api/trailer?mediaType=${mediaType}&mediaId=${mediaId}`)

    if (!response.ok) {
      throw new Error("Failed to fetch trailer")
    }

    const data = await response.json()

    if (!data.key) {
      throw new Error("No trailer available")
    }

    return data.key
  } catch (error) {
    console.error("Error fetching trailer:", error)
    throw error
  }
}

