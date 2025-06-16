import { fetchVideos } from "@/lib/tmdb"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mediaType = searchParams.get("mediaType")
  const mediaId = searchParams.get("mediaId")

  if (!mediaType || !mediaId) {
    return NextResponse.json(
      { error: "Missing mediaType or mediaId" },
      { status: 400 },
    )
  }

  try {
    const videos = await fetchVideos(mediaType, Number.parseInt(mediaId))

    // Filter all trailers and teasers from YouTube
    const trailers = videos.results.filter(
      (video) =>
        video.site === "YouTube" &&
        (video.type === "Trailer" || video.type === "Teaser"),
    )

    if (trailers.length === 0) {
      return NextResponse.json({ error: "No trailers found" }, { status: 404 })
    }

    // Sort trailers: Trailers first, then Teasers, then by name
    const sortedTrailers = trailers.sort((a, b) => {
      if (a.type === "Trailer" && b.type === "Teaser") return -1
      if (a.type === "Teaser" && b.type === "Trailer") return 1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      trailers: sortedTrailers.map((trailer) => ({
        key: trailer.key,
        name: trailer.name,
        type: trailer.type,
      })),
    })
  } catch (error) {
    console.error("Error fetching trailers:", error)
    return NextResponse.json(
      { error: "Failed to fetch trailers" },
      { status: 500 },
    )
  }
}
