"use client"

import { useCallback, useEffect, useState } from "react"

interface UseInfiniteScrollOptions {
  threshold?: number
  hasNextPage: boolean
  isFetching: boolean
  onLoadMore: () => void
}

export function useInfiniteScroll({
  threshold = 1000,
  hasNextPage,
  isFetching,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const [isNearBottom, setIsNearBottom] = useState(false)

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = document.documentElement.scrollHeight

    const distanceFromBottom = documentHeight - (scrollTop + windowHeight)
    const nearBottom = distanceFromBottom <= threshold

    setIsNearBottom(nearBottom)

    if (nearBottom && hasNextPage && !isFetching) {
      onLoadMore()
    }
  }, [threshold, hasNextPage, isFetching, onLoadMore])

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [handleScroll])

  return { isNearBottom }
}
