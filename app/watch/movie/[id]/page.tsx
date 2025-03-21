import { ChevronLeft } from "lucide-react"
import type { Metadata } from "next"
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

  return (
    <div className="container px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <VidsrcPlayer tmdbId={id} mediaType="movie" title={title} />
        <div className="mt-6 space-y-4 text-foreground">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-400">{movie.overview}</p>
        </div>
      </div>
    </div>
  )
}
