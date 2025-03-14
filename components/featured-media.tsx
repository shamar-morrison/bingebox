import Image from "next/image"
import Link from "next/link"
import { Info, PlayCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { fetchTrending } from "@/lib/tmdb"
import TrailerDialog from "@/components/trailer-dialog"

export default async function FeaturedMedia() {
  const trending = await fetchTrending()

  // Get a random item from the top 10 trending items
  const randomIndex = Math.floor(Math.random() * Math.min(10, trending.results.length))
  const featured = trending.results[randomIndex]

  const backdropPath = featured.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}`
    : `/placeholder.svg?height=1080&width=1920&text=${encodeURIComponent(featured.title || featured.name || "Featured Media")}`

  const mediaType = featured.media_type
  const detailsPath = mediaType === "movie" ? `/movies/${featured.id}` : `/tv/${featured.id}`

  const title = featured.title || featured.name
  const overview = featured.overview || "No overview available"

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
      <div className="absolute inset-0">
        <div className="w-full h-full bg-muted">
          <Image src={backdropPath || "/placeholder.svg"} alt={title} fill priority className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
      </div>

      <div className="absolute inset-0 flex items-end">
        <div className="container px-4 pb-16 md:pb-24">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">{title}</h1>
            <p className="text-base text-muted-foreground md:text-lg line-clamp-3">{overview}</p>
            <div className="flex flex-wrap gap-3">
              <TrailerDialog mediaType={mediaType} mediaId={featured.id} title={title}>
                <Button className="gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Watch Trailer
                </Button>
              </TrailerDialog>

              <Button variant="outline" asChild>
                <Link href={detailsPath} className="gap-2">
                  <Info className="w-5 h-5" />
                  More Info
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

