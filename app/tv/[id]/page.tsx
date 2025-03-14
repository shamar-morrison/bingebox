import { Suspense } from "react"
import Image from "next/image"
import type { Metadata } from "next"
import { CalendarIcon, Clock, Star } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import TrailerDialog from "@/components/trailer-dialog"
import CastSection from "@/components/cast-section"
import MediaRow from "@/components/media-row"
import { fetchTVDetails } from "@/lib/tmdb"

interface TVShowPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: TVShowPageProps): Promise<Metadata> {
  const show = await fetchTVDetails(Number.parseInt(params.id))

  return {
    title: `${show.name || "TV Show"} | StreamFlix`,
    description: show.overview || "Watch this TV show on StreamFlix",
  }
}

export default async function TVShowPage({ params }: TVShowPageProps) {
  const showId = Number.parseInt(params.id)

  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<TVShowDetailsSkeleton />}>
        <TVShowDetails id={showId} />
      </Suspense>
    </main>
  )
}

async function TVShowDetails({ id }: { id: number }) {
  const show = await fetchTVDetails(id)

  const backdropPath = show.backdrop_path
    ? `https://image.tmdb.org/t/p/original${show.backdrop_path}`
    : "/placeholder.svg?height=1080&width=1920"

  const posterPath = show.poster_path
    ? `https://image.tmdb.org/t/p/w500${show.poster_path}`
    : "/placeholder.svg?height=750&width=500"

  const firstAirDate = show.first_air_date
    ? new Date(show.first_air_date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Air date unknown"

  const voteAverage = show.vote_average ? Math.round(show.vote_average * 10) / 10 : null

  const genres = show.genres || []
  const cast = show.credits?.cast || []
  const similarShows = show.similar?.results || []
  const seasons = show.seasons || []

  const creator = show.credits?.crew?.find((person) => person.job === "Creator" || person.job === "Executive Producer")

  return (
    <>
      <div className="relative w-full h-[500px] md:h-[600px]">
        <div className="absolute inset-0">
          <Image
            src={backdropPath || "/placeholder.svg"}
            alt={show.name || "TV Show backdrop"}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container px-4">
            <div className="grid items-center gap-8 md:grid-cols-[300px_1fr]">
              <div className="relative hidden overflow-hidden rounded-lg shadow-lg md:block aspect-[2/3]">
                <Image
                  src={posterPath || "/placeholder.svg"}
                  alt={show.name || "TV Show poster"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  {show.name || "Untitled TV Show"}
                </h1>

                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Badge key={genre.id} variant="secondary">
                      {genre.name}
                    </Badge>
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
                      {seasons.length} {seasons.length === 1 ? "Season" : "Seasons"}
                    </span>
                  </div>
                </div>

                {creator && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Creator: </span>
                    <span>{creator.name}</span>
                  </div>
                )}

                <p className="text-muted-foreground">{show.overview || "No overview available."}</p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild>
                    <a href={`/watch/tv/${id}/season/1/episode/1`}>Watch Now</a>
                  </Button>

                  <TrailerDialog mediaType="tv" mediaId={id} title={show.name || "TV Show"}>
                    <Button variant="outline">Watch Trailer</Button>
                  </TrailerDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-8">
        <Tabs defaultValue="seasons" className="space-y-8">
          <TabsList>
            <TabsTrigger value="seasons">Seasons</TabsTrigger>
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="similar">Similar Shows</TabsTrigger>
          </TabsList>

          <TabsContent value="seasons" className="space-y-6">
            <h2 className="text-2xl font-semibold">Seasons</h2>
            <Separator />
            {seasons.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {seasons.map((season) => (
                  <AccordionItem key={season.id} value={`season-${season.season_number}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{season.name}</span>
                        <Badge variant="outline">{season.episode_count} Episodes</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                        {season.poster_path && (
                          <div className="relative overflow-hidden rounded-md aspect-[2/3]">
                            <Image
                              src={`https://image.tmdb.org/t/p/w300${season.poster_path}`}
                              alt={season.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          {season.air_date && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Air Date: </span>
                              {new Date(season.air_date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {season.overview || "No overview available for this season."}
                          </p>
                          <Button size="sm" asChild>
                            <a href={`/watch/tv/${id}/season/${season.season_number}`}>Watch Season</a>
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">No season information available.</p>
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
                <p className="text-muted-foreground">No cast information available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="similar" className="space-y-6">
            <h2 className="text-2xl font-semibold">Similar TV Shows</h2>
            <Separator />
            {similarShows.length > 0 ? (
              <MediaRow items={similarShows.slice(0, 8).map((item) => ({ ...item, media_type: "tv" }))} />
            ) : (
              <div className="p-8 text-center border rounded-lg">
                <p className="text-muted-foreground">No similar TV shows available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

export function TVShowDetailsSkeleton() {
  return (
    <>
      <div className="relative w-full h-[500px] md:h-[600px]">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container px-4">
            <div className="grid items-center gap-8 md:grid-cols-[300px_1fr]">
              <Skeleton className="hidden w-full md:block aspect-[2/3] rounded-lg" />

              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />

                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>

                <div className="flex gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>

                <Skeleton className="h-4 w-40" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

