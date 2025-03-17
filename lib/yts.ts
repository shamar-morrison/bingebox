// YTS API implementation for movie torrents
// https://yts.mx/api

export interface YTSTorrent {
  url: string
  hash: string
  quality: string
  type: string
  is_repack: string
  video_codec: string
  bit_depth: string
  audio_channels: string
  seeds: number
  peers: number
  size: string
  size_bytes: number
  date_uploaded: string
  date_uploaded_unix: number
}

export interface YTSMovie {
  id: number
  url: string
  imdb_code: string
  title: string
  title_english: string
  title_long: string
  slug: string
  year: number
  rating: number
  runtime: number
  genres: string[]
  summary: string
  description_full: string
  synopsis: string
  yt_trailer_code: string
  language: string
  mpa_rating: string
  background_image: string
  background_image_original: string
  small_cover_image: string
  medium_cover_image: string
  large_cover_image: string
  state: string
  torrents: YTSTorrent[]
  date_uploaded: string
  date_uploaded_unix: number
}

export interface YTSResponse {
  status: string
  status_message: string
  data: {
    movie_count?: number
    limit?: number
    page_number?: number
    movies?: YTSMovie[]
    movie?: YTSMovie
  }
  "@meta"?: {
    server_time: number
    server_timezone: string
    api_version: number
    execution_time: string
  }
}

const YTS_API_URL = "https://yts.mx/api/v2"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries = 3,
  initialDelay = 1000,
): Promise<Response> {
  let retries = 0
  let lastError: Error | null = null

  while (retries < maxRetries) {
    try {
      const response = await fetch(url, {
        ...options,
        // Increase timeout for potentially slow responses
        signal: AbortSignal.timeout(10000),
      })

      if (response.ok) {
        return response
      }

      if (response.status >= 500 && response.status < 600) {
        lastError = new Error(`HTTP error ${response.status}`)

        // If it's specifically a 502, we know the YTS API is having issues
        if (response.status === 502) {
          console.warn(
            `YTS API returned 502 Bad Gateway. Retrying (${retries + 1}/${maxRetries})...`,
          )
        }
      } else {
        // For other error codes, don't retry
        return response
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
    }

    // Exponential backoff
    const backoffTime = initialDelay * Math.pow(2, retries)
    await delay(backoffTime)
    retries++
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error("Failed after maximum retries")
}

export async function searchYTSMovieByIMDB(
  imdbId: string,
): Promise<YTSMovie | null> {
  try {
    const url = `${YTS_API_URL}/movie_details.json?imdb_id=${imdbId}`

    const response = await fetchWithRetry(
      url,
      { next: { revalidate: 3600 } },
      3, // Max 3 retries
      1000, // Start with 1s delay, then 2s, then 4s
    )

    if (!response.ok) {
      console.error(`Failed to fetch from YTS API: ${response.status}`)
      return null
    }

    const data: YTSResponse = await response.json()

    // Check if response is valid and has movie data
    if (data.status !== "ok" || !data.data.movie) {
      console.log(`No movie found on YTS for IMDB ID: ${imdbId}`)
      return null
    }

    const movie = data.data.movie

    // Check if this is a valid movie with meaningful data
    // If title is empty or rating is 0, it might be a placeholder entry
    if (!movie.title || movie.title.trim() === "" || !movie.year) {
      console.log(`Found empty movie data for IMDB ID: ${imdbId}`)
      return null
    }

    // Ensure torrents is an array
    if (!movie.torrents || !Array.isArray(movie.torrents)) {
      console.warn(`Movie found but no torrents array for IMDB ID: ${imdbId}`)
      movie.torrents = []
    }

    return movie
  } catch (error) {
    console.error(`Error fetching from YTS API:`, error)
    return null
  }
}

/**
 * Searches for a movie on YTS by IMDB ID and validates against the expected title
 */
export async function searchYTSMovieByIMDBAndTitle(
  imdbId: string,
  expectedTitle: string,
): Promise<YTSMovie | null> {
  const movie = await searchYTSMovieByIMDB(imdbId)

  if (!movie) {
    return null
  }

  // If no title provided for validation, just return the movie
  if (!expectedTitle || expectedTitle.trim() === "") {
    return movie
  }

  // Normalize titles for comparison
  const normalizeTitle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  const movieTitle = movie.title_english || movie.title || ""
  const normalizedMovie = normalizeTitle(movieTitle)
  const normalizedExpected = normalizeTitle(expectedTitle)

  if (normalizedMovie === normalizedExpected) {
    return movie
  }

  // If one contains the other, it might be a partial match
  if (
    normalizedMovie.includes(normalizedExpected) ||
    normalizedExpected.includes(normalizedMovie)
  ) {
    return movie
  }

  // Titles are too different, this is likely not the correct movie
  console.warn(
    `Title mismatch: YTS returned "${movieTitle}" but we expected "${expectedTitle}"`,
  )
  return null
}

/**
 * Format file size to human-readable form
 * Converts from bytes to appropriate unit (KB, MB, GB)
 */
export function formatFileSize(sizeInBytes: number): string {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`
  } else if (sizeInBytes < 1024 * 1024) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`
  } else if (sizeInBytes < 1024 * 1024 * 1024) {
    return `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
  } else {
    return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
}
