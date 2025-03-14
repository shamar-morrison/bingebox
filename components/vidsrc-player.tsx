"use client"

import { useState } from "react"

interface SourceOption {
  name: string
  baseUrl: string
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
  const sources: SourceOption[] = [
    { name: "VidLink", baseUrl: "https://vidlink.pro" },
    { name: "Embed", baseUrl: "https://embed.su/embed" },
    { name: "VidSrc", baseUrl: "https://vidsrc.to/embed" },
  ]

  const [selectedSource, setSelectedSource] = useState<SourceOption>(sources[0])

  const getEmbedUrl = () => {
    // VidLink autoplays by default so the player start muted, this prevents that
    if (mediaType === "movie" && selectedSource.name === "VidLink") {
      return `${selectedSource.baseUrl}/movie/${tmdbId}?autoplay=false`
    } else if (mediaType === "tv" && selectedSource.name === "VidLink") {
      return `${selectedSource.baseUrl}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}?autoplay=false`
    }

    if (mediaType === "movie") {
      return `${selectedSource.baseUrl}/movie/${tmdbId}`
    } else {
      return `${selectedSource.baseUrl}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Source:</span>
        <div className="flex gap-2">
          {sources.map((source) => (
            <button
              key={source.name}
              onClick={() => setSelectedSource(source)}
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
      </div>

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
