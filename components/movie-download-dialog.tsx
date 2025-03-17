"use client"

import { Download, Loader2, Share2 } from "lucide-react"
import Image from "next/image"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatFileSize, YTSMovie, YTSTorrent } from "@/lib/yts"

interface MovieDownloadDialogProps {
  children: React.ReactNode
  movieId: number
  imdbId: string | undefined
  title: string
}

export default function MovieDownloadDialog({
  children,
  imdbId,
  title,
}: MovieDownloadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [ytsData, setYtsData] = useState<YTSMovie | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  // Clear data when dialog closes
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      // Clear all state when dialog closes
      setTimeout(() => {
        setYtsData(null)
        setError(null)
        setIsLoading(false)
        setRetrying(false)
      }, 500)
    }
  }

  const fetchYTSData = useCallback(async () => {
    if (!imdbId) {
      setError("No IMDB ID available for this movie")
      return
    }

    setIsLoading(true)
    setError(null)
    setRetrying(false)
    setYtsData(null)

    try {
      const response = await fetch(`/api/yts/movie?imdbId=${imdbId}`)

      if (!response.ok) {
        // If we get a 502 error, it's likely a temporary issue with the YTS API
        if (response.status === 502) {
          throw new Error("YTS API is temporarily unavailable. Retrying...")
        }
        throw new Error(`Error: ${response.status}`)
      }

      const data = await response.json()

      if (data.movie) {
        // Accept the movie data regardless of IMDB ID formatting differences
        setYtsData(data.movie)
      } else {
        setError("No torrent data available for this movie")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)

      if (message.includes("temporarily unavailable")) {
        setRetrying(true)
        setError(
          "YTS API is temporarily unavailable. Retrying automatically...",
        )

        // Try again after a delay
        setTimeout(() => {
          fetchYTSData()
        }, 3000)
      } else {
        setError("Failed to load torrent data. Try again later.")
      }
      console.error(err)
    } finally {
      if (!retrying) {
        setIsLoading(false)
      }
    }
  }, [imdbId, setYtsData, setError, setIsLoading, retrying])

  useEffect(() => {
    // Only fetch when dialog is opened and we have an IMDB ID
    if (isOpen && imdbId) {
      fetchYTSData()
    }
  }, [isOpen, imdbId, fetchYTSData])

  const copyMagnetLink = (hash: string) => {
    if (!ytsData) return

    // Create magnet link
    const encodedTitle = encodeURIComponent(ytsData.title)
    const magnetLink = `magnet:?xt=urn:btih:${hash}&dn=${encodedTitle}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969`

    // Copy to clipboard
    navigator.clipboard
      .writeText(magnetLink)
      .then(() => toast.success("Magnet link copied to clipboard"))
      .catch(() => toast.error("Failed to copy magnet link"))
  }

  const openMagnetLink = (hash: string) => {
    if (!ytsData) return

    const encodedTitle = encodeURIComponent(ytsData.title)
    window.location.href = `magnet:?xt=urn:btih:${hash}&dn=${encodedTitle}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969`
  }

  const blurayTorrents =
    ytsData?.torrents.filter((torrent) =>
      torrent.type.toLowerCase().includes("bluray"),
    ) || []

  const webTorrents =
    ytsData?.torrents.filter((torrent) =>
      torrent.type.toLowerCase().includes("web"),
    ) || []

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Download &#34;{title}&#34;</DialogTitle>
          <DialogDescription>Available torrents from YTS.mx</DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading torrent information...
            </p>
          </div>
        )}

        {error && !isLoading && (
          <div className="p-6 text-center border rounded-lg">
            <p className="text-muted-foreground">{error}</p>
            {!imdbId && (
              <p className="mt-2 text-sm text-muted-foreground">
                IMDB ID is required to fetch torrent information.
              </p>
            )}
            {error.includes("temporarily unavailable") && (
              <div className="mt-4">
                <Loader2 className="w-6 h-6 mx-auto text-primary animate-spin" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Retrying automatically...
                </p>
              </div>
            )}
            {error &&
              !error.includes("temporarily unavailable") &&
              !retrying && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchYTSData}
                >
                  Try Again
                </Button>
              )}
          </div>
        )}

        {ytsData && !isLoading && !error && (
          <>
            {/* Show info notice if titles don't match exactly, but don't treat as an error */}
            {ytsData.title_english.toLowerCase() !== title.toLowerCase() && (
              <div className="p-2 mb-4 text-sm bg-blue-100 text-blue-700 rounded-md">
                <p>
                  Note: The movie title from YTS (&#34;{ytsData.title_english}
                  &#34;) is slightly different from your search (&#34;{title}
                  &#34;). This is likely the correct movie, but please verify.
                </p>
              </div>
            )}
            <div className="grid gap-4 md:grid-cols-[200px_1fr]">
              <div className="flex justify-center md:block">
                <Image
                  src={ytsData.medium_cover_image}
                  alt={ytsData.title}
                  width={200}
                  height={300}
                  className="object-cover rounded-md"
                />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-semibold">
                  {ytsData.title} ({ytsData.year})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Rating: {ytsData.rating}/10 • Runtime: {ytsData.runtime} min
                </p>
                <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                  {ytsData.genres.map((genre) => (
                    <span
                      key={genre}
                      className="px-2 py-1 text-xs rounded-full bg-secondary"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <Separator />

            {ytsData.torrents.length > 0 ? (
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="bluray">BluRay</TabsTrigger>
                  <TabsTrigger value="web">Web</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {ytsData.torrents.map((torrent, index) => (
                    <TorrentItem
                      key={index}
                      torrent={torrent}
                      onCopyMagnet={() => copyMagnetLink(torrent.hash)}
                      onOpenMagnet={() => openMagnetLink(torrent.hash)}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="bluray" className="space-y-4">
                  {blurayTorrents.length > 0 ? (
                    blurayTorrents.map((torrent, index) => (
                      <TorrentItem
                        key={index}
                        torrent={torrent}
                        onCopyMagnet={() => copyMagnetLink(torrent.hash)}
                        onOpenMagnet={() => openMagnetLink(torrent.hash)}
                      />
                    ))
                  ) : (
                    <div className="p-6 text-center border rounded-lg">
                      <p className="text-muted-foreground">
                        No BluRay torrents available for this movie.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="web" className="space-y-4">
                  {webTorrents.length > 0 ? (
                    webTorrents.map((torrent, index) => (
                      <TorrentItem
                        key={index}
                        torrent={torrent}
                        onCopyMagnet={() => copyMagnetLink(torrent.hash)}
                        onOpenMagnet={() => openMagnetLink(torrent.hash)}
                      />
                    ))
                  ) : (
                    <div className="p-6 text-center border rounded-lg">
                      <p className="text-muted-foreground">
                        No Web torrents available for this movie.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="p-6 text-center border rounded-lg">
                <p className="text-muted-foreground">
                  No torrents available for this movie.
                </p>
              </div>
            )}
          </>
        )}

        <DialogFooter className="flex justify-center sm:justify-center">
          <p className="text-xs text-muted-foreground text-center w-full">
            Torrents provided by YTS.mx. BingeBox is not affiliated with or
            endorsed by YTS.
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface TorrentItemProps {
  torrent: YTSTorrent
  onCopyMagnet: () => void
  onOpenMagnet: () => void
}

function TorrentItem({
  torrent,
  onCopyMagnet,
  onOpenMagnet,
}: TorrentItemProps) {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-medium">
            {torrent.quality} • {torrent.type}
          </h4>
          <div className="mt-1 space-y-1 text-sm text-muted-foreground">
            <p>
              Size: {torrent.size} ({formatFileSize(torrent.size_bytes)})
            </p>
            <p>
              Seeds: {torrent.seeds} • Peers: {torrent.peers}
            </p>
            {torrent.video_codec && torrent.audio_channels && (
              <p>
                {torrent.video_codec}
                {torrent.bit_depth && ` (${torrent.bit_depth})`} •{" "}
                {torrent.audio_channels}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCopyMagnet}
            title="Copy magnet link"
          >
            <Share2 className="w-4 h-4 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            onClick={onOpenMagnet}
            title="Open in torrent client"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </Button>
        </div>
      </div>
    </div>
  )
}
