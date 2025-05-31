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
import { useEffect, useState } from "react"

interface SportsStream {
  id: string
  streamNo: number
  embedUrl: string
  hd: boolean
  language: string
}

interface SportsPlayerProps {
  streams: SportsStream[]
  title: string
}

export default function SportsPlayer({ streams, title }: SportsPlayerProps) {
  const [selectedStream, setSelectedStream] = useState<SportsStream | null>(
    null,
  )

  useEffect(() => {
    if (streams.length > 0 && !selectedStream) {
      setSelectedStream(streams[0])
    }
  }, [streams, selectedStream])

  const handleStreamChange = (streamId: string) => {
    const stream = streams.find((s) => s.id === streamId)
    if (stream) {
      setSelectedStream(stream)
    }
  }

  if (streams.length === 0) {
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
          <Select value={selectedStream.id} onValueChange={handleStreamChange}>
            <SelectTrigger className="w-48">
              <SelectValue>
                <div className="flex items-center gap-2">
                  <span>Stream {selectedStream.streamNo}</span>
                  {selectedStream.hd && (
                    <Badge variant="secondary" className="text-xs">
                      HD
                    </Badge>
                  )}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {streams.map((stream) => (
                <SelectItem key={stream.id} value={stream.id}>
                  <div className="flex items-center gap-2">
                    <span>Stream {stream.streamNo}</span>
                    {stream.hd && (
                      <Badge variant="secondary" className="text-xs">
                        HD
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
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
          src={selectedStream.embedUrl}
          className="absolute top-0 left-0 w-full h-full border-0 outline-none rounded-lg"
          allowFullScreen
          title={`${title} - Stream ${selectedStream.streamNo}`}
        />
      </div>
    </div>
  )
}
