import type { Metadata } from "next"
import { Suspense } from "react"

import MediaFilters from "@/app/components/media-filters"
import MediaPagination from "@/app/components/media-pagination"
import MediaGrid from "@/components/media-grid"
import { Skeleton } from "@/components/ui/skeleton"
import { discoverMovies, discoverTV } from "@/lib/tmdb"

export const metadata: Metadata = {
  title: "Discover | BingeBox",
  description: "Discover movies and TV shows",
}

export const dynamic = "force-dynamic"

interface DiscoverPageProps {
  searchParams: {
    media_type?: string
    page?: string
    sort_by?: string
    with_genres?: string
    year?: string
    "vote_average.gte"?: string
    "vote_average.lte"?: string
    with_original_language?: string
    primary_release_year?: string
    first_air_date_year?: string
    "primary_release_date.gte"?: string
    "primary_release_date.lte"?: string
    "first_air_date.gte"?: string
    "first_air_date.lte"?: string
  }
}

export default function DiscoverPage({ searchParams }: DiscoverPageProps) {
  const mediaType = (searchParams.media_type || "movie") as "movie" | "tv"

  return (
    <main className="container px-4 py-24 mt-16">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <h1 className="text-3xl font-bold mb-2 md:mb-0">
          Discover {mediaType === "movie" ? "Movies" : "TV Shows"}
        </h1>

        <div className="flex gap-4">
          <a
            href={`/discover?media_type=movie${
              searchParams.sort_by ? `&sort_by=${searchParams.sort_by}` : ""
            }`}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              mediaType === "movie" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Movies
          </a>
          <a
            href={`/discover?media_type=tv${
              searchParams.sort_by ? `&sort_by=${searchParams.sort_by}` : ""
            }`}
            className={`text-sm font-medium transition-colors hover:text-primary ${
              mediaType === "tv" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            TV Shows
          </a>
        </div>
      </div>

      <MediaFilters mediaType={mediaType} />

      <Suspense fallback={<GridSkeleton />}>
        <DiscoverResults searchParams={searchParams} />
      </Suspense>
    </main>
  )
}

async function DiscoverResults({ searchParams }: DiscoverPageProps) {
  const {
    media_type = "movie",
    page = "1",
    sort_by = "popularity.desc",
    with_genres,
    year,
    primary_release_year,
    first_air_date_year,
    "vote_average.gte": minRating,
    with_original_language,
  } = searchParams

  // Call TMDB directly from the server component instead of going through our API route
  // This is more efficient as it avoids an extra HTTP request
  const params: Record<string, any> = {
    page: Number(page),
    sort_by,
  }

  if (with_genres) params.with_genres = with_genres

  // Handle year parameters properly based on media type
  if (media_type === "movie") {
    if (primary_release_year) {
      params.primary_release_year = Number(primary_release_year)
    } else if (year) {
      params.primary_release_year = Number(year)
    }
  } else {
    if (first_air_date_year) {
      params.first_air_date_year = Number(first_air_date_year)
    } else if (year) {
      params.first_air_date_year = Number(year)
    }
  }

  if (minRating) params["vote_average.gte"] = Number(minRating)
  if (with_original_language)
    params.with_original_language = with_original_language

  console.log("Server component params:", {
    media_type,
    params,
    year,
    primary_release_year,
    first_air_date_year,
  })

  try {
    const data =
      media_type === "tv"
        ? await discoverTV(params)
        : await discoverMovies(params)

    console.log(
      `Server received ${data.total_results} results for ${media_type}`,
    )

    return (
      <>
        {data.results?.length > 0 ? (
          <>
            <MediaGrid items={data.results} />
            <MediaPagination
              currentPage={Number(page)}
              totalPages={Math.min(data.total_pages || 1, 500)} // TMDB API has a limit of 500 pages
              totalResults={data.total_results || 0}
            />
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found. Try adjusting your filters.
            </p>
          </div>
        )}
      </>
    )
  } catch (error) {
    console.error("Error fetching discover results:", error)
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Error loading results. Please try again later.
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
