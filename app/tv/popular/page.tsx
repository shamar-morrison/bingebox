import { Suspense } from "react"
import type { Metadata } from "next"

import { Skeleton } from "@/components/ui/skeleton"
import MediaGrid from "@/components/media-grid"
import { fetchPopularShows } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Popular TV Shows | BingeBox",
  description: "Browse popular TV shows",
}

export default function PopularTVShowsPage() {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Popular TV Shows</h1>

      <Suspense fallback={<GridSkeleton />}>
        <PopularShowsGrid />
      </Suspense>
    </main>
  )
}

async function PopularShowsGrid() {
  const shows = await fetchPopularShows()
  return <MediaGrid items={shows.results.map((item) => ({ ...item, media_type: "tv" }))} />
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

