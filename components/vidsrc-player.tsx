"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVidlinkProgress } from "@/lib/hooks/use-vidlink-progress"
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface SourceOption {
  name: string
  slug: string
  legacySlugs?: string[]
  baseUrl: string
  urlFormat: "path" | "query"
  query?: Record<string, string | number | boolean>
}

interface VidsrcPlayerProps {
  tmdbId: number
  mediaType: "movie" | "tv"
  seasonNumber?: number
  episodeNumber?: number
  title: string
}

const SOURCES: SourceOption[] = [
  {
    name: "VidLink",
    slug: "vidlink",
    baseUrl: "https://vidlink.pro",
    urlFormat: "path",
    query: { autoplay: "false" },
  },
  {
    name: "VidZee",
    slug: "vidzee",
    baseUrl: "https://player.vidzee.wtf/embed",
    urlFormat: "path",
  },
  {
    name: "VidFast",
    slug: "vidfast",
    baseUrl: "https://vidfast.pro",
    urlFormat: "path",
    query: { autoplay: "false" },
  },
  {
    name: "RiverStream",
    slug: "rivestream",
    legacySlugs: ["embed"],
    baseUrl: "https://rivestream.org/embed/agg",
    urlFormat: "query",
  },
  {
    name: "VidSrcTo",
    slug: "vidsrcto",
    baseUrl: "https://vidsrc.to/embed",
    urlFormat: "path",
  },
  {
    name: "AutoEmbed",
    slug: "autoembed",
    baseUrl: "https://player.autoembed.cc/embed",
    urlFormat: "path",
  },
  {
    name: "VidSrcICU",
    slug: "vidsrcicu",
    baseUrl: "https://vidsrc.icu/embed",
    urlFormat: "path",
  },
]

function findSource(value: string | null) {
  if (!value) {
    return null
  }

  const normalizedValue = value.toLowerCase()

  return (
    SOURCES.find(
      (source) =>
        source.slug === normalizedValue ||
        source.legacySlugs?.includes(normalizedValue),
    ) ?? null
  )
}

export default function VidsrcPlayer({
  tmdbId,
  mediaType,
  seasonNumber,
  episodeNumber,
  title,
}: VidsrcPlayerProps) {
  useVidlinkProgress()

  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedSource, setSelectedSource] = useState<SourceOption>(SOURCES[0])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sourceFromUrl = findSource(searchParams.get("source"))
    setSelectedSource(sourceFromUrl ?? SOURCES[0])
  }, [searchParams])

  const handleSourceChange = (source: SourceOption) => {
    setIsLoading(true)
    setSelectedSource(source)

    const currentPath = window.location.pathname
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.set("source", source.slug)
    const query = nextParams.toString()
    const newUrl = query ? `${currentPath}?${query}` : currentPath
    router.push(newUrl)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
  }

  const handleSelectChange = (value: string) => {
    const source = findSource(value)
    if (source) {
      handleSourceChange(source)
    }
  }

  const getEmbedUrl = () => {
    // Build query parameters from the source's default query options
    const queryParams = new URLSearchParams()

    // Add source-specific query parameters
    if (selectedSource.query) {
      Object.entries(selectedSource.query).forEach(([key, value]) => {
        queryParams.set(key, String(value))
      })
    }

    // Add startAt parameter for VidLink if present in URL
    // VidLink supports startAt=<seconds> to resume playback from a specific position
    const startAt = searchParams.get("startAt")
    if (selectedSource.slug === "vidlink" && startAt) {
      queryParams.set("startAt", startAt)
    }

    if (selectedSource.urlFormat === "query") {
      queryParams.set("type", mediaType)
      queryParams.set("id", String(tmdbId))

      if (mediaType === "tv") {
        queryParams.set("season", String(seasonNumber))
        queryParams.set("episode", String(episodeNumber))
      }

      return `${selectedSource.baseUrl}?${queryParams.toString()}`
    }

    const query = queryParams.toString() ? `?${queryParams.toString()}` : ""

    if (mediaType === "movie") {
      return `${selectedSource.baseUrl}/movie/${tmdbId}${query}`
    }

    return `${selectedSource.baseUrl}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}${query}`
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Source:</span>

        <div className="hidden md:flex gap-2">
          {SOURCES.map((source) => (
            <button
              key={source.slug}
              onClick={() => handleSourceChange(source)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedSource.name === source.name
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              }`}
            >
              {source.name}
            </button>
          ))}
        </div>

        <div className="md:hidden flex-1">
          <Select value={selectedSource.slug} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {SOURCES.map((source) => (
                <SelectItem key={source.slug} value={source.slug}>
                  {source.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedSource.name === "VidLink" && (
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Your watch progress is being recorded.
          </p>
        </div>
      )}

      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-3 text-sm text-muted-foreground">
              Loading source...
            </p>
          </div>
        )}
        <iframe
          src={getEmbedUrl()}
          className="absolute top-0 left-0 w-full h-full border-0 outline-none rounded-lg"
          allowFullScreen
          title={`${title} - ${selectedSource.name}`}
          onLoad={handleIframeLoad}
        ></iframe>
      </div>
    </div>
  )
}
