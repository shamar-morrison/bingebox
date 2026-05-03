"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVidlinkProgress } from "@/lib/hooks/use-vidlink-progress"
import { cn } from "@/lib/utils"
import {
  DEFAULT_WATCH_SOURCE,
  EXACT_RESUME_SOURCE,
  VIDSRC_EMBED_COLOR,
} from "@/lib/watch-sources"
import { ChevronDown, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type SourceGroup = "vidsrc" | "legacy"

interface SourceOption {
  name: string
  slug: string
  group: SourceGroup
  featured: boolean
  supportsProgress: boolean
  supportsExactResume: boolean
  description: string
  legacySlugs?: string[]
  baseUrl: string
  urlFormat: "path" | "query" | "vidsrc-documented"
  vidsrcApi?: 1 | 2 | 3 | 4
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
    group: "legacy",
    featured: true,
    supportsProgress: true,
    supportsExactResume: true,
    description: "Legacy exact resume source",
    baseUrl: "https://vidlink.pro",
    urlFormat: "path",
    query: { autoplay: "false" },
  },
  {
    name: "VidSrc Premium",
    slug: "vidsrc-api4",
    group: "vidsrc",
    featured: true,
    supportsProgress: false,
    supportsExactResume: false,
    description: "API 4 Premium embeds",
    baseUrl: "https://www.vidsrc.wtf/api",
    urlFormat: "vidsrc-documented",
    vidsrcApi: 4,
  },
  {
    name: "VidSrc Multi Server",
    slug: "vidsrc-api1",
    group: "vidsrc",
    featured: true,
    supportsProgress: true,
    supportsExactResume: false,
    description: "API 1 with built-in server switching",
    baseUrl: "https://www.vidsrc.wtf/api",
    urlFormat: "vidsrc-documented",
    vidsrcApi: 1,
  },
  {
    name: "VidSrc Multi Language",
    slug: "vidsrc-api2",
    group: "vidsrc",
    featured: true,
    supportsProgress: true,
    supportsExactResume: false,
    description: "API 2 with language variants",
    baseUrl: "https://www.vidsrc.wtf/api",
    urlFormat: "vidsrc-documented",
    vidsrcApi: 2,
  },
  {
    name: "VidSrc Multi Embed",
    slug: "vidsrc-api3",
    group: "vidsrc",
    featured: true,
    supportsProgress: false,
    supportsExactResume: false,
    description: "API 3 with third-party embed choices",
    baseUrl: "https://www.vidsrc.wtf/api",
    urlFormat: "vidsrc-documented",
    vidsrcApi: 3,
  },
  {
    name: "VidZee",
    slug: "vidzee",
    group: "legacy",
    featured: false,
    supportsProgress: false,
    supportsExactResume: false,
    description: "Legacy direct embed provider",
    baseUrl: "https://player.vidzee.wtf/embed",
    urlFormat: "path",
  },
  {
    name: "VidFast",
    slug: "vidfast",
    group: "legacy",
    featured: false,
    supportsProgress: false,
    supportsExactResume: false,
    description: "Legacy fast embed provider",
    baseUrl: "https://vidfast.pro",
    urlFormat: "path",
    query: { autoplay: "false" },
  },
  {
    name: "RiverStream",
    slug: "rivestream",
    group: "legacy",
    featured: false,
    supportsProgress: false,
    supportsExactResume: false,
    description: "Legacy query-based source",
    legacySlugs: ["embed"],
    baseUrl: "https://rivestream.org/embed",
    urlFormat: "query",
  },
  {
    name: "VidSrcTo",
    slug: "vidsrcto",
    group: "legacy",
    featured: false,
    supportsProgress: false,
    supportsExactResume: false,
    description: "Legacy VidSrcTo mirror",
    baseUrl: "https://vidsrc.to/embed",
    urlFormat: "path",
  },
  {
    name: "AutoEmbed",
    slug: "autoembed",
    group: "legacy",
    featured: false,
    supportsProgress: false,
    supportsExactResume: false,
    description: "Legacy AutoEmbed player",
    baseUrl: "https://player.autoembed.cc/embed",
    urlFormat: "path",
  },
  {
    name: "VidSrcICU",
    slug: "vidsrcicu",
    group: "legacy",
    featured: false,
    supportsProgress: false,
    supportsExactResume: false,
    description: "Legacy VidSrcICU mirror",
    baseUrl: "https://vidsrc.icu/embed",
    urlFormat: "path",
  },
]

const DEFAULT_SOURCE =
  SOURCES.find((source) => source.slug === DEFAULT_WATCH_SOURCE) ?? SOURCES[0]
const FEATURED_SOURCES = SOURCES.filter((source) => source.featured)
const LEGACY_SOURCES = SOURCES.filter(
  (source) => source.group === "legacy" && !source.featured,
)

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
  const [selectedSource, setSelectedSource] =
    useState<SourceOption>(DEFAULT_SOURCE)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sourceFromUrl = findSource(searchParams.get("source"))
    setIsLoading(true)
    setSelectedSource(sourceFromUrl ?? DEFAULT_SOURCE)
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
    const queryParams = new URLSearchParams()

    if (selectedSource.query) {
      Object.entries(selectedSource.query).forEach(([key, value]) => {
        queryParams.set(key, String(value))
      })
    }

    const startAt = searchParams.get("startAt")
    if (selectedSource.supportsExactResume && startAt) {
      queryParams.set("startAt", startAt)
    }

    if (selectedSource.urlFormat === "vidsrc-documented") {
      queryParams.set("id", String(tmdbId))
      queryParams.set("color", VIDSRC_EMBED_COLOR)

      if (mediaType === "tv") {
        queryParams.set("s", String(seasonNumber))
        queryParams.set("e", String(episodeNumber))
      }

      const mediaPath = mediaType === "movie" ? "movie" : "tv"

      return `${selectedSource.baseUrl}/${selectedSource.vidsrcApi}/${mediaPath}/?${queryParams.toString()}`
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

  const moreSourcesLabel =
    selectedSource.group === "legacy" && !selectedSource.featured
      ? selectedSource.name
      : "More Sources"

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-xl border border-border/60 bg-card/40 p-3">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                Streaming Source
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedSource.name}
                </span>
                <span className="rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {selectedSource.description}
                </span>
              </div>
            </div>

            <div className="md:hidden">
              <Select
                value={selectedSource.slug}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Primary Sources</SelectLabel>
                    {FEATURED_SOURCES.map((source) => (
                      <SelectItem key={source.slug} value={source.slug}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectSeparator />
                  <SelectGroup>
                    <SelectLabel>Legacy Sources</SelectLabel>
                    {LEGACY_SOURCES.map((source) => (
                      <SelectItem key={source.slug} value={source.slug}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-2">
            {FEATURED_SOURCES.map((source) => (
              <button
                key={source.slug}
                type="button"
                onClick={() => handleSourceChange(source)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  selectedSource.slug === source.slug
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary/70 text-foreground hover:bg-secondary",
                )}
              >
                {source.name}
              </button>
            ))}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                    selectedSource.group === "legacy"
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/70 bg-background/70 text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  {moreSourcesLabel}
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Legacy Sources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={
                    selectedSource.group === "legacy"
                      ? selectedSource.slug
                      : undefined
                  }
                  onValueChange={handleSelectChange}
                >
                  {LEGACY_SOURCES.map((source) => (
                    <DropdownMenuRadioItem
                      key={source.slug}
                      value={source.slug}
                      className="flex flex-col items-start gap-0.5"
                    >
                      <span>{source.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {source.description}
                      </span>
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {selectedSource.supportsProgress && (
            <p className="text-xs text-muted-foreground">
              {selectedSource.slug === EXACT_RESUME_SOURCE
                ? "This source updates continue watching and supports exact resume links."
                : "This source updates your continue-watching progress."}
            </p>
          )}
        </div>
      </div>

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
