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

  let url = `/api/yts?endpoint=list_movies&page=${page}&limit=${limit}`
  if (query) url += `&query_term=${encodeURIComponent(query)}`
  if (quality) url += `&quality=${quality}`
  if (minimum_rating) url += `&minimum_rating=${minimum_rating}`
  if (genre) url += `&genre=${encodeURIComponent(genre)}`
  url += `&sort_by=${sort_by}&order_by=${order_by}`

  // If there's a search query, don't use caching to ensure fresh results
  const fetchOptions: RequestInit = query
    ? { cache: "no-store" }
    : {
        next: { revalidate: 3600 },
        cache: "force-cache",
      }

  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    throw new Error("Failed to fetch movies from YTS API")
  }

  return response.json()
}

export async function fetchMovieDetails(
  movieId: number,
): Promise<YTSMovieDetailsResponse> {
  const url = `/api/yts?endpoint=movie_details&movie_id=${movieId}`

  const response = await fetch(url, {
    // Use Next.js cache techniques - revalidate every hour
    next: { revalidate: 3600 },
    // Use browser cache first, if available
    cache: "force-cache",
  })

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
