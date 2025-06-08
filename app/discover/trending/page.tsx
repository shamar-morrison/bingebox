import type { Metadata } from "next"
import { Suspense } from "react"

import MediaPagination from "@/app/components/media-pagination"
import MediaGrid from "@/components/media-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTrending } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Trending | BingeBox - Watch Movies and TV Shows for free",
  description: "Browse trending movie and TV shows",
}

export const dynamic = "force-dynamic"

interface TrendingPageProps {
  searchParams: {
    page?: string
  }
}

export default function TrendingPage({ searchParams }: TrendingPageProps) {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Trending Now</h1>

      <Suspense fallback={<GridSkeleton />}>
        <TrendingGrid searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function TrendingGrid({ searchParams }: TrendingPageProps) {
  const { page = "1" } = searchParams

  try {
    const trending = await fetchTrending(Number(page))
    return (
      <>
        {trending.results?.length > 0 ? (
          <>
            <MediaGrid items={trending.results} />
            <MediaPagination
              currentPage={Number(page)}
              totalPages={Math.min(trending.total_pages || 1, 500)}
              totalResults={trending.total_results || 0}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trending content found.</p>
          </div>
        )}
      </>
    )
  } catch (error) {
    console.error("Error fetching trending content:", error)
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Error loading trending content. Please try again later.
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
