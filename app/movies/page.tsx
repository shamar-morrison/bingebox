import { Suspense } from "react"
import type { Metadata } from "next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import MediaGrid from "@/components/media-grid"
import { fetchPopularMovies, fetchTopRatedMovies, fetchUpcomingMovies, fetchNowPlayingMovies } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Movies | StreamFlix",
  description: "Browse popular, top rated, upcoming, and now playing movies",
}

export default function MoviesPage() {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Movies</h1>

      <Tabs defaultValue="popular" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="now-playing">Now Playing</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          <h2 className="text-2xl font-semibold">Popular Movies</h2>
          <Suspense fallback={<GridSkeleton />}>
            <PopularMoviesGrid />
          </Suspense>
        </TabsContent>

        <TabsContent value="top-rated" className="space-y-4">
          <h2 className="text-2xl font-semibold">Top Rated Movies</h2>
          <Suspense fallback={<GridSkeleton />}>
            <TopRatedMoviesGrid />
          </Suspense>
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <h2 className="text-2xl font-semibold">Upcoming Movies</h2>
          <Suspense fallback={<GridSkeleton />}>
            <UpcomingMoviesGrid />
          </Suspense>
        </TabsContent>

        <TabsContent value="now-playing" className="space-y-4">
          <h2 className="text-2xl font-semibold">Now Playing Movies</h2>
          <Suspense fallback={<GridSkeleton />}>
            <NowPlayingMoviesGrid />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  )
}

async function PopularMoviesGrid() {
  const movies = await fetchPopularMovies()
  return <MediaGrid items={movies.results} />
}

async function TopRatedMoviesGrid() {
  const movies = await fetchTopRatedMovies()
  return <MediaGrid items={movies.results} />
}

async function UpcomingMoviesGrid() {
  const movies = await fetchUpcomingMovies()
  return <MediaGrid items={movies.results} />
}

async function NowPlayingMoviesGrid() {
  const movies = await fetchNowPlayingMovies()
  return <MediaGrid items={movies.results} />
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

