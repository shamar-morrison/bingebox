import type { Metadata } from "next"
import { Suspense } from "react"

import InfiniteMediaGrid from "@/components/infinite-media-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPopularMovies } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Popular Movies | BingeBox",
  description: "Browse popular movie",
}

export default function PopularMoviesPage() {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Popular Movies</h1>

      <Suspense fallback={<GridSkeleton />}>
        <PopularMoviesGrid />
      </Suspense>
    </main>
  )
}

async function PopularMoviesGrid() {
  const movies = await fetchPopularMovies()

  return (
    <InfiniteMediaGrid
      initialData={movies}
      apiEndpoint="/api/movies/popular"
      mediaType="movie"
    />
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array(20)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-[2/3] rounded-lg" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        ))}
    </div>
  )
}
