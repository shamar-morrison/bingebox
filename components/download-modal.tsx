"use client"

import { Download, Loader2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DownloadResponseVidZee } from "@/lib/download-types"

interface DownloadModalProps {
  mediaType: "movie" | "tv"
  tmdbId: number
  title: string
  seasons?: Array<{
    season_number: number
    episode_count: number
    name: string
  }>
}

export default function DownloadModal({
  mediaType,
  tmdbId,
  title,
  seasons = [],
}: DownloadModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [downloadData, setDownloadData] =
    useState<DownloadResponseVidZee | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [selectedEpisode, setSelectedEpisode] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())

  const selectedSeasonData = seasons.find(
    (season) => season.season_number.toString() === selectedSeason,
  )

  const fetchDownloadLinks = async () => {
    setIsLoading(true)
    setError(null)
    setDownloadData(null)

    try {
      let url: string
      if (mediaType === "movie") {
        url = `/api/download?mediaType=movie&tmdbId=${tmdbId}`
      } else {
        if (!selectedSeason || !selectedEpisode) {
          setError("Please select both season and episode")
          setIsLoading(false)
          return
        }
        url = `/api/download?mediaType=tv&tmdbId=${tmdbId}&season=${selectedSeason}&episode=${selectedEpisode}`
      }

      const response = await fetch(url)
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Unknown error" }))
        throw new Error(
          errorData.error ||
            `Failed to fetch download links: ${response.statusText}`,
        )
      }

      const data: DownloadResponseVidZee = await response.json()
      setDownloadData(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch download links",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && mediaType === "movie") {
      fetchDownloadLinks()
    } else if (!open) {
      setDownloadData(null)
      setError(null)
      setSelectedSeason("")
      setSelectedEpisode("")
      setDownloadingIds(new Set())
    }
  }

  const handleDownloadClick = (downloadId: string, downloadUrl: string) => {
    setDownloadingIds((prev) => new Set(prev).add(downloadId))

    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = ""
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Reset the downloading state after 3 seconds
    setTimeout(() => {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(downloadId)
        return newSet
      })
    }, 3000)
  }

  const formatFileSize = (sizeStr: string) => {
    if (!sizeStr) return "Unknown size"

    const bytes = parseInt(sizeStr, 10)
    if (isNaN(bytes)) return "Unknown size"

    const sizes = ["B", "KB", "MB", "GB", "TB"]
    if (bytes === 0) return "0 B"

    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = bytes / Math.pow(1024, i)

    return `${size.toFixed(1)} ${sizes[i]}`
  }

  const getQualityBadgeColor = (resolution: number) => {
    if (resolution >= 1080) return "bg-green-600"
    if (resolution >= 720) return "bg-blue-600"
    return "bg-gray-600"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download {title}</DialogTitle>
          <DialogDescription>
            {mediaType === "movie"
              ? "Choose from available download links below"
              : "Select a season and episode to fetch download links"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {mediaType === "tv" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Season</label>
                <Select
                  value={selectedSeason}
                  onValueChange={setSelectedSeason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select season" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasons.map((season) => (
                      <SelectItem
                        key={season.season_number}
                        value={season.season_number.toString()}
                      >
                        {season.name} ({season.episode_count} episodes)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Episode
                </label>
                <Select
                  value={selectedEpisode}
                  onValueChange={setSelectedEpisode}
                  disabled={!selectedSeason}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select episode" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedSeasonData &&
                      Array.from(
                        { length: selectedSeasonData.episode_count },
                        (_, i) => i + 1,
                      ).map((episodeNum) => (
                        <SelectItem
                          key={episodeNum}
                          value={episodeNum.toString()}
                        >
                          Episode {episodeNum}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {mediaType === "tv" && (
            <Button
              onClick={fetchDownloadLinks}
              disabled={isLoading || !selectedSeason || !selectedEpisode}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Fetching Download Links...
                </>
              ) : (
                "Fetch Download Links"
              )}
            </Button>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {isLoading && mediaType === "movie" && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Fetching download links...</span>
            </div>
          )}

          {downloadData && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Available Downloads</h3>
                <span className="text-sm text-muted-foreground">
                  {downloadData.data.downloads.length} links found
                </span>
              </div>

              {downloadData.data.downloads.length === 0 ? (
                <div className="p-8 text-center border rounded-lg">
                  <p className="text-muted-foreground">
                    No download links available for this content.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {downloadData.data.downloads.map((download, index) => {
                    const downloadId = download.id || `download-${index}`
                    const isDownloading = downloadingIds.has(downloadId)

                    return (
                      <div
                        key={downloadId}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`px-2 py-1 rounded text-xs font-medium text-white ${getQualityBadgeColor(
                              download.resolution,
                            )}`}
                          >
                            {download.resolution}p
                          </div>
                          <div>
                            <p className="font-medium">
                              {download.resolution}p Quality
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Size: {formatFileSize(download.size)}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="shrink-0"
                          disabled={isDownloading}
                          onClick={() =>
                            handleDownloadClick(downloadId, download.url)
                          }
                        >
                          {isDownloading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Downloading...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              Download
                            </>
                          )}
                        </Button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
