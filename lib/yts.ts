import { YTSListMoviesResponse, YTSMovieDetailsResponse } from "./yts-types"

export async function fetchMovies(
  options: {
    page?: number
    limit?: number
    query?: string
    quality?: string
    minimum_rating?: number
    genre?: string
    sort_by?: string
    order_by?: string
  } = {},
): Promise<YTSListMoviesResponse> {
  const {
    page = 1,
    limit = 20,
    query,
    quality,
    minimum_rating,
    genre,
    sort_by = "date_added",
    order_by = "desc",
  } = options

  const params = new URLSearchParams({
    endpoint: "list_movies",
    page: page.toString(),
    limit: limit.toString(),
    sort_by,
    order_by,
  })

  if (query) params.append("query_term", query)
  if (quality) params.append("quality", quality)
  if (minimum_rating) params.append("minimum_rating", minimum_rating.toString())
  if (genre) params.append("genre", genre)

  // Use server-side proxy to avoid CORS
  const url = `/api/yts?${params.toString()}`

  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error("Failed to fetch movies from YTS API")
  }

  return response.json()
}

export async function fetchMovieDetails(
  movieId: number,
): Promise<YTSMovieDetailsResponse> {
  // Use server-side proxy to avoid CORS
  const url = `/api/yts?endpoint=movie_details&movie_id=${movieId}`

  const response = await fetch(url, { cache: "no-store" })

  if (!response.ok) {
    throw new Error("Failed to fetch movie details from YTS API")
  }

  return response.json()
}

export function createMagnetLink(torrent: {
  hash: string
  title?: string
  url?: string
  quality?: string
}): string {
  const { hash, title = "", quality = "" } = torrent

  // Format: magnet:?xt=urn:btih:[hash]&dn=[name]&tr=[tracker]
  let magnetLink = `magnet:?xt=urn:btih:${hash}`

  // Add name if available
  if (title) {
    magnetLink += `&dn=${encodeURIComponent(title + (quality ? ` (${quality})` : ""))}`
  }

  // common trackers
  const trackers = [
    "udp://tracker.opentrackr.org:1337/announce",
    "udp://tracker.leechers-paradise.org:6969/announce",
    "udp://9.rarbg.to:2710/announce",
    "udp://p4p.arenabg.com:1337/announce",
    "udp://tracker.cyberia.is:6969/announce",
  ]

  trackers.forEach((tracker) => {
    magnetLink += `&tr=${encodeURIComponent(tracker)}`
  })

  return magnetLink
}
