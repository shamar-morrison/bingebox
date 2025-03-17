import { searchYTSMovieByIMDBAndTitle } from "@/lib/yts"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imdbId = searchParams.get("imdbId")
  const requestedTitle = searchParams.get("title")

  if (!imdbId) {
    return NextResponse.json({ error: "IMDB ID is required" }, { status: 400 })
  }

  try {
    const movie = await searchYTSMovieByIMDBAndTitle(
      imdbId,
      requestedTitle || "",
    )

    if (!movie) {
      // Add a Cache-Control header to prevent caching of 404 responses
      const response = NextResponse.json(
        { message: "Movie not found on YTS or title mismatch" },
        { status: 404 },
      )

      response.headers.set("Cache-Control", "no-store, max-age=0")

      return response
    }

    const response = NextResponse.json({ movie })

    // Set shorter cache times for now until we confirm this is working correctly
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=14400, stale-while-revalidate=3600, max-age=3600",
    )

    // Add a unique cache key based on the IMDB ID - since we're using an exact endpoint
    // we can be confident that the IMDB ID alone is sufficient for cache identification
    response.headers.set("X-Cache-Key", `yts-movie-${imdbId}`)

    return response
  } catch (error) {
    console.error("Error fetching from YTS API:", error)
    const response = NextResponse.json(
      { error: "Failed to fetch movie data" },
      { status: 500 },
    )

    // Don't cache errors
    response.headers.set("Cache-Control", "no-store, max-age=0")

    return response
  }
}
