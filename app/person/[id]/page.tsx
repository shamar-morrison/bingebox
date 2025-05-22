import { CalendarIcon, MapPin, User } from "lucide-react"
import type { Metadata } from "next"
import { Suspense } from "react"

import MediaGrid from "@/components/media-grid"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { fetchPersonDetails } from "@/lib/tmdb"
import type { MediaItem } from "@/lib/types"

interface PersonPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: PersonPageProps): Promise<Metadata> {
  const person = await fetchPersonDetails(Number.parseInt(params.id))

  return {
    title: `${person.name || "Person"} | BingeBox - Watch Movies and TV Shows for free`,
    description:
      person.biography?.slice(0, 160) ||
      `View ${person.name}'s movies and TV shows`,
  }
}

export default async function PersonPage({ params }: PersonPageProps) {
  const personId = Number.parseInt(params.id)

  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<PersonDetailsSkeleton />}>
        <PersonDetails id={personId} />
      </Suspense>
    </main>
  )
}

async function PersonDetails({ id }: { id: number }) {
  const person = await fetchPersonDetails(id)

  const profilePath = person.profile_path
    ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
    : ``

  const birthday = person.birthday
    ? new Date(person.birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown"

  const age =
    person.birthday && !person.deathday
      ? new Date().getFullYear() - new Date(person.birthday).getFullYear()
      : null

  const movieCastCredits = person.movie_credits?.cast || []
  const movieCrewCredits = person.movie_credits?.crew || []
  const tvCastCredits = person.tv_credits?.cast || []

  // Sort acting credits by popularity
  const sortedMovieCastCredits = [...movieCastCredits].sort(
    (a, b) => (b.popularity || 0) - (a.popularity || 0),
  )
  const sortedTVCastCredits = [...tvCastCredits].sort(
    (a, b) => (b.popularity || 0) - (a.popularity || 0),
  )

  const directedMovies: MediaItem[] = movieCrewCredits
    .filter((credit) => credit.job === "Director")
    // Map to a structure similar to MediaItem for MediaGrid compatibility
    .map((credit) => ({
      // Fields guaranteed by crew type
      id: credit.id,
      title: credit.title,
      poster_path: credit.poster_path,
      // Add required MediaItem fields with defaults
      media_type: "movie",
      backdrop_path: null, // Default missing fields
      overview: "",
      vote_average: 0,
      // Add any other potentially missing required fields from MediaItem type
      genre_ids: [],
      popularity: 0,
      release_date: "",
      name: credit.title, // Use title for name if needed
    }))
    // Sort directed movies by title
    .sort((a, b) => (a.title || "").localeCompare(b.title || ""))

  return (
    <>
      <div className="container px-4 py-24 mt-16">
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <div>
            <div className="overflow-hidden rounded-lg shadow-lg relative aspect-[2/3]">
              {person.profile_path ? (
                <img
                  src={profilePath}
                  alt={person.name || "Person"}
                  className="object-cover absolute top-0 left-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <User className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">
                  Personal Info
                </h2>
                <Separator className="my-2" />
              </div>

              <div>
                <h3 className="text-sm font-medium">Known For</h3>
                <p className="text-sm">
                  {person.known_for_department || "Acting"}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium">Birthday</h3>
                <p className="text-sm flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  {birthday} {age ? `(${age} years old)` : ""}
                </p>
              </div>

              {person.place_of_birth && (
                <div>
                  <h3 className="text-sm font-medium">Place of Birth</h3>
                  <p className="text-sm flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {person.place_of_birth}
                  </p>
                </div>
              )}

              {person.deathday && (
                <div>
                  <h3 className="text-sm font-medium">Died</h3>
                  <p className="text-sm">
                    {new Date(person.deathday).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-4">{person.name}</h1>

            {person.biography && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-2">Biography</h2>
                <p className="text-muted-foreground whitespace-pre-line">
                  {person.biography}
                </p>
              </div>
            )}

            <Tabs defaultValue="movies" className="mt-8">
              <TabsList>
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="tv">TV Shows</TabsTrigger>
              </TabsList>

              <TabsContent value="movies" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  Movie Appearances (Acting)
                </h2>
                {sortedMovieCastCredits.length > 0 ? (
                  <MediaGrid
                    items={sortedMovieCastCredits.map((item) => ({
                      ...item,
                      media_type: "movie",
                    }))}
                  />
                ) : (
                  <div className="p-8 text-center border rounded-lg">
                    <p className="text-muted-foreground">
                      No acting movie credits found.
                    </p>
                  </div>
                )}

                {/* Directed Movies Section */}
                {directedMovies.length > 0 && (
                  <div className="mt-12">
                    {" "}
                    <h2 className="text-xl font-semibold mb-4">
                      Directed Movies
                    </h2>
                    <Separator className="mb-6" />
                    <MediaGrid items={directedMovies} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tv" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">
                  TV Show Appearances (Acting)
                </h2>
                {sortedTVCastCredits.length > 0 ? (
                  <MediaGrid
                    items={sortedTVCastCredits.map((item) => ({
                      ...item,
                      media_type: "tv",
                    }))}
                  />
                ) : (
                  <div className="p-8 text-center border rounded-lg">
                    <p className="text-muted-foreground">
                      No acting TV credits found.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

function PersonDetailsSkeleton() {
  return (
    <div className="container px-4 py-24 mt-16">
      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        <div>
          <Skeleton className="w-full aspect-[2/3] rounded-lg" />

          <div className="mt-6 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-px w-full" />

            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
            </div>

            <div className="space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </div>

        <div>
          <Skeleton className="h-10 w-48 mb-4" />

          <div className="space-y-2 mb-8">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="mt-8">
            <Skeleton className="h-10 w-48 mb-6" />

            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
