"use client"

import { CalendarIcon, Clock, Film, Star } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"

import CastSection from "@/components/cast-section"
import DownloadModal from "@/components/download-modal"
import MediaRow from "@/components/media-row"
import ReviewSection from "@/components/review-section"
import TrailerDialog from "@/components/trailer-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WatchlistDropdown from "@/components/watchlist-dropdown"
import { MediaItem, Review, ReviewResponse } from "@/lib/types"
import { getLanguageName } from "@/lib/utils"

interface MovieDetailsClientProps {
  id: number
  initialData: MediaItem
}

export default function MovieDetailsClient({
  id,
  initialData,
}: MovieDetailsClientProps) {
  const [movie] = useState<MediaItem>(initialData)
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [isLoadingReviews, startReviewLoad] = useTransition()
  const [reviewsFetched, setReviewsFetched] = useState(false)

  const handleTabChange = (value: string) => {
    if (value === "reviews" && !reviewsFetched && !isLoadingReviews) {
      startReviewLoad(async () => {
        try {
          const response = await fetch(`/api/movie/${id}/reviews`)
          if (!response.ok) {
            throw new Error("Failed to fetch reviews from API route")
          }
          const reviewData: ReviewResponse = await response.json()

          setReviews(reviewData.results)
          setReviewsFetched(true)
        } catch (error) {
          console.error("Error fetching movie reviews:", error)
          setReviews([])
          setReviewsFetched(true)
        }
      })
    }
  }

  const backdropPath = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null

  const posterPath = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null

  const releaseDate = movie.release_date
    ? new Date(movie.release_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Release date unknown"

  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : "Runtime unknown"

  const voteAverage = movie.vote_average
    ? Math.round(movie.vote_average * 10) / 10
    : null

  const genres = movie.genres || []
  const cast = movie.credits?.cast || []
  const crew = movie.credits?.crew || []
  const similarMovies = movie.similar?.results || []
  const director = crew.find((person) => person.job === "Director")

  return (
    <>
      <div className="relative w-full min-h-[500px] md:min-h-[600px]">
        <div className="absolute inset-0">
          {backdropPath ? (
            <img
              src={backdropPath}
              alt={""}
              className="object-cover absolute top-0 left-0 w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 bg-muted flex items-center justify-center">
              <Film className="h-24 w-24 text-muted-foreground opacity-25" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="relative pt-32 pb-8 md:pt-40 md:pb-16">
          <div className="container px-4">
            <div className="grid items-start gap-8 md:grid-cols-[300px_1fr]">
              <div className="relative hidden overflow-hidden rounded-lg shadow-lg md:block aspect-[2/3]">
                {posterPath ? (
                  <img
                    src={posterPath}
                    alt={movie.title || "Movie poster"}
                    className="object-cover absolute top-0 left-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Film className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  {movie.title || "Untitled Movie"}
                </h1>

                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/discover?media_type=movie&with_genres=${genre.id}`}
                    >
                      <Badge
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80 transition-colors"
                      >
                        {genre.name}
                      </Badge>
                    </Link>
                  ))}
                </div>

                <div className="flex flex-wrap gap-4 text-sm">
                  {voteAverage && (
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span>{voteAverage} / 10</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span>{releaseDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{runtime}</span>
                  </div>

                  {movie.original_language &&
                    movie.original_language !== "en" && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Language:</span>
                        <span>{getLanguageName(movie.original_language)}</span>
                      </div>
                    )}
                </div>

                {director && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Director: </span>
                    <Link
                      href={`/person/${director.id}`}
                      className="hover:underline"
                    >
                      {director.name}
                    </Link>
                  </div>
                )}

                <p className="text-muted-foreground max-w-prose">
                  {movie.overview || "No overview available."}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild>
                    <Link href={`/watch/movie/${id}`}>Watch Now</Link>
                  </Button>

                  <TrailerDialog
                    mediaType="movie"
                    mediaId={id}
                    title={movie.title || "Movie"}
                  >
                    <Button variant="outline">Watch Trailer</Button>
                  </TrailerDialog>

                  <DownloadModal
                    mediaType="movie"
                    tmdbId={id}
                    title={movie.title || "Movie"}
                  />

                  <WatchlistDropdown
                    mediaId={id}
                    mediaType="movie"
                    title={movie.title || "Movie"}
                    posterPath={movie.poster_path}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-8">
        <Tabs
          defaultValue="cast"
          className="space-y-8"
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="similar">Similar Movies</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="cast" className="space-y-6">
            <h2 className="text-2xl font-semibold">Cast</h2>
            <Separator />
            {cast.length > 0 ? (
              <CastSection cast={cast.slice(0, 12)} />
            ) : (
              <div className="p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">
                  No cast information available.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="similar" className="space-y-6">
            <h2 className="text-2xl font-semibold">Similar Movies</h2>
            <Separator />
            {similarMovies.length > 0 ? (
              <MediaRow
                items={similarMovies
                  .slice(0, 8)
                  .map((item) => ({ ...item, media_type: "movie" }))}
              />
            ) : (
              <div className="p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">
                  No similar movies available.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            <Separator />
            {isLoadingReviews ? (
              <ReviewsSkeleton />
            ) : reviews && reviews.length > 0 ? (
              <ReviewSection reviews={reviews} />
            ) : reviewsFetched ? (
              <div className="p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">No reviews available.</p>
              </div>
            ) : null}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/4" />
      <Skeleton className="h-px w-full" />
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
