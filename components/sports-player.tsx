"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe, Loader2, Wifi, WifiOff } from "lucide-react"
import { memo, useCallback, useEffect, useMemo, useState } from "react"

interface SportsStream {
  id: string
  streamNo: number
  embedUrl: string
  hd: boolean
  language: string
  source?: string
  uniqueKey?: string
  displayLabel?: string
}

interface SportsPlayerProps {
  streams: SportsStream[]
  title: string
}

function getLanguageCode(language: string): string {
  if (!language) return ""

  const languageMap: Record<string, string> = {
    english: "EN",
    spanish: "ES",
    español: "ES",
    french: "FR",
    français: "FR",
    german: "DE",
    deutsch: "DE",
    italian: "IT",
    italiano: "IT",
    portuguese: "PT",
    português: "PT",
    russian: "RU",
    русский: "RU",
    arabic: "AR",
    العربية: "AR",
    chinese: "ZH",
    中文: "ZH",
    japanese: "JA",
    日本語: "JA",
    korean: "KO",
    한국어: "KO",
    dutch: "NL",
    nederlands: "NL",
    polish: "PL",
    polski: "PL",
    turkish: "TR",
    türkçe: "TR",
    hindi: "HI",
    हिन्दी: "HI",
  }

  const normalized = language.toLowerCase().trim()
  return languageMap[normalized] || language.toUpperCase().slice(0, 2)
}

const StreamSelectItem = memo(
  ({ stream, uniqueKey }: { stream: SportsStream; uniqueKey: string }) => {
    return (
      <SelectItem value={uniqueKey}>
        <div className="flex items-center gap-1">
          <span>{stream.displayLabel}</span>
        </div>
      </SelectItem>
    )
  },
)

StreamSelectItem.displayName = "StreamSelectItem"

function SportsPlayer({ streams, title }: SportsPlayerProps) {
  const uniqueStreams = useMemo(() => {
    const labelCounts = new Map<string, number>()
    const labelIndexes = new Map<string, number>()

    // First pass: count how many times each label appears
    streams.forEach((stream) => {
      const langCode = getLanguageCode(stream.language)
      const baseLabel = `Stream ${stream.streamNo}${langCode ? ` (${langCode})` : ""}${stream.hd ? " HD" : ""}`
      labelCounts.set(baseLabel, (labelCounts.get(baseLabel) || 0) + 1)
    })

    // Second pass: create unique streams with display labels and counters
    return streams.map((stream, index) => {
      const langCode = getLanguageCode(stream.language)
      const baseLabel = `Stream ${stream.streamNo}${langCode ? ` (${langCode})` : ""}${stream.hd ? " HD" : ""}`
      const count = labelCounts.get(baseLabel) || 1

      let displayLabel = baseLabel
      if (count > 1) {
        const currentIndex = (labelIndexes.get(baseLabel) || 0) + 1
        labelIndexes.set(baseLabel, currentIndex)
        displayLabel = `${baseLabel} #${currentIndex}`
      }

      // Ensure unique key by combining id with index as fallback
      // This prevents multiple streams from having the same key if API returns duplicate/empty IDs
      const uniqueKey = stream.id && stream.id.trim() !== ""
        ? `${stream.id}-${index}`
        : `stream-${index}-${stream.source || "unknown"}-${stream.streamNo}`

      return {
        ...stream,
        uniqueKey,
        displayLabel,
      }
    })
  }, [streams])

  const [selectedKey, setSelectedKey] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [iframeSrc, setIframeSrc] = useState("")

  const selectedStream = useMemo(
    () =>
      uniqueStreams.find((s) => s.uniqueKey === selectedKey) ||
      uniqueStreams[0],
    [uniqueStreams, selectedKey],
  )

  useEffect(() => {
    if (
      uniqueStreams.length > 0 &&
      (!selectedKey || !uniqueStreams.find((s) => s.uniqueKey === selectedKey))
    ) {
      const firstKey = uniqueStreams[0]?.uniqueKey
      if (firstKey) {
        setSelectedKey(firstKey)
      }
    }
  }, [uniqueStreams, selectedKey])

  // Update iframe src when stream changes
  useEffect(() => {
    if (selectedStream) {
      setIframeSrc(selectedStream.embedUrl)
      setIsLoading(true)
      setLoadError(false)
    }
  }, [selectedStream])

  const handleStreamChange = useCallback((streamKey: string) => {
    setSelectedKey(streamKey)
    setIsLoading(true)
    setLoadError(false)
  }, [])

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

  const memoizedStreamItems = useMemo(
    () =>
      uniqueStreams.map((stream) => (
        <StreamSelectItem
          key={stream.uniqueKey}
          stream={stream}
          uniqueKey={stream.uniqueKey}
        />
      )),
    [uniqueStreams],
  )

  if (uniqueStreams.length === 0) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">No streams available</p>
      </div>
    )
  }

  if (!selectedStream) {
    return (
      <div className="w-full aspect-video bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Loading stream...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Stream:</span>
          <Select
            value={selectedStream.uniqueKey}
            onValueChange={handleStreamChange}
          >
            <SelectTrigger className="w-64">
              <SelectValue>
                <div className="flex items-center gap-1">
                  <span>{selectedStream.displayLabel}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {memoizedStreamItems}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Globe className="w-3 h-3" />
          <span>{selectedStream.language}</span>
          {selectedStream.hd && (
            <Badge variant="secondary" className="text-xs ml-2">
              HD
            </Badge>
          )}
        </div>
      </div>

      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/90 rounded-lg flex items-center justify-center z-10">
            <div className="text-center space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-white mx-auto" />
              <div className="text-white">
                <p className="text-sm font-medium">
                  Loading Stream {selectedStream.streamNo}...
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
                  Failed to load Stream {selectedStream.streamNo}
                </p>
                <p className="text-xs text-gray-300 mt-1">
                  The stream might be unavailable or your connection is slow
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
            key={selectedStream.uniqueKey}
            src={iframeSrc}
            className="absolute top-0 left-0 w-full h-full border-0 outline-none rounded-lg"
            allowFullScreen
            title={`${title} - Stream ${selectedStream.streamNo}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        )}
      </div>
    </div>
  )
}

export default SportsPlayer
