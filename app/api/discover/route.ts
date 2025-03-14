import { discoverMovies, discoverTV } from "@/lib/tmdb"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mediaType = searchParams.get("media_type") || "movie"

  // Remove media_type from the params to be passed to the TMDB API
  const params = Object.fromEntries(searchParams.entries())
  delete params.media_type

  try {
    const results =
      mediaType === "tv"
        ? await discoverTV(params)
        : await discoverMovies(params)

    return NextResponse.json(results)
  } catch (error) {
    console.error("Discover API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch discover results" },
      { status: 500 },
    )
  }
}
