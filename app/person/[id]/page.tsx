import { Suspense } from "react"
import Image from "next/image"
import type { Metadata } from "next"
import { CalendarIcon, MapPin } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import MediaGrid from "@/components/media-grid"
import { fetchPersonDetails } from "@/lib/tmdb"

interface PersonPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: PersonPageProps): Promise<Metadata> {
  const person = await fetchPersonDetails(Number.parseInt(params.id))

  return {
    title: `${person.name || "Person"} | StreamFlix`,
    description: person.biography?.slice(0, 160) || `View ${person.name}'s movies and TV shows`,
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
    : `/placeholder.svg?height=750&width=500&text=${encodeURIComponent(person.name || "Unknown")}`

  const birthday = person.birthday
    ? new Date(person.birthday).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown"

  const age =
    person.birthday && !person.deathday ? new Date().getFullYear() - new Date(person.birthday).getFullYear() : null

  const movieCredits = person.movie_credits?.cast || []
  const tvCredits = person.tv_credits?.cast || []

  // Sort credits by popularity
  const sortedMovieCredits = [...movieCredits].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
  const sortedTVCredits = [...tvCredits].sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

  return (
    <>
      <div className="container px-4 py-24 mt-16">
        <div className="grid gap-8 md:grid-cols-[300px_1fr]">
          <div>
            <div className="overflow-hidden rounded-lg shadow-lg">
              <Image
                src={profilePath || "/placeholder.svg"}
                alt={person.name || "Person"}
                width={300}
                height={450}
                className="object-cover w-full"
              />
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <h2 className="text-sm font-medium text-muted-foreground">Personal Info</h2>
                <Separator className="my-2" />
              </div>

              <div>
                <h3 className="text-sm font-medium">Known For</h3>
                <p className="text-sm">{person.known_for_department || "Acting"}</p>
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
                <p className="text-muted-foreground whitespace-pre-line">{person.biography}</p>
              </div>
            )}

            <Tabs defaultValue="movies" className="mt-8">
              <TabsList>
                <TabsTrigger value="movies">Movies</TabsTrigger>
                <TabsTrigger value="tv">TV Shows</TabsTrigger>
              </TabsList>

              <TabsContent value="movies" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Movie Appearances</h2>
                {sortedMovieCredits.length > 0 ? (
                  <MediaGrid items={sortedMovieCredits.map((item) => ({ ...item, media_type: "movie" }))} />
                ) : (
                  <div className="p-8 text-center border rounded-lg">
                    <p className="text-muted-foreground">No movie credits found.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="tv" className="mt-6">
                <h2 className="text-xl font-semibold mb-4">TV Show Appearances</h2>
                {sortedTVCredits.length > 0 ? (
                  <MediaGrid items={sortedTVCredits.map((item) => ({ ...item, media_type: "tv" }))} />
                ) : (
                  <div className="p-8 text-center border rounded-lg">
                    <p className="text-muted-foreground">No TV credits found.</p>
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

export function PersonDetailsSkeleton() {
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

