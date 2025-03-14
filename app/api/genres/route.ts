import { fetchGenres } from "@/lib/tmdb"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mediaType = (searchParams.get("media_type") || "movie") as
    | "movie"
    | "tv"

  try {
    const genres = await fetchGenres(mediaType)
    return NextResponse.json(genres)
  } catch (error) {
    console.error("Genres API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch genres" },
      { status: 500 },
    )
  }
}
