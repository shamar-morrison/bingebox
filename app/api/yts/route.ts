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

  let url = `https://yts.mx/api/v2/${endpoint}.json?`

  // Add query parameters based on endpoint
  if (endpoint === "list_movies") {
    if (query_term) url += `&query_term=${encodeURIComponent(query_term)}`
    url += `&page=${page}&limit=${limit}`
    if (quality) url += `&quality=${quality}`
    if (minimum_rating) url += `&minimum_rating=${minimum_rating}`
    if (genre) url += `&genre=${genre}`
    url += `&sort_by=${sort_by}&order_by=${order_by}`
  }

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YTS API responded with status: ${response.status}`)
    }

    const data = await response.json()

    // Always set Cache-Control to no-store to prevent caching
    // using caching causes search not to work when deployed to prod
    const headers: HeadersInit = {
      "Cache-Control": "no-store, max-age=0",
    }

    return NextResponse.json(data, { headers })
  } catch (error) {
    console.error("Error fetching from YTS API:", error)
    return NextResponse.json(
      { error: "Failed to fetch data from YTS API" },
      { status: 500 },
    )
  }
}
