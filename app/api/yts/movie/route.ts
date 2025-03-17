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
