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

    return NextResponse.json({ movie })
  } catch (error) {
    console.error("Error fetching from YTS API:", error)
    return NextResponse.json(
      { error: "Failed to fetch movie data" },
      { status: 500 },
    )
  }
}
