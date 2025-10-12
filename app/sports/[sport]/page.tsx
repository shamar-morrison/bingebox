import { Users } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchSportMatches, type Match } from "@/lib/streamed"
import type { Metadata } from "next"
import { categoryToTitleCase } from "@/lib/utils"

interface Props {
  params: { sport: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const sportName = params.sport.charAt(0).toUpperCase() + params.sport.slice(1)

  return {
    title: `${sportName} - Live Streams | BingeBox`,
    description: `Watch live ${sportName} matches and streams for free`,
  }
}

export default function SportPage({ params }: Props) {
  const sportName = params.sport.charAt(0).toUpperCase() + params.sport.slice(1)

  return (
    <main className="min-h-screen pb-10 pt-20">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
        <div className="container px-4 py-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                {categoryToTitleCase(sportName)}
              </h1>
            </div>
            <p className="text-xl text-muted-foreground mb-8">
              Watch live {sportName.toLowerCase()} matches and events from
              around the world.
            </p>
          </div>
        </div>
      </div>

      <div className="container px-4 mt-8">
        <Suspense fallback={<MatchesSkeleton />}>
          <SportMatches sport={params.sport} />
        </Suspense>
      </div>
    </main>
  )
}

async function SportMatches({ sport }: { sport: string }) {
  const matches = await fetchSportMatches(sport)

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">
            No matches available for this sport at the moment
          </p>
          <Button asChild className="mt-4">
            <Link href="/sports">Browse other sports</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const now = Date.now()
  const liveMatches = matches.filter((match) => {
    const matchTime = match.date
    const timeDiff = now - matchTime
    return timeDiff >= 0 && timeDiff <= 3 * 60 * 60 * 1000 // Within 3 hours of start time
  })

  const upcomingMatches = matches.filter((match) => match.date > now)
  const recentMatches = matches.filter((match) => {
    const timeDiff = now - match.date
    return timeDiff > 3 * 60 * 60 * 1000 // More than 3 hours past start time
  })

  return (
    <div className="space-y-8">
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">Live Now</h2>
            <Badge variant="destructive" className="animate-pulse">
              <span className="inline-block w-2 h-2 bg-current rounded-full mr-1"></span>
              LIVE
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} isLive />
            ))}
          </div>
        </section>
      )}

      {upcomingMatches.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.slice(0, 12).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}

      {recentMatches.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentMatches.slice(0, 9).map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </section>
      )}
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
      <CardContent className="flex flex-col h-[120px]">
        <div className="flex-1 flex items-center justify-center">
          {match.teams ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {match.teams.home?.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">VS</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {match.teams.away?.name}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Teams TBA</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t mt-auto">
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
    <div className="space-y-8">
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
    </div>
  )
}
