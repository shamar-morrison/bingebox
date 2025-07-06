"use client"

import { Loader2, Search } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type React from "react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchFormProps {
  initialQuery?: string
  initialType?: string
}

export default function SearchForm({
  initialQuery = "",
  initialType = "multi",
}: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const [type] = useState(initialType)
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const searchParamsQuery = searchParams.get("q")

  // Reset isSearching when the URL changes
  useEffect(() => {
    setIsSearching(false)
  }, [pathname, searchParams])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (query.trim() !== searchParamsQuery?.trim()) {
      setIsSearching(true)
      router.push(`/search?q=${encodeURIComponent(query.trim())}&type=${type}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for movies, TV shows, or people..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={isSearching}
        />
      </div>

      <div className="w-full md:w-auto">
        <Button type="submit" className="w-full" disabled={isSearching}>
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </div>
    </form>
  )
}
