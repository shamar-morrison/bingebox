"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { createMagnetLink } from "@/lib/yts"
import { Movie } from "@/lib/yts-types"
import { Download, Magnet, Star } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface TorrentMovieCardProps {
  movie: Movie
}

export default function TorrentMovieCard({ movie }: TorrentMovieCardProps) {
  const [showDownloadModal, setShowDownloadModal] = useState(false)

  const is3DAvailable = movie.torrents.some((t) =>
    t.quality.toLowerCase().includes("3d"),
  )
  const is4KAvailable = movie.torrents.some(
    (t) =>
      t.quality.toLowerCase().includes("2160p") ||
      t.quality.toLowerCase().includes("4k"),
  )

  return (
    <Card className="overflow-hidden group h-full flex flex-col">
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={movie.medium_cover_image || "/placeholder.svg"}
          alt={movie.title}
          fill
          className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {is3DAvailable && (
            <Badge
              variant="secondary"
              className="bg-blue-500 hover:bg-blue-600"
            >
              3D
            </Badge>
          )}
          {is4KAvailable && (
            <Badge
              variant="secondary"
              className="bg-purple-500 hover:bg-purple-600"
            >
              4K
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-medium line-clamp-1">{movie.title}</h3>
          <p className="text-xs text-muted-foreground mb-2 flex items-center">
            {movie.year} •
            <span className="inline-flex items-center ml-1 text-amber-500">
              <Star className="h-3 w-3 fill-current mr-0.5" />
              {movie.rating.toFixed(1)}
            </span>
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genres?.slice(0, 3).map((genre) => (
              <Badge key={genre} variant="outline" className="text-xs">
                {genre}
              </Badge>
            ))}
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="w-full mt-2"
          onClick={() => setShowDownloadModal(true)}
        >
          <Download className="w-3 h-3" /> Download
        </Button>
      </CardContent>

      <DownloadDialog
        movie={movie}
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </Card>
  )
}

interface DownloadDialogProps {
  movie: Movie
  isOpen: boolean
  onClose: () => void
}

function DownloadDialog({ movie, isOpen, onClose }: DownloadDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-auto">
        <DialogHeader className="mb-4">
          <DialogTitle className="leading-7 mt-2">
            Download {movie.title_long}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {movie.torrents.map((torrent, index) => (
            <div key={index} className="border rounded-md p-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{torrent.quality}</p>
                  <span className="text-xs text-muted-foreground">
                    ({torrent.size})
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div>
                    Seeds:{" "}
                    <span className="text-green-500 font-medium">
                      {torrent.seeds}
                    </span>
                  </div>
                  <div>
                    Peers:{" "}
                    <span className="text-blue-500 font-medium">
                      {torrent.peers}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-x-3 gap-y-1 mb-3 text-xs">
                <Badge variant="outline" className="h-5">
                  {torrent.type === "bluray" ? "BLURAY" : "WEB"}
                </Badge>
                <Badge variant="outline" className="h-5">
                  {torrent.video_codec.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="h-5">
                  {`${torrent.bit_depth}-BIT`}
                </Badge>
                <Badge variant="outline" className="h-5">
                  {torrent.audio_channels}
                </Badge>
              </div>

              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <a
                    href={torrent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="w-3 h-3" /> Torrent
                  </a>
                </Button>

                <Button size="sm" variant="default" asChild className="flex-1">
                  <a
                    href={createMagnetLink({
                      hash: torrent.hash,
                      title: movie.title,
                      quality: torrent.quality,
                    })}
                  >
                    <Magnet className="w-3 h-3" /> Magnet
                  </a>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
