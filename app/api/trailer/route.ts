import { NextResponse } from "next/server"
import { fetchVideos } from "@/lib/tmdb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mediaType = searchParams.get("mediaType")
  const mediaId = searchParams.get("mediaId")

  if (!mediaType || !mediaId) {
    return NextResponse.json({ error: "Missing mediaType or mediaId" }, { status: 400 })
  }

  try {
    const videos = await fetchVideos(mediaType, Number.parseInt(mediaId))

    // Find the first trailer or teaser from YouTube
    const trailer = videos.results.find(
      (video) => video.site === "YouTube" && (video.type === "Trailer" || video.type === "Teaser"),
    )

    if (!trailer) {
      return NextResponse.json({ error: "No trailer found" }, { status: 404 })
    }

    return NextResponse.json({ key: trailer.key })
  } catch (error) {
    console.error("Error fetching trailer:", error)
    return NextResponse.json({ error: "Failed to fetch trailer" }, { status: 500 })
  }
}

