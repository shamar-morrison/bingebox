import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const endpoint = searchParams.get("endpoint") || "list_movies"
  const query_term = searchParams.get("query_term") || ""
  const page = searchParams.get("page") || "1"
  const limit = searchParams.get("limit") || "20"
  const quality = searchParams.get("quality") || ""
  const minimum_rating = searchParams.get("minimum_rating") || ""
  const genre = searchParams.get("genre") || ""
  const sort_by = searchParams.get("sort_by") || "date_added"
  const order_by = searchParams.get("order_by") || "desc"
  const movie_id = searchParams.get("movie_id") || ""

  const params = new URLSearchParams()

  if (endpoint === "list_movies") {
    if (query_term) params.append("query_term", query_term)
    params.append("page", page)
    params.append("limit", limit)
    if (quality) params.append("quality", quality)
    if (minimum_rating) params.append("minimum_rating", minimum_rating)
    if (genre) params.append("genre", genre)
    params.append("sort_by", sort_by)
    params.append("order_by", order_by)
  } else if (endpoint === "movie_details") {
    if (movie_id) params.append("movie_id", movie_id)
  }

  // Use CORS proxy to bypass Cloudflare protection
  // The proxy service handles Cloudflare challenges and adds CORS headers
  const ytsUrl = `https://yts.lt/api/v2/${endpoint}.json?${params.toString()}`
  const corsProxy = "https://api.allorigins.win/raw?url="
  const _url = `${corsProxy}${encodeURIComponent(ytsUrl)}`

  try {
    const response = await fetch(ytsUrl, {
      signal: AbortSignal.timeout(30000), // 30 second timeout (proxy may be slower)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("Error fetching data from YTS API:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch data from YTS API",
        details: "YTS API may be down or unreachable.",
      },
      { status: 500 },
    )
  }
}
