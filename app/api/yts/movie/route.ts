import { searchYTSMovieByIMDB } from "@/lib/yts"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const imdbId = searchParams.get("imdbId")

  if (!imdbId) {
    return NextResponse.json({ error: "IMDB ID is required" }, { status: 400 })
  }

  try {
    const movie = await searchYTSMovieByIMDB(imdbId)

    if (!movie) {
      return NextResponse.json(
        { message: "Movie not found on YTS" },
        { status: 404 },
      )
    }

    // Double-check that the returned movie matches the requested IMDB ID
    // This provides a second layer of verification beyond what's in the searchYTSMovieByIMDB function
    if (movie.imdb_code !== imdbId) {
      console.error(
        `IMDB ID mismatch: requested ${imdbId}, but got ${movie.imdb_code} (${movie.title})`,
      )
      return NextResponse.json(
        { error: "Retrieved movie doesn't match requested IMDB ID" },
        { status: 500 },
      )
    }

    const response = NextResponse.json({ movie })

    // Cache successful responses for 2 hours on client and 12 hours on CDN
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=43200, stale-while-revalidate=7200, max-age=7200",
    )

    return response
  } catch (error) {
    console.error("Error fetching from YTS API:", error)
    return NextResponse.json(
      { error: "Failed to fetch movie data" },
      { status: 500 },
    )
  }
}
