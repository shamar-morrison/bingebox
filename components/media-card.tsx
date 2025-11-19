"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { useTrailerHover } from "@/lib/hooks/use-trailer-hover"
import type { MediaItem } from "@/lib/types"
import { Play, User, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"

interface MediaCardProps {
  item: MediaItem
}

export default function MediaCard({ item }: MediaCardProps) {
  const isPerson = item.media_type === "person"

  const mediaType =
    item.media_type ||
    (item.title
      ? "movie"
      : item.name
        ? isPerson
          ? "person"
          : "tv"
        : "unknown")

  const title = item.title || item.name || "Untitled"

  const {
    trailerKey,
    isMuted,
    isLoadingTrailer,
    fetchTrailer,
    toggleMute,
  } = useTrailerHover(mediaType, item.id)

  const imagePath =
    isPerson && item.profile_path
      ? `https://image.tmdb.org/t/p/w500${item.profile_path}`
      : item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : ``

  const detailsPath = isPerson
    ? `/person/${item.id}`
    : mediaType === "movie"
      ? `/movie/${item.id}`
      : `/tv/${item.id}`

  const watchPath =
    mediaType === "movie"
      ? `/watch/movie/${item.id}`
      : `/watch/tv/${item.id}/season/1/episode/1`

  const releaseDate = item.release_date || item.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null

  const cardContent = (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02] h-full">
      <div className="relative aspect-[2/3] group overflow-hidden bg-muted">
        <Link href={detailsPath} className="block w-full h-full">
          {imagePath ? (
            <img
              src={imagePath}
              alt={title}
              className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75 absolute top-0 left-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              {isPerson ? (
                <User className="h-10 w-10 text-muted-foreground" />
              ) : (
                <Play className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          )}
          
          {!item.poster_path && !item.profile_path && !imagePath && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted group">
              {isPerson ? (
                <User className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
              ) : (
                <Play className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
              )}
            </div>
          )}
        </Link>
      </div>
      <CardContent className="p-3">
        <Link href={detailsPath}>
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            {year && year + " "}
            {isPerson ? "Person" : mediaType === "movie" ? "Movie" : "TV Show"}
          </p>
        </Link>
        {!isPerson && (
          <Button asChild variant="secondary" size="sm" className="w-full">
            <Link
              href={watchPath}
              className="flex items-center justify-center gap-1"
            >
              <Play className="w-3 h-3" /> Watch Now
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )

  if (isPerson) {
    return cardContent
  }

  return (
    <HoverCard openDelay={4000} onOpenChange={(open) => {
      if (open) fetchTrailer()
    }}>
      <HoverCardTrigger asChild>
        {cardContent}
      </HoverCardTrigger>
      <HoverCardContent className="w-[320px] p-0 overflow-hidden border-none bg-black" side="right" align="start">
        <div className="aspect-video w-full relative bg-black">
          {isLoadingTrailer ? (
            <div className="flex items-center justify-center w-full h-full">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : trailerKey ? (
            <TrailerPlayer trailerKey={trailerKey} isMuted={isMuted} toggleMute={toggleMute} title={title} />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-white text-xs">
              No trailer available
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function TrailerPlayer({ 
  trailerKey, 
  isMuted, 
  toggleMute, 
  title 
}: { 
  trailerKey: string
  isMuted: boolean
  toggleMute: (e: React.MouseEvent) => void
  title: string
}) {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    if (!iframeRef.current?.contentWindow) return

    const command = isMuted ? 'mute' : 'unMute'
    iframeRef.current.contentWindow.postMessage(JSON.stringify({
      event: 'command',
      func: command,
      args: []
    }), '*')
  }, [isMuted])

  return (
    <>
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&controls=0&showinfo=0&rel=0&modestbranding=1&loop=1&playlist=${trailerKey}&mute=1&enablejsapi=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        className="w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute bottom-2 right-2 z-20 pointer-events-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
        </Button>
      </div>
    </>
  )
}
