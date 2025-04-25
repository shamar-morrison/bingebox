import { fetchMovieReviews } from "@/lib/tmdb"
import { NextResponse } from "next/server"

export async function GET(
  request: Request, // Keep request parameter even if unused for now
  { params }: { params: { id: string } },
) {
  const movieId = Number.parseInt(params.id)

  if (isNaN(movieId)) {
    return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 })
  }

  try {
    const reviews = await fetchMovieReviews(movieId)
    return NextResponse.json(reviews)
  } catch (error) {
    console.error(`Error fetching reviews for movie ${movieId}:`, error)
    return NextResponse.json(
      { error: "Failed to fetch movie reviews" },
      { status: 500 },
    )
  }
}
