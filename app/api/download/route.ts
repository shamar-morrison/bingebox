import type {
  MovieDownloadResponse,
  TVDownloadResponse,
} from "@/lib/download-types"
import { NextRequest, NextResponse } from "next/server"

interface CacheEntry {
  data: MovieDownloadResponse | TVDownloadResponse
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds

function getCacheKey(
  mediaType: string,
  tmdbId: string,
  season?: string,
  episode?: string,
): string {
  if (mediaType === "movie") {
    return `movie:${tmdbId}`
  }
  return `tv:${tmdbId}:${season}:${episode}`
}

function getCachedData(
  key: string,
): MovieDownloadResponse | TVDownloadResponse | null {
  const cached = cache.get(key)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > CACHE_DURATION) {
    cache.delete(key)
    return null
  }

  return cached.data
}

function setCachedData(
  key: string,
  data: MovieDownloadResponse | TVDownloadResponse,
): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const mediaType = searchParams.get("mediaType")
  const tmdbId = searchParams.get("tmdbId")
  const season = searchParams.get("season")
  const episode = searchParams.get("episode")

  if (!mediaType || !tmdbId) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    )
  }

  const cacheKey = getCacheKey(
    mediaType,
    tmdbId,
    season || undefined,
    episode || undefined,
  )

  // Check cache first
  const cachedData = getCachedData(cacheKey)
  if (cachedData) {
    return NextResponse.json(cachedData)
  }

  try {
    let apiUrl: string

    if (mediaType === "movie") {
      apiUrl = `https://dl.vidzee.wtf/download/movie/v1/${tmdbId}`
    } else if (mediaType === "tv") {
      if (!season || !episode) {
        return NextResponse.json(
          { error: "Season and episode are required for TV shows" },
          { status: 400 },
        )
      }
      apiUrl = `https://dl.vidzee.wtf/download/tv/v1/${tmdbId}/${season}/${episode}`
    } else {
      return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
    }

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data: MovieDownloadResponse | TVDownloadResponse =
      await response.json()

    // Cache the successful response
    setCachedData(cacheKey, data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching download links:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch download links",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
