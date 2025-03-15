import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { Button } from "@/components/ui/button"
import { VideoPlayerSkeleton } from "@/components/video-player-skeleton"
import VidsrcPlayer from "@/components/vidsrc-player"
import { fetchMovieDetails } from "@/lib/tmdb"

interface WatchMoviePageProps {
  params: { id: string }
}

export default function WatchMoviePage({ params }: WatchMoviePageProps) {
  const movieId = Number.parseInt(params.id)

  return (
    <main className="min-h-screen bg-black pt-16">
      <div className="container px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="sm" asChild className="text-white">
            <Link
              href={`/movie/${movieId}`}
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
        <div className="mt-6 space-y-4 text-white">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-400">{movie.overview}</p>
        </div>
      </div>
    </div>
  )
}
