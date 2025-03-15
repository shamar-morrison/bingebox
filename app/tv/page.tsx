import { Suspense } from "react"
import type { Metadata } from "next"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import MediaGrid from "@/components/media-grid"
import {
  fetchPopularShows,
  fetchTopRatedShows,
  fetchAiringTodayShows,
  fetchOnTheAirShows,
} from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "TV Shows | BingeBox - Watch Movies and TV Shows for free",
  description:
    "Browse popular, top rated, airing today, and on the air TV shows",
}

export default function TVShowsPage() {
  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">TV Shows</h1>

      <Tabs defaultValue="popular" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="top-rated">Top Rated</TabsTrigger>
          <TabsTrigger value="airing-today">Airing Today</TabsTrigger>
          <TabsTrigger value="on-the-air">On The Air</TabsTrigger>
        </TabsList>

        <TabsContent value="popular" className="space-y-4">
          <h2 className="text-2xl font-semibold">Popular TV Shows</h2>
          <Suspense fallback={<GridSkeleton />}>
            <PopularShowsGrid />
          </Suspense>
        </TabsContent>

        <TabsContent value="top-rated" className="space-y-4">
          <h2 className="text-2xl font-semibold">Top Rated TV Shows</h2>
          <Suspense fallback={<GridSkeleton />}>
            <TopRatedShowsGrid />
          </Suspense>
        </TabsContent>

        <TabsContent value="airing-today" className="space-y-4">
          <h2 className="text-2xl font-semibold">Airing Today</h2>
          <Suspense fallback={<GridSkeleton />}>
            <AiringTodayShowsGrid />
          </Suspense>
        </TabsContent>

        <TabsContent value="on-the-air" className="space-y-4">
          <h2 className="text-2xl font-semibold">On The Air</h2>
          <Suspense fallback={<GridSkeleton />}>
            <OnTheAirShowsGrid />
          </Suspense>
        </TabsContent>
      </Tabs>
    </main>
  )
}

async function PopularShowsGrid() {
  const shows = await fetchPopularShows()
  return <MediaGrid items={shows.results} />
}

async function TopRatedShowsGrid() {
  const shows = await fetchTopRatedShows()
  return <MediaGrid items={shows.results} />
}

async function AiringTodayShowsGrid() {
  const shows = await fetchAiringTodayShows()
  return <MediaGrid items={shows.results} />
}

async function OnTheAirShowsGrid() {
  const shows = await fetchOnTheAirShows()
  return <MediaGrid items={shows.results} />
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
