import Link from "next/link"
import { Suspense } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  fetchLiveMatches,
  fetchPopularMatches,
  fetchSports,
  type Match,
} from "@/lib/streamed"
import type { Metadata } from "next"
import { categoryToTitleCase } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Sports - Live Sports Streams | BingeBox",
  description:
    "Watch live sports streams for free - Football, Basketball, Hockey and more",
}

export default function SportsPage() {
  return (
    <main className="min-h-screen pb-20 pt-20">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container px-4 py-16">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Live Sports Streams
            </h1>
            <p className="text-xl text-muted-foreground">
              Watch live sports events from around the world. Football,
              Basketball, Hockey, and more.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-8 space-y-8">
        <section id="live-now">
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">Live Now</h2>
            <Badge variant="destructive" className="animate-pulse">
              <span className="inline-block w-2 h-2 bg-current rounded-full mr-1"></span>
              LIVE
            </Badge>
          </div>
          <Suspense fallback={<MatchesSkeleton />}>
            <LiveMatches />
          </Suspense>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Sports</h2>
          </div>
          <Suspense fallback={<SportsSkeleton />}>
            <SportsGrid />
          </Suspense>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Popular Matches</h2>
          </div>
          <Suspense fallback={<MatchesSkeleton />}>
            <PopularMatches />
          </Suspense>
        </section>
      </div>
    </main>
  )
}

async function LiveMatches() {
  const matches = await fetchLiveMatches()

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No live matches at the moment</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.slice(0, 6).map((match) => (
        <MatchCard key={match.id} match={match} isLive />
      ))}
    </div>
  )
}

async function SportsGrid() {
  const sports = await fetchSports()

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {sports.map((sport) => (
        <Link
          key={sport.id}
          href={`/sports/${sport.id}`}
          className="p-4 border rounded-lg hover:bg-accent transition-colors text-center"
        >
          <h3 className="font-medium">{sport.name}</h3>
        </Link>
      ))}
    </div>
  )
}

async function PopularMatches() {
  const matches = await fetchPopularMatches()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {matches.slice(0, 6).map((match) => (
        <MatchCard key={match.id} match={match} />
      ))}
    </div>
  )
}

function MatchCard({
  match,
  isLive = false,
}: {
  match: Match
  isLive?: boolean
}) {
  const matchDate = new Date(match.date)
  const now = Date.now()
  const isUpcoming = match.date > now

  const formatDateTime = (date: Date) => {
    return `${date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })} @ ${date
      .toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toUpperCase()}`
  }

  return (
    <Card className={isLive ? "border-destructive" : ""}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg leading-tight">{match.title}</CardTitle>
          {isLive && (
            <Badge variant="destructive" className="text-xs">
              LIVE
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {categoryToTitleCase(match.category)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pt-3 border-t">
          {isUpcoming ? (
            <div className="text-xs text-muted-foreground">
              {formatDateTime(matchDate)}
            </div>
          ) : (
            <>
              <div className="text-xs text-muted-foreground">
                {isLive ? "Live" : formatDateTime(matchDate)}
              </div>
              <Button size="sm" asChild>
                <Link href={`/sports/watch/${match.id}`}>
                  {isLive ? "Watch" : "View"}
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function MatchesSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array(6)
        .fill(0)
        .map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div className="flex justify-between pt-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  )
}

function SportsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array(12)
        .fill(0)
        .map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
    </div>
  )
}
