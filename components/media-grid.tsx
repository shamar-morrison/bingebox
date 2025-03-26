import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { MediaItem } from "@/lib/types"
import { Play, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function MediaCard({ item }: { item: MediaItem }) {
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

  return (
    <Card className="overflow-hidden">
      <Link href={detailsPath}>
        <div className="relative aspect-[2/3] group">
          <Image
            src={imagePath}
            alt={title}
            fill
            className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          {!item.poster_path && !item.profile_path && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted group">
              {isPerson ? (
                <User className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
              ) : (
                <Play className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
              )}
            </div>
          )}
        </div>
      </Link>
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
}

export default function MediaGrid({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}
