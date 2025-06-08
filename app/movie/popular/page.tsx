import type { Metadata } from "next"
import { Suspense } from "react"

import MediaPagination from "@/app/components/media-pagination"
import MediaGrid from "@/components/media-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPopularMovies } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Popular Movies | BingeBox",
  description: "Browse popular movie",
}

export const dynamic = "force-dynamic"

interface PopularMoviesPageProps {
  searchParams: {
    page?: string
  }
}

export default function PopularMoviesPage({
  searchParams,
}: PopularMoviesPageProps) {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Popular Movies</h1>

      <Suspense fallback={<GridSkeleton />}>
        <PopularMoviesGrid searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function PopularMoviesGrid({ searchParams }: PopularMoviesPageProps) {
  const { page = "1" } = searchParams

  try {
    const movies = await fetchPopularMovies(Number(page))
    return (
      <>
        {movies.results?.length > 0 ? (
          <>
            <MediaGrid
              items={movies.results.map((item) => ({
                ...item,
                media_type: "movie",
              }))}
            />
            <MediaPagination
              currentPage={Number(page)}
              totalPages={Math.min(movies.total_pages || 1, 500)}
              totalResults={movies.total_results || 0}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No popular movies found.</p>
          </div>
        )}
      </>
    )
  } catch (error) {
    console.error("Error fetching popular movies:", error)
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Error loading popular movies. Please try again later.
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
