"use client"

import TorrentMovieGrid from "@/components/torrent-movie-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchMovies } from "@/lib/yts"
import { Movie } from "@/lib/yts-types"
import { debounce } from "lodash"
import { ChevronLeft, ChevronRight, Loader2, SearchIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"

export default function TorrentsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalMovies, setTotalMovies] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isChangingPage, setIsChangingPage] = useState(false)

  // Get params from URL or use defaults
  const searchQuery = searchParams.get("query_term") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const quality = searchParams.get("quality") || "all"
  const genre = searchParams.get("genre") || "all"
  const minimumRating = searchParams.get("rating") || "all"
  const sortBy = searchParams.get("sort_by") || "date_added"
  const orderBy = searchParams.get("order_by") || "desc"

  const updateFilters = useCallback(
    (params: Record<string, string>) => {
      const newParams = new URLSearchParams(searchParams.toString())

      // Update or remove parameters
      Object.entries(params).forEach(([key, value]) => {
        if (value && value !== "all") {
          newParams.set(key, value)
        } else {
          newParams.delete(key)
        }
      })

      // Always reset to page 1 when changing filters
      if (!params.page) {
        newParams.set("page", "1")
      }

      router.push(`${pathname}?${newParams.toString()}`)
    },
    [searchParams, router, pathname],
  )

  const loadMovies = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetchMovies({
        page,
        query: searchQuery,
        quality: quality === "all" ? "" : quality,
        minimum_rating:
          minimumRating !== "all" ? Number(minimumRating) : undefined,
        genre: genre === "all" ? "" : genre,
        sort_by: sortBy,
        order_by: orderBy,
      })

      if (response.status === "ok" && response.data.movies) {
        setMovies(response.data.movies)
        setTotalMovies(response.data.movie_count)
        setTotalPages(Math.ceil(response.data.movie_count / 20))
      } else {
        setMovies([])
        setTotalMovies(0)
        setTotalPages(0)
      }
    } catch (error) {
      console.error("Error loading movies:", error)
      setMovies([])
    } finally {
      setIsLoading(false)
      setIsChangingPage(false)
    }
  }, [page, searchQuery, quality, minimumRating, genre, sortBy, orderBy])

  useEffect(() => {
    loadMovies()
  }, [loadMovies])

  const handleSearch = useCallback(
    debounce((value: string) => {
      updateFilters({ query_term: value })
    }, 500),
    [updateFilters],
  )

  const handleQualityChange = (value: string) => {
    updateFilters({ quality: value })
  }

  const handleGenreChange = (value: string) => {
    updateFilters({ genre: value })
  }

  const handleRatingChange = (value: string) => {
    updateFilters({ rating: value })
  }

  const handleSortChange = (value: string) => {
    updateFilters({ sort_by: value })
  }

  const handleOrderChange = (value: string) => {
    updateFilters({ order_by: value })
  }

  const changePage = (newPage: number) => {
    setIsChangingPage(true)
    updateFilters({ page: newPage.toString() })
  }

  const genres = [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Film-Noir",
    "History",
    "Horror",
    "Music",
    "Musical",
    "Mystery",
    "Romance",
    "Sci-Fi",
    "Sport",
    "Thriller",
    "War",
    "Western",
  ]

  const sortOptions = [
    { value: "date_added", label: "Date Added" },
    { value: "title", label: "Title" },
    { value: "year", label: "Year" },
    { value: "rating", label: "Rating" },
    { value: "peers", label: "Peers" },
    { value: "seeds", label: "Seeds" },
    { value: "download_count", label: "Download Count" },
    { value: "like_count", label: "Like Count" },
  ]

  const ratings = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
  const qualities = ["720p", "1080p", "2160p", "3D"]

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    // Adjust start page if end page is at maximum
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === page ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => changePage(i)}
          disabled={i === page || isChangingPage}
          aria-label={`Page ${i}`}
          aria-current={i === page ? "page" : undefined}
        >
          {i}
        </Button>,
      )
    }

    return pageNumbers
  }

  return (
    <main className="container px-4 py-24 mt-16">
      <h1 className="mb-6 text-3xl font-bold">Torrents</h1>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for movies..."
            className="pl-9"
            defaultValue={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Filters section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <div className="space-y-2">
          <label className="text-sm font-medium">Quality</label>
          <Select value={quality} onValueChange={handleQualityChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Quality</SelectItem>
              {qualities.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Minimum Rating</label>
          <Select value={minimumRating} onValueChange={handleRatingChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Rating</SelectItem>
              {ratings.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}+
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Genre</label>
          <Select value={genre} onValueChange={handleGenreChange}>
            <SelectTrigger>
              <SelectValue placeholder="Any Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Genre</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g}>
                  {g}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Sort By</label>
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Order</label>
          <Select value={orderBy} onValueChange={handleOrderChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && !isChangingPage ? (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array(20)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="w-full aspect-[2/3] rounded-lg" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-4" />
              </div>
            ))}
        </div>
      ) : movies.length > 0 ? (
        <>
          <TorrentMovieGrid movies={movies} />

          {totalPages > 1 && (
            <div className="flex flex-col items-center justify-center mt-8 mb-12 gap-4">
              <div className="text-sm text-muted-foreground">
                Showing {totalMovies > 0 ? (page - 1) * 20 + 1 : 0}-
                {Math.min(page * 20, totalMovies)} of {totalMovies} results
                {isChangingPage && (
                  <span className="inline-flex items-center ml-2 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Updating...
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => changePage(page - 1)}
                  disabled={page === 1 || isChangingPage}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {renderPageNumbers()}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => changePage(page + 1)}
                  disabled={page === totalPages || isChangingPage}
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            No movies found. Try a different search or filter.
          </p>
        </div>
      )}
    </main>
  )
}
