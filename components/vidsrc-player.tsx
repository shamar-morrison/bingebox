"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useVidlinkProgress } from "@/lib/hooks/use-vidlink-progress"
import { Loader2, Wifi, WifiOff } from "lucide-react"
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
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [iframeSrc, setIframeSrc] = useState("")

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
    setIsLoading(true)
    setLoadError(false)

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

  // Update iframe src when source changes
  useEffect(() => {
    const newSrc = getEmbedUrl()
    setIframeSrc(newSrc)
    setIsLoading(true)
    setLoadError(false)
  }, [selectedSource, tmdbId, mediaType, seasonNumber, episodeNumber])

  const handleIframeLoad = () => {
    setIsLoading(false)
    setLoadError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setLoadError(true)
  }

  const retryLoad = () => {
    setIsLoading(true)
    setLoadError(false)
    // Force iframe reload by updating the src
    const currentSrc = iframeSrc
    setIframeSrc("")
    setTimeout(() => setIframeSrc(currentSrc), 100)
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
              {selectedSource.name === source.name && isLoading ? (
                <div className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>{source.name}</span>
                </div>
              ) : (
                source.name
              )}
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
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/90 rounded-lg flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
              <div className="text-white">
                <p className="text-sm font-medium">
                  Loading {selectedSource.name}...
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  This may take a few moments
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {loadError && (
          <div className="absolute inset-0 bg-black/90 rounded-lg flex items-center justify-center z-10">
            <div className="text-center space-y-4 p-6">
              <WifiOff className="w-8 h-8 text-red-400 mx-auto" />
              <div className="text-white">
                <p className="text-sm font-medium">
                  Failed to load {selectedSource.name}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  The source might be unavailable or your connection is slow
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={retryLoad}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Wifi className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        )}

        {iframeSrc && (
          <iframe
            src={iframeSrc}
            className="absolute top-0 left-0 w-full h-full border-0 outline-none rounded-lg"
            allowFullScreen
            title={`${title} - ${selectedSource.name}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>
    </div>
  )
}
