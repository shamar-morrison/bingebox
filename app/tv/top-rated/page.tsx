import type { Metadata } from "next"
import { Suspense } from "react"

import MediaPagination from "@/app/components/media-pagination"
import MediaGrid from "@/components/media-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTopRatedShows } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Top Rated TV Shows | BingeBox",
  description: "Browse top rated TV shows",
}

export const dynamic = "force-dynamic"

interface TopRatedTVShowsPageProps {
  searchParams: {
    page?: string
  }
}

export default function TopRatedTVShowsPage({
  searchParams,
}: TopRatedTVShowsPageProps) {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Top Rated TV Shows</h1>

      <Suspense fallback={<GridSkeleton />}>
        <TopRatedShowsGrid searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function TopRatedShowsGrid({ searchParams }: TopRatedTVShowsPageProps) {
  const { page = "1" } = searchParams

  try {
    const shows = await fetchTopRatedShows(Number(page))
    return (
      <>
        {shows.results?.length > 0 ? (
          <>
            <MediaGrid
              items={shows.results.map((item) => ({
                ...item,
                media_type: "tv",
              }))}
            />
            <MediaPagination
              currentPage={Number(page)}
              totalPages={Math.min(shows.total_pages || 1, 500)}
              totalResults={shows.total_results || 0}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No top rated TV shows found.
            </p>
          </div>
        )}
      </>
    )
  } catch (error) {
    console.error("Error fetching top rated TV shows:", error)
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Error loading top rated TV shows. Please try again later.
        </p>
      </div>
    )
  }
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
