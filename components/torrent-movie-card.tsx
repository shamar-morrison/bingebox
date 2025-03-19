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
import { Download, Film, Star } from "lucide-react"
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
            {movie.genres.slice(0, 3).map((genre) => (
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
          <Download className="w-3 h-3 mr-1" /> Download
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="mb-4">
          <DialogTitle className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            <span>Download {movie.title_long}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {movie.torrents.map((torrent, index) => (
            <div key={index} className="bg-muted p-3 rounded-md">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">
                    {torrent.quality}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {torrent.size}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground text-right">
                  Seeds: <span className="text-green-500">{torrent.seeds}</span>{" "}
                  • Peers:{" "}
                  <span className="text-blue-500">{torrent.peers}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild className="flex-1">
                  <a
                    href={torrent.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                  >
                    <Download className="w-3 h-3 mr-1" /> Torrent
                  </a>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  asChild
                  className="flex-1"
                >
                  <a
                    href={createMagnetLink({
                      hash: torrent.hash,
                      title: movie.title,
                      quality: torrent.quality,
                    })}
                  >
                    <Download className="w-3 h-3 mr-1" /> Magnet
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
