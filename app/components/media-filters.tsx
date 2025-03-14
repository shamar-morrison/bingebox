"use client"

import { Loader2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Genre {
  id: number
  name: string
}

interface MediaFiltersProps {
  mediaType: "movie" | "tv"
}

const ratingOptions = [
  { value: "all", label: "All Ratings" },
  { value: "9", label: "9+ Rating" },
  { value: "8", label: "8+ Rating" },
  { value: "7", label: "7+ Rating" },
  { value: "6", label: "6+ Rating" },
  { value: "5", label: "5+ Rating" },
]

const yearOptions = () => {
  const currentYear = new Date().getFullYear()
  const years = [{ value: "all", label: "All Years" }]
  for (let year = currentYear; year >= 1900; year--) {
    years.push({ value: year.toString(), label: year.toString() })
  }
  return years
}

const languageOptions = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "hi", label: "Hindi" },
]

export default function MediaFilters({ mediaType }: MediaFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [genres, setGenres] = useState<Genre[]>([])
  const [selectedGenre, setSelectedGenre] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<string>("")
  const [selectedRating, setSelectedRating] = useState<string>("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("")
  const [sortBy, setSortBy] = useState("popularity.desc")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`/api/genres?media_type=${mediaType}`)
        if (!response.ok) throw new Error("Failed to fetch genres")
        const data = await response.json()
        setGenres(data.genres || [])
      } catch (error) {
        console.error("Error fetching genres:", error)
      }
    }

    fetchGenres()
  }, [mediaType])

  useEffect(() => {
    const genreParam = searchParams.get("with_genres")

    let yearParam = null

    if (mediaType === "movie") {
      yearParam = searchParams.get("primary_release_year")
    } else if (mediaType === "tv") {
      yearParam = searchParams.get("first_air_date_year")
    }

    // Last fallback - check date ranges
    if (!yearParam) {
      const movieDateGte = searchParams.get("primary_release_date.gte")
      const tvDateGte = searchParams.get("first_air_date.gte")

      if (mediaType === "movie" && movieDateGte) {
        yearParam = movieDateGte.split("-")[0]
      } else if (mediaType === "tv" && tvDateGte) {
        yearParam = tvDateGte.split("-")[0]
      }
    }

    const ratingParam = searchParams.get("vote_average.gte")
    const languageParam = searchParams.get("with_original_language")
    const sortParam = searchParams.get("sort_by")

    if (genreParam) {
      setSelectedGenre(genreParam)
    } else {
      setSelectedGenre("all")
    }

    if (yearParam) {
      setSelectedYear(yearParam)
    } else {
      setSelectedYear("all")
    }

    if (ratingParam) {
      setSelectedRating(ratingParam)
    } else {
      setSelectedRating("all")
    }

    if (languageParam) {
      setSelectedLanguage(languageParam)
    } else {
      setSelectedLanguage("all")
    }

    if (sortParam) {
      setSortBy(sortParam)
    } else {
      setSortBy("popularity.desc")
    }
  }, [searchParams, mediaType])

  const applyFilter = (paramName: string, value: string) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())

    if (value && value !== "all") {
      if (paramName === "year") {
        // Clear all year-related parameters first
        params.delete("year")
        params.delete("primary_release_year")
        params.delete("first_air_date_year")
        params.delete("primary_release_date.gte")
        params.delete("primary_release_date.lte")
        params.delete("first_air_date.gte")
        params.delete("first_air_date.lte")

        if (mediaType === "movie") {
          params.set("primary_release_year", value)
        } else {
          params.set("first_air_date_year", value)
        }
      } else if (paramName === "vote_average.gte") {
        params.set(paramName, value)
      } else {
        params.set(paramName, value)
      }
    } else {
      params.delete(paramName)

      if (paramName === "year") {
        // Clear all year-related parameters
        params.delete("primary_release_date.gte")
        params.delete("primary_release_date.lte")
        params.delete("first_air_date.gte")
        params.delete("first_air_date.lte")
        params.delete("primary_release_year")
        params.delete("first_air_date_year")
        params.delete("year")

        // Reset sort to popularity
        params.set("sort_by", "popularity.desc")
      }
    }

    params.set("media_type", mediaType)
    params.set("page", "1")

    const finalUrl = `${pathname}?${params.toString()}`
    console.log("Final filter URL:", finalUrl)

    router.push(finalUrl)
  }

  const resetFilters = () => {
    setIsLoading(true)
    setSelectedGenre("all")
    setSelectedYear("all")
    setSelectedRating("all")
    setSelectedLanguage("all")
    setSortBy("popularity.desc")

    const params = new URLSearchParams()
    params.set("media_type", mediaType)
    params.set("sort_by", "popularity.desc")
    params.set("page", "1")

    // Make sure all filter parameters are cleared
    params.delete("with_genres")
    params.delete("vote_average.gte")
    params.delete("with_original_language")
    params.delete("year")
    params.delete("primary_release_year")
    params.delete("first_air_date_year")
    params.delete("primary_release_date.gte")
    params.delete("primary_release_date.lte")
    params.delete("first_air_date.gte")
    params.delete("first_air_date.lte")

    router.push(`${pathname}?${params.toString()}`)
  }

  useEffect(() => {
    setIsLoading(false)
  }, [searchParams])

  return (
    <div className="flex flex-wrap gap-3 mb-8 items-center">
      {/* Genre Filter */}
      <div className="relative">
        <Select
          value={selectedGenre}
          onValueChange={(value) => applyFilter("with_genres", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genres</SelectItem>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.id.toString()}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year Filter */}
      <div className="relative">
        <Select
          value={selectedYear}
          onValueChange={(value) => applyFilter("year", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {yearOptions().map((year) => (
              <SelectItem key={year.value} value={year.value}>
                {year.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Language Filter */}
      <div className="relative">
        <Select
          value={selectedLanguage}
          onValueChange={(value) =>
            applyFilter("with_original_language", value)
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            {languageOptions.map((language) => (
              <SelectItem key={language.value} value={language.value}>
                {language.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Rating Filter */}
      <div className="relative">
        <Select
          value={selectedRating}
          onValueChange={(value) => applyFilter("vote_average.gte", value)}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Quality" />
          </SelectTrigger>
          <SelectContent>
            {ratingOptions.map((rating) => (
              <SelectItem key={rating.value} value={rating.value}>
                {rating.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center text-primary gap-2 ml-3">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Updating...</span>
        </div>
      )}

      {/* Reset Button */}
      {(selectedGenre !== "all" ||
        selectedYear !== "all" ||
        selectedRating !== "all" ||
        selectedLanguage !== "all" ||
        sortBy !== "popularity.desc") && (
        <Button
          variant="outline"
          size="sm"
          className="gap-1 text-muted-foreground ml-auto"
          onClick={resetFilters}
          disabled={isLoading}
        >
          Reset Filters
        </Button>
      )}
    </div>
  )
}
