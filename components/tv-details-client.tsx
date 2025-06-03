"use client"

import { CalendarIcon, Clock, InfoIcon, Star, Tv } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"

import CastSection from "@/components/cast-section"
import DownloadModal from "@/components/download-modal"
import MediaRow from "@/components/media-row"
import ReviewSection from "@/components/review-section"
import TrailerDialog from "@/components/trailer-dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WatchlistDropdown from "@/components/watchlist-dropdown"
import { MediaItem, Review, ReviewResponse } from "@/lib/types"
import { cn, getLanguageName } from "@/lib/utils"

interface TVShowDetailsClientProps {
  id: number
  initialData: MediaItem
}

export default function TVShowDetailsClient({
  id,
  initialData,
}: TVShowDetailsClientProps) {
  const [show] = useState<MediaItem>(initialData)
  const [reviews, setReviews] = useState<Review[] | null>(null)
  const [isLoadingReviews, startReviewLoad] = useTransition()
  const [reviewsFetched, setReviewsFetched] = useState(false)

  const handleTabChange = (value: string) => {
    if (value === "reviews" && !reviewsFetched && !isLoadingReviews) {
      startReviewLoad(async () => {
        try {
          const response = await fetch(`/api/tv/${id}/reviews`)
          if (!response.ok) {
            throw new Error("Failed to fetch reviews from API route")
          }
          const reviewData: ReviewResponse = await response.json()

          setReviews(reviewData.results)
          setReviewsFetched(true)
        } catch (error) {
          console.error("Error fetching TV reviews:", error)
          setReviews([])
          setReviewsFetched(true)
        }
      })
    }
  }

  const backdropPath = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : "/placeholder-backdrop.svg"

  const posterPath = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : null

  const firstAirDate = show.first_air_date
    ? new Date(show.first_air_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Air date unknown"

  const voteAverage = show.vote_average
    ? Math.round(show.vote_average * 10) / 10
    : null

  const genres = show.genres || []
  const cast = show.credits?.cast || []
  const similarShows = show.similar?.results || []
  const seasons = show.seasons || []

  const creator = show.credits?.crew?.find(
    (person) => person.job === "Creator" || person.job === "Executive Producer",
  )

  return (
    <>
      <div className="relative w-full min-h-[500px] md:min-h-[600px]">
        <div className="absolute inset-0">
          <img
            src={backdropPath || "/placeholder.svg"}
            alt={show.name || "TV Show backdrop"}
            className="object-cover absolute top-0 left-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="relative pt-32 pb-8 md:pt-40 md:pb-16">
          <div className="container px-4">
            <div className="grid items-start gap-8 md:grid-cols-[300px_1fr]">
              <div className="relative hidden overflow-hidden rounded-lg shadow-lg md:block aspect-[2/3]">
                {posterPath ? (
                  <img
                    src={posterPath}
                    alt={show.name || "TV show poster"}
                    className="object-cover absolute top-0 left-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Tv className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  {show.name || "Untitled TV Show"}
                </h1>

                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Link
                      key={genre.id}
                      href={`/discover?media_type=tv&with_genres=${genre.id}`}
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
                    <span>First aired: {firstAirDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {seasons.length}{" "}
                      {seasons.length === 1 ? "Season" : "Seasons"}
                    </span>
                  </div>

                  {(show.status === "Ended" ||
                    show.status === "Canceled" ||
                    show.status === "Cancelled") && (
                    <div className="flex items-center gap-1">
                      <InfoIcon className="w-4 h-4 text-muted-foreground" />
                      <span>Status: {show.status}</span>
                    </div>
                  )}

                  {show.original_language &&
                    show.original_language !== "en" && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Language:</span>
                        <span>{getLanguageName(show.original_language)}</span>
                      </div>
                    )}
                </div>

                {creator && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Creator: </span>
                    <Link
                      href={`/person/${creator.id}`}
                      className={"hover:underline"}
                    >
                      {creator.name}
                    </Link>
                  </div>
                )}

                <p className="text-muted-foreground max-w-prose">
                  {show.overview || "No overview available."}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild>
                    <Link href={`/watch/tv/${id}/season/1/episode/1`}>
                      Watch Now
                    </Link>
                  </Button>

                  <TrailerDialog
                    mediaType="tv"
                    mediaId={id}
                    title={show.name || "TV Show"}
                  >
                    <Button variant="outline">Watch Trailer</Button>
                  </TrailerDialog>

                  <DownloadModal
                    mediaType="tv"
                    tmdbId={id}
                    title={show.name || "TV Show"}
                    seasons={seasons}
                  />

                  <WatchlistDropdown
                    mediaId={id}
                    mediaType="tv"
                    title={show.name || "TV Show"}
                    posterPath={show.poster_path}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-8">
        <Tabs
          defaultValue="seasons"
          className="space-y-8"
          onValueChange={handleTabChange}
        >
          <TabsList>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="similar">Similar Shows</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="seasons" className="space-y-6">
            <h2 className="text-2xl font-semibold">Seasons</h2>
            <Separator />
            {seasons.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {seasons.map((season) => (
                  <AccordionItem
                    key={season.id}
                    value={`season-${season.season_number}`}
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{season.name}</span>
                        <Badge variant="outline">
                          {season.episode_count} Episodes
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                        <div className="relative overflow-hidden rounded-md aspect-[2/3]">
                          {season.poster_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                              alt={season.name}
                              className="object-cover absolute top-0 left-0 w-full h-full"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <Tv className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          {season.air_date && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">
                                Air Date:{" "}
                              </span>
                              {new Date(season.air_date).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                },
                              )}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {season.overview ||
                              "No overview available for this season."}
                          </p>
                          <Button
                            size="sm"
                            asChild
                            variant={
                              cn(
                                season.episode_count > 0
                                  ? "default"
                                  : "outline",
                              ) as "default" | "outline"
                            }
                            className={cn(
                              season.episode_count === 0 &&
                                "cursor-not-allowed opacity-50",
                            )}
                          >
                            <Link
                              href={{
                                pathname: `/watch/tv/${id}/season/${season.season_number}/episode/1`,
                                query: { source: `/tv/${id}` },
                              }}
                              className={cn(
                                season.episode_count === 0 &&
                                  "pointer-events-none",
                              )}
                            >
                              Watch Season
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">
                  No season data available.
                </p>
              </div>
            )}
          </TabsContent>

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
            <h2 className="text-2xl font-semibold">Similar Shows</h2>
            <Separator />
            {similarShows.length > 0 ? (
              <MediaRow
                items={similarShows
                  .slice(0, 8)
                  .map((item) => ({ ...item, media_type: "tv" }))}
              />
            ) : (
              <div className="p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">
                  No similar shows available.
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
