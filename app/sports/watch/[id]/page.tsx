import { ChevronLeft, Clock, Globe, Wifi } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Suspense } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <main className="min-h-screen pb-10">
      <Suspense fallback={<WatchSkeleton />}>
        <WatchContent matchId={params.id} />
      </Suspense>
    </main>
  )
}

async function WatchContent({ matchId }: { matchId: string }) {
  const match = await fetchMatchDetails(matchId)

  if (!match) {
    notFound()
  }

  const matchDate = new Date(match.date)
  const now = Date.now()
  const isLive = now >= match.date && now - match.date <= 3 * 60 * 60 * 1000

  return (
    <>
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container px-4 py-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/sports">
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </Button>
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
                      {match.teams.home?.badge && (
                        <img
                          src={match.teams.home.badge}
                          alt={match.teams.home.name}
                          className="w-8 h-8"
                        />
                      )}
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
                      {match.teams.away?.badge && (
                        <img
                          src={match.teams.away.badge}
                          alt={match.teams.away.name}
                          className="w-8 h-8"
                        />
                      )}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {isLive ? (
                      <span>Live Now</span>
                    ) : (
                      <span>
                        {matchDate.toLocaleDateString()} at{" "}
                        {matchDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
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
        <h2 className="text-2xl font-bold mb-6">Available Streams</h2>

        {match.sources.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No streams available for this match
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {match.sources.map((source, index) => (
              <Suspense
                key={`${source.source}-${source.id}`}
                fallback={<StreamSkeleton />}
              >
                <StreamCard
                  source={source.source}
                  id={source.id}
                  sourceIndex={index + 1}
                />
              </Suspense>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

async function StreamCard({
  source,
  id,
  sourceIndex,
}: {
  source: string
  id: string
  sourceIndex: number
}) {
  const streams = await fetchStreams(source, id)

  if (streams.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Source {sourceIndex}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No streams available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Source {sourceIndex}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {streams.length} stream{streams.length !== 1 ? "s" : ""} available
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {streams.map((stream) => (
          <div
            key={stream.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">
                    Stream {stream.streamNo}
                  </span>
                  {stream.hd && (
                    <Badge variant="secondary" className="text-xs">
                      HD
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Globe className="w-3 h-3" />
                  <span>{stream.language}</span>
                </div>
              </div>
            </div>

            <Button size="sm" asChild>
              <a
                href={stream.embedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Wifi className="w-3 h-3" />
                Watch
              </a>
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
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
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
      </CardContent>
    </Card>
  )
}
