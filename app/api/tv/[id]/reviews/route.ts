import { fetchTVReviews } from "@/lib/tmdb"
import { NextResponse } from "next/server"

export async function GET(
  request: Request, // Keep request parameter even if unused for now
  { params }: { params: { id: string } },
) {
  const showId = Number.parseInt(params.id)

  if (isNaN(showId)) {
    return NextResponse.json({ error: "Invalid TV show ID" }, { status: 400 })
  }

  try {
    const reviews = await fetchTVReviews(showId)
    return NextResponse.json(reviews)
  } catch (error) {
    console.error(`Error fetching reviews for TV show ${showId}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch TV show reviews" },
      { status: 500 },
    )
  }
}
