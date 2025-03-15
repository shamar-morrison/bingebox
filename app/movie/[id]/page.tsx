import { CalendarIcon, Clock, Download, Star } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import { Suspense } from "react"

import CastSection from "@/components/cast-section"
import MediaRow from "@/components/media-row"
import MovieDownloadDialog from "@/components/movie-download-dialog"
import TrailerDialog from "@/components/trailer-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchMovieDetails } from "@/lib/tmdb"

interface MoviePageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const movie = await fetchMovieDetails(Number.parseInt(params.id))

  return {
    title: `${movie.title || "Movie"} | BingeBox`,
    description: movie.overview || "Watch this movie on BingeBox",
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  const movieId = Number.parseInt(params.id)

  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<MovieDetailsSkeleton />}>
        <MovieDetails id={movieId} />
      </Suspense>
    </main>
  )
}

async function MovieDetails({ id }: { id: number }) {
  const movie = await fetchMovieDetails(id)

  const backdropPath = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : "/placeholder-backdrop.svg"

  const posterPath = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.svg"

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
          <Image
            src={backdropPath || "/placeholder.svg"}
            alt={""}
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        </div>

        <div className="relative pt-32 pb-8 md:pt-40 md:pb-16">
          <div className="container px-4">
            <div className="grid items-start gap-8 md:grid-cols-[300px_1fr]">
              <div className="relative hidden overflow-hidden rounded-lg shadow-lg md:block aspect-[2/3]">
                <Image
                  src={posterPath || "/placeholder.svg"}
                  alt={movie.title || "Movie poster"}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  {movie.title || "Untitled Movie"}
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
                    <span>{releaseDate}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{runtime}</span>
                  </div>
                </div>

                {director && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Director: </span>
                    <span>{director.name}</span>
                  </div>
                )}

                <p className="text-muted-foreground max-w-prose">
                  {movie.overview || "No overview available."}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button asChild>
                    <a href={`/watch/movie/${id}`}>Watch Now</a>
                  </Button>

                  <TrailerDialog
                    mediaType="movie"
                    mediaId={id}
                    title={movie.title || "Movie"}
                  >
                    <Button variant="outline">Watch Trailer</Button>
                  </TrailerDialog>

                  <MovieDownloadDialog
                    movieId={id}
                    imdbId={movie.external_ids?.imdb_id}
                    title={movie.title || "Movie"}
                  >
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </MovieDownloadDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-8">
        <Tabs defaultValue="cast" className="space-y-8">
          <TabsList>
            <TabsTrigger value="cast">Cast</TabsTrigger>
            <TabsTrigger value="similar">Similar Movies</TabsTrigger>
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
        </Tabs>
      </div>
    </>
  )
}

export function MovieDetailsSkeleton() {
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
