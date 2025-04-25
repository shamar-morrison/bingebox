import TVShowDetailsClient from "@/components/tv-details-client"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchTVDetails } from "@/lib/tmdb"
import type { Metadata } from "next"
import { Suspense } from "react"

interface TVShowPageProps {
  params: { id: string }
}

export async function generateMetadata({
  params,
}: TVShowPageProps): Promise<Metadata> {
  const show = await fetchTVDetails(Number.parseInt(params.id))

  return {
    title: `${show.name || "TV Show"} | BingeBox`,
    description: show.overview || "Watch this TV show on BingeBox",
  }
}

export default async function TVShowPage({ params }: TVShowPageProps) {
  const showId = Number.parseInt(params.id)

  const initialShow = await fetchTVDetails(showId)

  return (
    <main className="min-h-screen pb-16">
      <Suspense fallback={<TVShowDetailsSkeleton />}>
        <TVShowDetailsClient initialData={initialShow} id={showId} />
      </Suspense>
    </main>
  )
}

function TVShowDetailsSkeleton() {
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
      <div className="container px-4 mt-8">
        <div className="space-y-8">
          <div className="flex space-x-4 border-b">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <Skeleton className="h-px w-full" />
            <div className="space-y-2 border rounded-md divide-y">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex justify-between items-center p-4">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
