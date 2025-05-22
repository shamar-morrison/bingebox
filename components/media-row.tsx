import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { MediaItem } from "@/lib/types"
import { Film, Play, Tv, User } from "lucide-react"
import Link from "next/link"

function MediaCard({ item }: { item: MediaItem }) {
  const isPerson = item.media_type === "person"
  const mediaType = item.media_type || (item.title ? "movie" : "tv")
  const title = item.title || item.name || "Untitled"
  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : item.profile_path
      ? `https://image.tmdb.org/t/p/w500${item.profile_path}`
      : ``

  const detailsPath =
    mediaType === "person"
      ? `/person/${item.id}`
      : mediaType === "movie"
        ? `/movie/${item.id}`
        : `/tv/${item.id}`

  const watchPath =
    mediaType === "movie"
      ? `/watch/movie/${item.id}`
      : `/watch/tv/${item.id}/season/1/episode/1`

  return (
    <Card className="overflow-hidden">
      <Link href={detailsPath}>
        <div className="relative aspect-[2/3] group">
          <img
            src={posterPath}
            alt={title}
            className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75 absolute top-0 left-0 w-full h-full"
          />
          {!item.poster_path && !item.profile_path && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted group">
              {isPerson ? (
                <User className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
              ) : mediaType === "movie" ? (
                <Film className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
              ) : (
                <Tv className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
              )}
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-2">
        <Link href={detailsPath}>
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-2">
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
}

export default function MediaRow({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}
