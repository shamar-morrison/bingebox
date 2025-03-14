import type { MediaItem } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"

function MediaCard({ item }: { item: MediaItem }) {
  const mediaType = item.media_type || (item.title ? "movie" : "tv")
  const title = item.title || item.name || "Untitled"
  const posterPath = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : `/placeholder.svg?height=750&width=500&text=${encodeURIComponent(title)}`

  const detailsPath = mediaType === "movie" ? `/movies/${item.id}` : `/tv/${item.id}`

  const voteAverage = item.vote_average ? Math.round(item.vote_average * 10) / 10 : null
  const releaseDate = item.release_date || item.first_air_date
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null

  return (
    <Link href={detailsPath}>
      <Card className="overflow-hidden transition-all hover:scale-105 hover:shadow-lg">
        <div className="relative aspect-[2/3]">
          <Image
            src={posterPath || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
          {voteAverage && (
            <Badge variant="secondary" className="absolute top-2 right-2">
              ★ {voteAverage}
            </Badge>
          )}
        </div>
        <CardContent className="p-3">
          <h3 className="font-medium line-clamp-1">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {year ? year : ""} {mediaType === "movie" ? "Movie" : "TV Show"}
          </p>
        </CardContent>
      </Card>
    </Link>
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

