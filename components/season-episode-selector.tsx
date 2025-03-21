"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface SeasonEpisodeSelectorProps {
  showId: number
  currentSeasonNumber: number
  currentEpisodeNumber: number
  seasons: {
    id: number
    name: string
    season_number: number
    episode_count: number
  }[]
  episodes: {
    id: number
    name: string
    episode_number: number
  }[]
  source?: string
}

export function SeasonEpisodeSelector({
  showId,
  currentSeasonNumber,
  currentEpisodeNumber,
  seasons,
  episodes,
  source,
}: SeasonEpisodeSelectorProps) {
  const router = useRouter()
  const sourceParam = source ? `?source=${source}` : ""

  const handleSeasonChange = (value: string) => {
    router.push(`/watch/tv/${showId}/season/${value}/episode/1${sourceParam}`)
  }

  const handleEpisodeChange = (value: string) => {
    router.push(
      `/watch/tv/${showId}/season/${currentSeasonNumber}/episode/${value}${sourceParam}`,
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-2">
      <div className="flex flex-col gap-1 flex-1">
        <label
          htmlFor="season-select"
          className="text-sm text-muted-foreground"
        >
          Season
        </label>
        <Select
          value={currentSeasonNumber.toString()}
          onValueChange={handleSeasonChange}
        >
          <SelectTrigger
            id="season-select"
            className="border-input bg-background"
          >
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            {seasons.map((season) => (
              <SelectItem
                key={season.id}
                value={season.season_number.toString()}
              >
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <label
          htmlFor="episode-select"
          className="text-sm text-muted-foreground"
        >
          Episode
        </label>
        <Select
          value={currentEpisodeNumber.toString()}
          onValueChange={handleEpisodeChange}
        >
          <SelectTrigger
            id="episode-select"
            className="border-input bg-background"
          >
            <SelectValue placeholder="Select episode" />
          </SelectTrigger>
          <SelectContent>
            {episodes.map((episode) => (
              <SelectItem
                key={episode.id}
                value={episode.episode_number.toString()}
              >
                E{episode.episode_number} - {episode.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
