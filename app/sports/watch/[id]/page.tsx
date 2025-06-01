import { AlertTriangle, ArrowLeft, Clock } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import SportsPlayer from "@/components/sports-player"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchLiveMatches,
  fetchPopularMatches,
  fetchStreams,
  type Match,
} from "@/lib/streamed"
import type { Metadata } from "next"

interface Props {
  params: { id: string }
}

async function fetchMatchDetails(id: string): Promise<Match | null> {
  try {
    // First try to find the match in live matches
    const liveMatches = await fetchLiveMatches()
    const liveMatch = liveMatches.find((m) => m.id === id)
    if (liveMatch) return liveMatch

    // Then try popular matches
    const popularMatches = await fetchPopularMatches()
    const popularMatch = popularMatches.find((m) => m.id === id)
    if (popularMatch) return popularMatch

    return null
  } catch (error) {
    console.error("Error fetching match details:", error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const match = await fetchMatchDetails(params.id)

  return {
    title: match
      ? `Watch ${match.title} | BingeBox`
      : "Watch Sports | BingeBox",
    description: match
      ? `Watch ${match.title} live stream for free`
      : "Watch live sports streams for free",
  }
}

export default function WatchPage({ params }: Props) {
  return (
    <main className="min-h-screen pb-10 pt-20">
      <Suspense fallback={<WatchSkeleton />}>
        <WatchContent matchId={params.id} />
      </Suspense>
    </main>
  )
}

async function WatchContent({ matchId }: { matchId: string }) {
  const match = await fetchMatchDetails(matchId)

  if (!match) {
    return <MatchNotFoundUI />
  }

  const matchDate = new Date(match.date)
  const now = Date.now()
  const isLive = now >= match.date && now - match.date <= 3 * 60 * 60 * 1000

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{match.title}</h1>
                {isLive && (
                  <Badge variant="destructive" className="animate-pulse">
                    <span className="inline-block w-2 h-2 bg-current rounded-full mr-1"></span>
                    LIVE
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{match.category}</p>
            </div>
          </div>

          {match.teams && (
            <div className="max-w-md">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-medium">
                          {match.teams.home?.name || "TBA"}
                        </p>
                        <p className="text-sm text-muted-foreground">Home</p>
                      </div>
                    </div>

                    <div className="text-center px-4">
                      <div className="text-sm text-muted-foreground">VS</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">
                          {match.teams.away?.name || "TBA"}
                        </p>
                        <p className="text-sm text-muted-foreground">Away</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {isLive ? (
                      <span>Live Now</span>
                    ) : (
                      <span>
                        {matchDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        @{" "}
                        {matchDate
                          .toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                          .toUpperCase()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="container px-4 mt-8">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Watch Stream</h2>

          {match.sources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No streams available for this match
                </p>
              </CardContent>
            </Card>
          ) : (
            <Suspense fallback={<StreamSkeleton />}>
              <StreamPlayer sources={match.sources} title={match.title} />
            </Suspense>
          )}
        </div>
      </div>
    </>
  )
}

async function StreamPlayer({
  sources,
  title,
}: {
  sources: Array<{ source: string; id: string }>
  title: string
}) {
  const allStreams = []

  for (const source of sources) {
    try {
      const streams = await fetchStreams(source.source, source.id)
      allStreams.push(...streams)
    } catch (error) {
      console.error(`Error fetching streams for ${source.source}:`, error)
    }
  }

  if (allStreams.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No streams available for this match
          </p>
        </CardContent>
      </Card>
    )
  }

  return <SportsPlayer streams={allStreams} title={title} />
}

function WatchSkeleton() {
  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Skeleton className="h-10 w-10" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-5 w-32" />
            </div>
          </div>
          <Skeleton className="h-32 w-80" />
        </div>
      </div>

      <div className="container px-4 mt-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <StreamSkeleton key={i} />
            ))}
        </div>
      </div>
    </>
  )
}

function StreamSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="w-full aspect-video rounded-lg" />
    </div>
  )
}

function MatchNotFoundUI() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center pt-20">
      <div className="container px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Match Not Found</h1>
            <p className="text-muted-foreground">
              Sorry, we couldn&#39;t find the sports match you&#39;re looking
              for. It may have been removed or the link might be incorrect.
            </p>
          </div>

          <Link href="/sports" className="block mb-8">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4" />
              Back to Sports
            </Button>
          </Link>

          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Looking for something specific? Try browsing our live matches or
              check back later for upcoming games.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
