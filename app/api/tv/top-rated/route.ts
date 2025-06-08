import { fetchTopRatedShows } from "@/lib/tmdb"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)

    if (page < 1 || page > 1000) {
      return NextResponse.json(
        { error: "Page must be between 1 and 1000" },
        { status: 400 },
      )
    }

    const data = await fetchTopRatedShows(page)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Failed to fetch top-rated TV shows:", error)
    return NextResponse.json(
      { error: "Failed to fetch top-rated TV shows" },
      { status: 500 },
    )
  }
}
