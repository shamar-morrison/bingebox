import type {
  MovieDownloadLink,
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

function isValidHttpUrl(url: string): boolean {
  return typeof url === "string" && /^https?:\/\//i.test(url)
}

function isUnavailablePlaceholder(url: string): boolean {
  return /^(download link( is)? not available)$/i.test(String(url).trim())
}

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
    if (mediaType === "tv") {
      if (!season || !episode) {
        return NextResponse.json(
          { error: "Season and episode are required for TV shows" },
          { status: 400 },
        )
      }
      const apiUrl = `https://dl.vidzee.wtf/download/tv/v1/${tmdbId}/${season}/${episode}`
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

      const data: TVDownloadResponse = await response.json()
      // Ensure season and episode are populated from request params (external API may return empty values)
      const responseData: TVDownloadResponse = {
        ...data,
        season: data.season || season,
        episode: data.episode || episode,
      }
      setCachedData(cacheKey, responseData)
      return NextResponse.json(responseData)
    } else if (mediaType === "movie") {
      // Multi-source aggregation for movies
      const sources = [
        {
          id: "vidzee-v4",
          url: (id: string) => `https://dl.vidzee.wtf/download/movie/v4/${id}`,
          parse: async (res: Response): Promise<MovieDownloadLink[]> => {
            const json = await res.json().catch(() => null)
            if (!json || json.status !== "success") return []
            const links = Array.isArray(json.download_links)
              ? json.download_links
              : []
            return links
              .filter(
                (l: any) => l && typeof l.url === "string" && l.url.length > 0,
              )
              .map((l: any) => ({
                resolution: String(l.resolution ?? ""),
                url: String(l.url),
                text: String(l.text ?? ""),
                source: "vidzee-v4",
              }))
          },
        },
        {
          id: "vidzee-v3",
          url: (id: string) => `https://dl.vidzee.wtf/download/movie/v3/${id}`,
          parse: async (res: Response): Promise<MovieDownloadLink[]> => {
            const json = await res.json().catch(() => null)
            if (!json || json.status !== "success") return []
            const links = Array.isArray(json.download_links)
              ? json.download_links
              : []
            return links
              .filter(
                (l: any) => l && typeof l.url === "string" && l.url.length > 0,
              )
              .map((l: any) => ({
                resolution: String(l.resolution ?? ""),
                url: String(l.url),
                text: String(l.text ?? ""),
                source: "vidzee-v3",
              }))
          },
        },
        // Keep v1 as a soft fallback; if it returns a single link, add it as an option
        {
          id: "vidzee-v1",
          url: (id: string) => `https://dl.vidzee.wtf/download/movie/v1/${id}`,
          parse: async (res: Response): Promise<MovieDownloadLink[]> => {
            const json = await res.json().catch(() => null)
            // Try a few possible shapes defensively
            const possibleUrl =
              json?.downloadLink || json?.download_url || json?.url
            if (
              typeof possibleUrl === "string" &&
              possibleUrl.length > 0 &&
              !isUnavailablePlaceholder(possibleUrl) &&
              isValidHttpUrl(possibleUrl)
            ) {
              return [
                {
                  resolution: "page",
                  url: possibleUrl,
                  text: "Open download page (v1)",
                  source: "vidzee-v1",
                },
              ]
            }
            // If it matches the legacy VidZee shape with array downloads
            const maybeDownloads = json?.data?.downloads
            if (Array.isArray(maybeDownloads)) {
              return maybeDownloads
                .filter(
                  (d: any) =>
                    typeof d?.url === "string" &&
                    d.url.length > 0 &&
                    !isUnavailablePlaceholder(d.url) &&
                    isValidHttpUrl(d.url),
                )
                .map((d: any) => ({
                  resolution: String(d.resolution ?? ""),
                  url: String(d.url),
                  text: `Download ${String(d.size ?? "")} {${String(
                    d.resolution ?? "",
                  )}}`,
                  source: "vidzee-v1",
                }))
            }
            return []
          },
        },
      ]

      // Execute fetches in parallel
      const controller = new AbortController()
      const headers = {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      }

      const fetchPromises = sources.map(async (s) => {
        try {
          const res = await fetch(s.url(tmdbId), {
            method: "GET",
            headers,
            signal: controller.signal,
          })
          if (!res.ok) return [] as MovieDownloadLink[]
          return await s.parse(res)
        } catch {
          return [] as MovieDownloadLink[]
        }
      })

      const results = await Promise.all(fetchPromises)
      // Flatten, filter invalids, and de-duplicate by URL
      const allLinks = results
        .flat()
        .filter(
          (l) => isValidHttpUrl(l.url) && !isUnavailablePlaceholder(l.url),
        )
      const seen = new Set<string>()
      const deduped: MovieDownloadLink[] = []
      for (const link of allLinks) {
        if (!seen.has(link.url)) {
          seen.add(link.url)
          deduped.push(link)
        }
      }

      if (deduped.length === 0) {
        return NextResponse.json(
          {
            status: "error",
            tmdbId,
            downloadLinks: [],
            error: "No download links found",
          } satisfies MovieDownloadResponse,
          { status: 502 },
        )
      }

      const payload: MovieDownloadResponse = {
        status: "success",
        tmdbId,
        downloadLinks: deduped,
        error: null,
      }

      setCachedData(cacheKey, payload)
      return NextResponse.json(payload)
    } else {
      return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
    }
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
