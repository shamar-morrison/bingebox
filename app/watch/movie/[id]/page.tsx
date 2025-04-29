import { ChevronLeft } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { VideoPlayerSkeleton } from "@/components/video-player-skeleton"
import VidsrcPlayer from "@/components/vidsrc-player"
import { fetchMovieDetails } from "@/lib/tmdb"

interface WatchMoviePageProps {
  params: { id: string }
  searchParams: { source?: string }
}

export async function generateMetadata({
  params,
}: WatchMoviePageProps): Promise<Metadata> {
  const movieId = Number.parseInt(params.id)
  const movie = await fetchMovieDetails(movieId)

  return {
    title: `Watch ${movie.title || "Movie"} Free Online - BingeBox`,
    description:
      movie.overview ||
      `Stream ${movie.title} in HD quality for free on BingeBox`,
  }
}

export default function WatchMoviePage({
  params,
  searchParams,
}: WatchMoviePageProps) {
  const movieId = Number.parseInt(params.id)
  const source = searchParams.source
  const sourceParam = source ? `?source=${source}` : ""

  return (
    <main className="min-h-screen bg-background pt-16">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild className="text-white">
            <Link
              href={`/movie/${movieId}${sourceParam}`}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to details
            </Link>
          </Button>
        </div>
      </div>

      <Suspense fallback={<VideoPlayerSkeleton />}>
        <MoviePlayer id={movieId} />
      </Suspense>
    </main>
  )
}

async function MoviePlayer({ id }: { id: number }) {
  const movie = await fetchMovieDetails(id)

  const title = movie.title || "Untitled Movie"
  const posterPath = movie.poster_path
    ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
    : "/placeholder.svg"
  const releaseDate = movie.release_date
  const cast = movie.credits?.cast || []

  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null

  return (
    <div className="container px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <VidsrcPlayer tmdbId={id} mediaType="movie" title={title} />
        <div className="mt-6 flex flex-col md:flex-row gap-6">
          <div className="hidden md:block flex-shrink-0 w-48">
            {posterPath && (
              <Image
                src={posterPath}
                alt={`${title} Poster`}
                width={185}
                height={278}
                className="rounded-lg object-cover"
              />
            )}
          </div>

          <div className="flex-grow space-y-4 text-foreground">
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-gray-400">{movie.overview}</p>

            <div className="hidden md:block space-y-2">
              {formattedDate && (
                <p className="text-sm">
                  <span className="font-semibold">Release Date:</span>{" "}
                  {formattedDate}
                </p>
              )}
              {cast.length > 0 && (
                <p className="text-sm">
                  <span className="font-semibold">Cast:</span>{" "}
                  {cast
                    .slice(0, 10)
                    .map((c) => c.name)
                    .join(", ")}
                  {cast.length > 10 ? ", ..." : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
