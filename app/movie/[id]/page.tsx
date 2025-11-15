import MovieDetailsClient from "@/components/movie-details-client"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchMovieDetails } from "@/lib/tmdb"
import type { Metadata } from "next"
import { Suspense } from "react"

interface MoviePageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const movie = await fetchMovieDetails(Number.parseInt(params.id))

  if (movie.adult) {
    return { title: "404 Not Found | BingeBox" }
  }

  return {
    title: `${movie.title || "Movie"} | BingeBox - Watch Movies and TV Shows for free`,
    description: movie.overview || "Watch this movie on BingeBox",
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = Number.parseInt(params.id)

  const initialMovie = await fetchMovieDetails(movieId)

  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<MovieDetailsSkeleton />}>
        <MovieDetailsClient initialData={initialMovie} id={movieId} />
      </Suspense>
    </main>
  )
}

function MovieDetailsSkeleton() {
  return (
    <>
      <div className="relative w-full h-[500px] md:h-[600px]">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container px-4">
            <div className="grid items-center gap-8 md:grid-cols-[300px_1fr]">
              <Skeleton className="hidden w-full md:block aspect-[2/3] rounded-lg" />

              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />

                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>

                <div className="flex gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>

                <Skeleton className="h-4 w-40" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container px-4 mt-8">
        <div className="space-y-8">
          <div className="flex space-x-4 border-b">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-px w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[2/3] rounded-md" />
                  <Skeleton className="h-4 w-20 mt-1 mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
