import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import FeaturedMedia from "@/components/featured-media"
import MediaRow from "@/components/media-row"
import {
  fetchTrending,
  fetchPopularMovies,
  fetchTopRatedShows,
} from "@/lib/tmdb"

export default function Home() {
  return (
    <main className="min-h-screen pb-10">
      <Suspense fallback={<FeaturedMediaSkeleton />}>
        <FeaturedMedia />
      </Suspense>

      <div className="container px-4 mt-8 space-y-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Trending Now</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/discover/trending" className="flex items-center">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<RowSkeleton />}>
            <TrendingRow />
          </Suspense>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Movies</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/movie/popular" className="flex items-center">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<RowSkeleton />}>
            <PopularMoviesRow />
          </Suspense>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Top Rated TV Shows</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/tv/top-rated" className="flex items-center">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <Suspense fallback={<RowSkeleton />}>
            <TopRatedShowsRow />
          </Suspense>
        </section>
      </div>
    </main>
  )
}

async function TrendingRow() {
  const trending = await fetchTrending()
  return <MediaRow items={trending.results.slice(0, 8)} />
}

async function PopularMoviesRow() {
  const movies = await fetchPopularMovies()
  return (
    <MediaRow
      items={movies.results
        .slice(0, 8)
        .map((item) => ({ ...item, media_type: "movie" }))}
    />
  )
}

async function TopRatedShowsRow() {
  const shows = await fetchTopRatedShows()
  return (
    <MediaRow
      items={shows.results
        .slice(0, 8)
        .map((item) => ({ ...item, media_type: "tv" }))}
    />
  )
}

function RowSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
      {Array(8)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="w-full h-[150px] rounded-md" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        ))}
    </div>
  )
}

function FeaturedMediaSkeleton() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] bg-muted animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />
      <div className="absolute inset-0 flex items-end">
        <div className="container px-4 pb-16 md:pb-24">
          <div className="max-w-2xl space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
