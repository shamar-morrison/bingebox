import { Suspense } from "react"
import type { Metadata } from "next"

import { Skeleton } from "@/components/ui/skeleton"
import MediaGrid from "@/components/media-grid"
import { fetchTopRatedMovies } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Top Rated Movies | BingeBox",
  description: "Browse top rated movie",
}

export default function TopRatedMoviesPage() {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Top Rated Movies</h1>

      <Suspense fallback={<GridSkeleton />}>
        <TopRatedMoviesGrid />
      </Suspense>
    </main>
  )
}

async function TopRatedMoviesGrid() {
  const movies = await fetchTopRatedMovies()
  return (
    <MediaGrid
      items={movies.results.map((item) => ({ ...item, media_type: "movie" }))}
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
