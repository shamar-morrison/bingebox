import type { Metadata } from "next"
import { Suspense } from "react"

import InfiniteMediaGrid from "@/components/infinite-media-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTopRatedShows } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Top Rated TV Shows | BingeBox",
  description: "Browse top rated TV shows",
}

export default function TopRatedTVShowsPage() {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Top Rated TV Shows</h1>

      <Suspense fallback={<GridSkeleton />}>
        <TopRatedShowsGrid />
      </Suspense>
    </main>
  )
}

async function TopRatedShowsGrid() {
  const shows = await fetchTopRatedShows()

  return (
    <InfiniteMediaGrid
      initialData={shows}
      apiEndpoint="/api/tv/top-rated"
      mediaType="tv"
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
