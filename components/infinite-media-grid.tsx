"use client"

import { useInfiniteScroll } from "@/hooks/use-infinite-scroll"
import { MediaItem, MediaResponse } from "@/lib/types"
import { useCallback, useState } from "react"
import MediaGrid from "./media-grid"
import { Skeleton } from "./ui/skeleton"

interface InfiniteMediaGridProps {
  initialData: MediaResponse
  apiEndpoint: string
  mediaType?: "movie" | "tv"
}

export default function InfiniteMediaGrid({
  initialData,
  apiEndpoint,
  mediaType,
}: InfiniteMediaGridProps) {
  const transformItems = (items: MediaItem[]) => {
    if (mediaType) {
      return items.map((item) => ({ ...item, media_type: mediaType }))
    }
    return items
  }

  const [data, setData] = useState<MediaItem[]>(
    transformItems(initialData.results),
  )
  const [currentPage, setCurrentPage] = useState(initialData.page)
  const [totalPages, setTotalPages] = useState(initialData.total_pages)
  const [isFetching, setIsFetching] = useState(false)
  const [hasError, setHasError] = useState(false)

  const hasNextPage = currentPage < totalPages

  const loadMore = useCallback(async () => {
    if (isFetching || !hasNextPage) return

    setIsFetching(true)
    setHasError(false)

    try {
      const nextPage = currentPage + 1
      const response = await fetch(`${apiEndpoint}?page=${nextPage}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch data from ${apiEndpoint}`)
      }

      const data = await response.json()

      setData((prevData) => [...prevData, ...transformItems(data.results)])
      setCurrentPage(nextPage)
      setTotalPages(data.total_pages)
    } catch (error) {
      console.error("Failed to fetch more data:", error)
      setHasError(true)
    } finally {
      setIsFetching(false)
    }
  }, [currentPage, hasNextPage, isFetching, apiEndpoint, mediaType])

  const { isNearBottom } = useInfiniteScroll({
    threshold: 1000,
    hasNextPage,
    isFetching,
    onLoadMore: loadMore,
  })

  return (
    <div>
      <MediaGrid items={data} />

      {isFetching && (
        <div className="mt-8">
          <LoadingGrid />
        </div>
      )}

      {hasError && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground mb-4">
            Failed to load more content
          </p>
          <button
            onClick={loadMore}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {!hasNextPage && data.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">You've reached the end!</p>
        </div>
      )}

      {isNearBottom && hasNextPage && !isFetching && (
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">Loading more...</p>
        </div>
      )}
    </div>
  )
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {Array(10)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="w-full aspect-[2/3] rounded-lg" />
            <Skeleton className="w-full h-4" />
            <Skeleton className="w-2/3 h-4" />
          </div>
        ))}
    </div>
  )
}
