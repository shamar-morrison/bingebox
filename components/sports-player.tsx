"use client"

import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe } from "lucide-react"
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

  const handleStreamChange = useCallback((streamKey: string) => {
    setSelectedKey(streamKey)
  }, [])

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
        <iframe
          key={selectedStream.uniqueKey}
          src={selectedStream.embedUrl}
          className="absolute top-0 left-0 w-full h-full border-0 outline-none rounded-lg"
          allowFullScreen
          title={`${title} - Stream ${selectedStream.streamNo}`}
        />
      </div>
    </div>
  )
}

export default memo(SportsPlayer)
