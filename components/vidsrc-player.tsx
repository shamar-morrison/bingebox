"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVidlinkProgress } from "@/lib/hooks/use-vidlink-progress"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

interface SourceOption {
  name: string
  baseUrl: string
  query?: Record<string, any>
}

interface VidsrcPlayerProps {
  tmdbId: number
  mediaType: "movie" | "tv"
  seasonNumber?: number
  episodeNumber?: number
  title: string
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

  const sources: SourceOption[] = [
    {
      name: "VidLink",
      baseUrl: "https://vidlink.pro",
      query: { autoplay: "false" },
    },
    {
      name: "VidJoy",
      baseUrl: "https://vidjoy.pro/embed",
      query: { adFree: "true" },
    },
    {
      name: "VidZee",
      baseUrl: "https://player.vidzee.wtf/embed",
    },
    {
      name: "VidFast",
      baseUrl: "https://vidfast.pro",
      query: { autoplay: "false" },
    },
    {
      name: "Embed",
      baseUrl: "https://embed.su/embed",
    },
    { name: "VidSrcTo", baseUrl: "https://vidsrc.to/embed" },
    { name: "AutoEmbed", baseUrl: "https://player.autoembed.cc/embed" },
    {
      name: "VidSrcICU",
      baseUrl: "https://vidsrc.icu/embed",
    },
  ]

  const [selectedSource, setSelectedSource] = useState<SourceOption>(sources[0])

  useEffect(() => {
    const sourceParam = searchParams.get("source")

    if (sourceParam) {
      const sourceFromUrl = sources.find(
        (source) => source.name.toLowerCase() === sourceParam.toLowerCase(),
      )
      if (sourceFromUrl) {
        setSelectedSource(sourceFromUrl)
      }
    }
  }, [searchParams])

  const handleSourceChange = (source: SourceOption) => {
    setSelectedSource(source)

    const currentPath = window.location.pathname
    const newUrl = `${currentPath}?source=${source.name.toLowerCase()}`
    router.push(newUrl)
  }

  const handleSelectChange = (value: string) => {
    const source = sources.find(
      (source) => source.name.toLowerCase() === value.toLowerCase(),
    )
    if (source) {
      handleSourceChange(source)
    }
  }

  const getEmbedUrl = () => {
    const queryString = Object.entries(selectedSource.query || {})
      .map(([key, value]) => `${key}=${value}`)
      .join("&")
    const query = queryString ? `?${queryString}` : ""

    if (mediaType === "movie") {
      return `${selectedSource.baseUrl}/movie/${tmdbId}${query}`
    } else {
      return `${selectedSource.baseUrl}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}${query}`
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Source:</span>

        <div className="hidden md:flex gap-2">
          {sources.map((source) => (
            <button
              key={source.name}
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
          <Select
            value={selectedSource.name.toLowerCase()}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source) => (
                <SelectItem key={source.name} value={source.name.toLowerCase()}>
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
        <iframe
          src={getEmbedUrl()}
          className="absolute top-0 left-0 w-full h-full border-0 outline-none rounded-lg"
          allowFullScreen
          title={`${title} - ${selectedSource.name}`}
        ></iframe>
      </div>
    </div>
  )
}
