import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { MediaItem } from "@/lib/types"
import { Play } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

function MediaCard({ item }: { item: MediaItem }) {
  const mediaType = item.media_type || (item.title ? "movie" : "tv")
  const title = item.title || item.name || "Untitled"
  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : `/placeholder.svg`

  const detailsPath =
    mediaType === "movie" ? `/movie/${item.id}` : `/tv/${item.id}`
  const watchPath =
    mediaType === "movie"
      ? `/watch/movie/${item.id}`
      : `/watch/tv/${item.id}/season/1/episode/1`

  return (
    <Card className="overflow-hidden">
      <Link href={detailsPath}>
        <div className="relative aspect-[2/3] group">
          <Image
            src={posterPath || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 12.5vw"
          />
        </div>
      </Link>
      <CardContent className="p-2">
        <Link href={detailsPath}>
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground mb-2">
            {mediaType === "movie" ? "Movie" : "TV Show"}
          </p>
        </Link>
        <Button asChild variant="secondary" size="sm" className="w-full">
          <Link
            href={watchPath}
            className="flex items-center justify-center gap-1"
          >
            <Play className="w-3 h-3" /> Watch Now
          </Link>
        </Button>
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
