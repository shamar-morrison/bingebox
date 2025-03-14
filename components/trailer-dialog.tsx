"use client"

import type React from "react"

import { useState } from "react"
import { X } from "lucide-react"

import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { getTrailerKey } from "@/lib/tmdb-client"

interface TrailerDialogProps {
  children: React.ReactNode
  mediaType: string
  mediaId: number
  title: string
}

export default function TrailerDialog({ children, mediaType, mediaId, title }: TrailerDialogProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  const handleOpenChange = async (isOpen: boolean) => {
    setOpen(isOpen)

    if (isOpen && !trailerKey && !isLoading) {
      setIsLoading(true)
      setError(null)

      try {
        const key = await getTrailerKey(mediaType, mediaId)
        setTrailerKey(key)
      } catch (err: unknown) {
        setError("Trailer not available")
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
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

          {trailerKey && (
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

