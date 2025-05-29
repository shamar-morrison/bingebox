import { fetchTrending } from "@/lib/tmdb"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const trendingMedia = await fetchTrending()
    return NextResponse.json(trendingMedia)
  } catch (error) {
    console.error("Error fetching trending media in API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch trending media" },
      { status: 500 },
    )
  }
}
