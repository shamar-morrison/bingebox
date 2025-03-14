import { Suspense } from "react"
import Link from "next/link"
import { ChevronLeft, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import VideoPlayer from "@/components/video-player"
import { VideoPlayerSkeleton } from "@/components/video-player-skeleton"
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
            <Link href={`/movies/${movieId}`} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              Back to details
            </Link>
          </Button>

          <Button variant="ghost" size="sm" asChild className="text-white">
            <Link href="/" className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              BingeBox
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
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  // In a real app, you would fetch the actual video source from your backend
  // For this demo, we'll use a sample video
  const videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

  return (
    <div className="container px-4 pb-16">
      <div className="max-w-5xl mx-auto">
        <VideoPlayer src={videoSrc} title={title} posterImage={posterPath} />

        <div className="mt-6 space-y-4 text-white">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-gray-400">{movie.overview}</p>
        </div>
      </div>
    </div>
  )
}

