"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SearchFormProps {
  initialQuery?: string
  initialType?: string
}

export default function SearchForm({ initialQuery = "", initialType = "multi" }: SearchFormProps) {
  const [query, setQuery] = useState(initialQuery)
  const [type, setType] = useState(initialType)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (query.trim()) {
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
        />
      </div>

      <div className="flex gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Search type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="multi">All</SelectItem>
            <SelectItem value="movie">Movies</SelectItem>
            <SelectItem value="tv">TV Shows</SelectItem>
            <SelectItem value="person">People</SelectItem>
          </SelectContent>
        </Select>

        <Button type="submit">Search</Button>
      </div>
    </form>
  )
}

