import { searchMulti } from "@/lib/tmdb"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query")
  const limit = Number(searchParams.get("limit") || "5")

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    )
  }

  try {
    const searchResults = await searchMulti(query)

    // Filter and limit results
    const results = searchResults.results
      .filter(
        (item) =>
          item.media_type === "movie" ||
          item.media_type === "tv" ||
          item.media_type === "person",
      )
      .slice(0, limit)

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json({ error: "Failed to search" }, { status: 500 })
  }
}
