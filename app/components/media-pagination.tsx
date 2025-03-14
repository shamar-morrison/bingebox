"use client"

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"

interface MediaPaginationProps {
  currentPage: number
  totalPages: number
  totalResults: number
}

export default function MediaPagination({
  currentPage,
  totalPages,
  totalResults,
}: MediaPaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  const changePage = (page: number) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  // Hide loading state after navigation is complete
  useEffect(() => {
    setIsLoading(false)
  }, [searchParams])

  const renderPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    // Adjust start page if end page is at maximum
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="icon"
          className="h-8 w-8"
          onClick={() => changePage(i)}
          disabled={i === currentPage || isLoading}
          aria-label={`Page ${i}`}
          aria-current={i === currentPage ? "page" : undefined}
        >
          {i}
        </Button>,
      )
    }

    return pageNumbers
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex flex-col items-center justify-center mt-8 mb-12 gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {totalResults > 0 ? (currentPage - 1) * 20 + 1 : 0}-
        {Math.min(currentPage * 20, totalResults)} of {totalResults} results
        {isLoading && (
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
          onClick={() => changePage(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {renderPageNumbers()}

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => changePage(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
