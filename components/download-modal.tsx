"use client"

import { Download, ExternalLink, Loader2 } from "lucide-react"
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
import type {
  MovieDownloadResponse,
  TVDownloadResponse,
} from "@/lib/download-types"

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
  const [downloadData, setDownloadData] = useState<
    MovieDownloadResponse | TVDownloadResponse | null
  >(null)
  const [selectedSeason, setSelectedSeason] = useState<string>("")
  const [selectedEpisode, setSelectedEpisode] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

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

      const data: MovieDownloadResponse | TVDownloadResponse =
        await response.json()
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
    }
  }

  const handleDownloadClick = (downloadUrl: string) => {
    window.open(downloadUrl, "_blank", "noopener,noreferrer")
  }

  const isDownloadAvailable = (downloadLink: string) => {
    return downloadLink !== "Download link not available"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="default">
          <Download className="w-4 h-4" />
          Download
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Download {title}</DialogTitle>
          <DialogDescription>
            {mediaType === "movie"
              ? "Get the download link for this movie"
              : "Select a season and episode to get the download link"}
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
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting Download Link...
                </>
              ) : (
                "Get Download Link"
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
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Getting download link...</span>
            </div>
          )}

          {downloadData && (
            <div className="p-6 border rounded-lg bg-muted/30 text-center space-y-4">
              <div>
                <h3 className="font-medium text-lg mb-2">
                  {"movieTitle" in downloadData
                    ? downloadData.movieTitle
                    : downloadData.showTitle}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {"movieTitle" in downloadData
                    ? `${downloadData.releaseYear}`
                    : `Season ${downloadData.season}, Episode ${downloadData.episode}`}
                </p>
              </div>

              {isDownloadAvailable(downloadData.downloadLink) ? (
                <Button
                  onClick={() => handleDownloadClick(downloadData.downloadLink)}
                  size="lg"
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Download Page
                </Button>
              ) : (
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Sorry, no download link is available for this content at the
                    moment.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
