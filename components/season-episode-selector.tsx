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
}

export function SeasonEpisodeSelector({
  showId,
  currentSeasonNumber,
  currentEpisodeNumber,
  seasons,
  episodes,
}: SeasonEpisodeSelectorProps) {
  const router = useRouter()

  const handleSeasonChange = (value: string) => {
    router.push(`/watch/tv/${showId}/season/${value}/episode/1`)
  }

  const handleEpisodeChange = (value: string) => {
    router.push(
      `/watch/tv/${showId}/season/${currentSeasonNumber}/episode/${value}`,
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 mt-6 mb-2">
      <div className="flex flex-col gap-1 flex-1">
        <label htmlFor="season-select" className="text-sm text-gray-400">
          Season
        </label>
        <Select
          value={currentSeasonNumber.toString()}
          onValueChange={handleSeasonChange}
        >
          <SelectTrigger
            id="season-select"
            className="bg-gray-800 border-gray-700 text-white"
          >
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            {seasons.map((season) => (
              <SelectItem
                key={season.id}
                value={season.season_number.toString()}
                className="focus:bg-gray-700 focus:text-white"
              >
                {season.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <label htmlFor="episode-select" className="text-sm text-gray-400">
          Episode
        </label>
        <Select
          value={currentEpisodeNumber.toString()}
          onValueChange={handleEpisodeChange}
        >
          <SelectTrigger
            id="episode-select"
            className="bg-gray-800 border-gray-700 text-white"
          >
            <SelectValue placeholder="Select episode" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            {episodes.map((episode) => (
              <SelectItem
                key={episode.id}
                value={episode.episode_number.toString()}
                className="focus:bg-gray-700 focus:text-white"
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
