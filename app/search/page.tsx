import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import MediaGrid from "@/components/media-grid"
import SearchForm from "@/components/search-form"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { searchMovies, searchMulti, searchPerson, searchTV } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Search | BingeBox - Watch Movies and TV Shows for free",
  description: "Search for movie, TV shows, and people",
}

interface SearchPageProps {
  searchParams: { q?: string; type?: string; page?: string }
}

export default function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || ""
  const type = searchParams.type || "multi"
  const page = Number.parseInt(searchParams.page || "1")

  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-8 text-3xl font-bold">Search</h1>

      <SearchForm initialQuery={query} initialType={type} />

      {query ? (
        <div className="mt-8">
          <Tabs defaultValue={type} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
              <TabsTrigger value="multi" asChild>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=multi`}
                  replace
                >
                  All
                </Link>
              </TabsTrigger>
              <TabsTrigger value="movie" asChild>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=movie`}
                  replace
                >
                  Movies
                </Link>
              </TabsTrigger>
              <TabsTrigger value="tv" asChild>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=tv`}
                  replace
                >
                  TV Shows
                </Link>
              </TabsTrigger>
              <TabsTrigger value="person" asChild>
                <Link
                  href={`/search?q=${encodeURIComponent(query)}&type=person`}
                  replace
                >
                  People
                </Link>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="multi" className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Search Results for &#34;{query}&#34;
              </h2>
              <Suspense fallback={<GridSkeleton />}>
                <MultiSearchResults query={query} page={page} />
              </Suspense>
            </TabsContent>

            <TabsContent value="movie" className="space-y-4">
              <h2 className="text-2xl font-semibold">
                Movie Results for &#34;{query}&#34;
              </h2>
              <Suspense fallback={<GridSkeleton />}>
                <MovieSearchResults query={query} page={page} />
              </Suspense>
            </TabsContent>

            <TabsContent value="tv" className="space-y-4">
              <h2 className="text-2xl font-semibold">
                TV Show Results for &#34;{query}&#34;
              </h2>
              <Suspense fallback={<GridSkeleton />}>
                <TVSearchResults query={query} page={page} />
              </Suspense>
            </TabsContent>

            <TabsContent value="person" className="space-y-4">
              <h2 className="text-2xl font-semibold">
                People Results for &#34;{query}&#34;
              </h2>
              <Suspense fallback={<GridSkeleton />}>
                <PersonSearchResults query={query} page={page} />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 mt-8 text-center border rounded-lg">
          <h2 className="text-xl font-medium">
            Enter a search term to find movies, TV shows, and people
          </h2>
          <p className="mt-2 text-muted-foreground">
            You can search by title, name, or keywords
          </p>
        </div>
      )}
    </main>
  )
}

async function MultiSearchResults({
  query,
  page,
}: {
  query: string
  page: number
}) {
  const results = await searchMulti(query, page)

  if (results.results.length === 0) {
    return <NoResults />
  }

  return <MediaGrid items={results.results} />
}

async function MovieSearchResults({
  query,
  page,
}: {
  query: string
  page: number
}) {
  const results = await searchMovies(query, page)

  if (results.results.length === 0) {
    return <NoResults />
  }

  const movieResults = results.results.filter(
    (item) => !item.media_type || item.media_type === "movie",
  )

  if (movieResults.length === 0) {
    return <NoResults />
  }

  return (
    <MediaGrid
      items={movieResults.map((item) => ({ ...item, media_type: "movie" }))}
    />
  )
}

async function TVSearchResults({
  query,
  page,
}: {
  query: string
  page: number
}) {
  const results = await searchTV(query, page)

  if (results.results.length === 0) {
    return <NoResults />
  }

  const tvResults = results.results.filter(
    (item) => !item.media_type || item.media_type === "tv",
  )

  if (tvResults.length === 0) {
    return <NoResults />
  }

  return (
    <MediaGrid
      items={tvResults.map((item) => ({ ...item, media_type: "tv" }))}
    />
  )
}

async function PersonSearchResults({
  query,
  page,
}: {
  query: string
  page: number
}) {
  const results = await searchPerson(query, page)

  if (results.results.length === 0) {
    return <NoResults />
  }

  const personResults = results.results.filter((item) => {
    // The API might return other types, so explicitly filter for persons
    return item.media_type === "person" || !item.media_type
  })

  if (personResults.length === 0) {
    return <NoResults />
  }

  return (
    <MediaGrid
      items={personResults.map((item) => ({ ...item, media_type: "person" }))}
    />
  )
}

function NoResults() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg">
      <h3 className="text-lg font-medium">No results found</h3>
      <p className="mt-2 text-muted-foreground">
        Try adjusting your search or filter to find what you&#39;re looking for
      </p>
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array(10)
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
