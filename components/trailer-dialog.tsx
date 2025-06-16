"use client"

import type React from "react"

import { Play, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getTrailers } from "@/lib/tmdb-client"

interface Trailer {
  key: string
  name: string
  type: string
}

interface TrailerDialogProps {
  children: React.ReactNode
  mediaType: string
  mediaId: number
  title: string
}

export default function TrailerDialog({
  children,
  mediaType,
  mediaId,
  title,
}: TrailerDialogProps) {
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [selectedTrailer, setSelectedTrailer] = useState<Trailer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)

    if (isOpen && trailers.length === 0 && !isLoading) {
      setIsLoading(true)
      setError(null)

      try {
        const fetchedTrailers = await getTrailers(mediaType, mediaId)
        setTrailers(fetchedTrailers)
        setSelectedTrailer(fetchedTrailers[0]) // Auto-select first trailer
      } catch (err: unknown) {
        setError("Trailers not available")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleTrailerSelect = (trailer: Trailer) => {
    setSelectedTrailer(trailer)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <DialogHeader className="absolute top-0 right-0 z-10 p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(false)}
            className="bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="aspect-video w-full">
          {isLoading && (
            <div className="flex items-center justify-center w-full h-full bg-black">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center w-full h-full bg-black">
              <p className="text-white">{error}</p>
            </div>
          )}

          {selectedTrailer && (
            <iframe
              src={`https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1`}
              title={`${title} - ${selectedTrailer.name}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>

        {/* Trailer Selection */}
        {trailers.length > 1 && (
          <div className="p-4 bg-background border-t">
            <h3 className="text-sm font-medium mb-3">Available Trailers</h3>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {trailers.map((trailer) => (
                <Button
                  key={trailer.key}
                  variant={
                    selectedTrailer?.key === trailer.key ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handleTrailerSelect(trailer)}
                  className="flex items-center gap-2 text-xs h-8"
                >
                  <Play className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">{trailer.name}</span>
                  <Badge variant="secondary" className="text-xs px-1">
                    {trailer.type}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
