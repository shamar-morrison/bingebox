"use client"

import type React from "react"

import { debounce } from "lodash"
import {
  Download,
  Film,
  Home,
  Menu,
  Search,
  Star,
  Tv,
  User,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface SearchResult {
  id: number
  media_type: string
  title?: string
  name?: string
  poster_path?: string | null
  profile_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  number_of_seasons?: number
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Close search results when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const fetchSearchResults = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(query)}&limit=5`,
      )

      if (!response.ok) {
        throw new Error("Search failed")
      }

      const data = await response.json()
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Error searching:", error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search to avoid too many API calls
  const debouncedSearch = useRef(
    debounce(async (query: string) => {
      await fetchSearchResults(query)
    }, 300),
  ).current

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery)
      setShowResults(true)
    } else {
      setSearchResults([])
      setShowResults(false)
    }

    return () => {
      debouncedSearch.cancel()
    }
  }, [searchQuery, debouncedSearch])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowResults(false)
      setIsSheetOpen(false)
    }
  }

  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      setShowResults(true)
    }
  }

  const formatYear = (dateString?: string) => {
    if (!dateString) return "Unknown"
    return new Date(dateString).getFullYear()
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Movies", href: "/movie", icon: Film },
    { label: "TV Shows", href: "/tv", icon: Tv },
    { label: "Discover", href: "/discover", icon: Search },
    { label: "Torrents", href: "/torrents", icon: Download },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-md"
          : "bg-gradient-to-b from-background/80 to-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">BingeBox</span>
          </Link>

          <nav className="hidden lg:flex">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block" ref={searchRef}>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-[220px] pl-8 bg-secondary/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchInputFocus}
              />
            </form>

            {showResults && (searchResults.length > 0 || isSearching) && (
              <div className="absolute top-full mt-1 w-[320px] right-0 bg-background border rounded-md shadow-lg overflow-hidden z-50">
                {isSearching ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin h-5 w-5 border-t-2 border-primary rounded-full mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Searching...
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="max-h-[400px] overflow-y-auto">
                      {searchResults.map((result) => (
                        <Link
                          key={`${result.id}-${result.media_type}`}
                          href={`/${result.media_type === "person" ? "person" : result.media_type}/${result.id}`}
                          className="flex items-start gap-3 p-3 hover:bg-accent transition-colors border-b border-border last:border-0"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="flex-shrink-0 h-16 w-12 relative bg-muted rounded overflow-hidden">
                            {result.poster_path || result.profile_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w92${result.poster_path || result.profile_path}`}
                                alt={result.title || result.name || "Media"}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                {result.media_type === "person" ? (
                                  <User className="h-6 w-6 text-muted-foreground" />
                                ) : (
                                  <Film className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">
                              {result.title || result.name}
                            </h4>

                            <div className="mt-1 flex items-center">
                              {result.media_type === "movie" && (
                                <>
                                  <Film className="h-3 w-3 text-muted-foreground mr-1" />
                                  <span className="text-xs text-muted-foreground">
                                    Movie • {formatYear(result.release_date)}
                                  </span>
                                  {result.vote_average &&
                                  result.vote_average > 0 ? (
                                    <div className="ml-2 flex items-center text-xs">
                                      <Star className="h-3 w-3 text-yellow-500 mr-0.5" />
                                      <span>
                                        {result.vote_average.toFixed(1)}
                                      </span>
                                    </div>
                                  ) : null}
                                </>
                              )}

                              {result.media_type === "tv" && (
                                <>
                                  <Tv className="h-3 w-3 text-muted-foreground mr-1" />
                                  <span className="text-xs text-muted-foreground">
                                    TV • {formatYear(result.first_air_date)}
                                    {result.number_of_seasons && (
                                      <>
                                        {" "}
                                        • {result.number_of_seasons} season
                                        {result.number_of_seasons !== 1
                                          ? "s"
                                          : ""}
                                      </>
                                    )}
                                  </span>
                                </>
                              )}

                              {result.media_type === "person" && (
                                <>
                                  <User className="h-3 w-3 text-muted-foreground mr-1" />
                                  <span className="text-xs text-muted-foreground">
                                    Person
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="p-2 border-t border-border">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          router.push(
                            `/search?q=${encodeURIComponent(searchQuery.trim())}`,
                          )
                          setShowResults(false)
                        }}
                      >
                        View all results
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <ThemeToggle />

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b">
                  <Link
                    href="/"
                    className="flex items-center gap-2"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    <Film className="w-5 h-5 text-primary" />
                    <span className="font-semibold">BingeBox</span>
                  </Link>
                </div>

                <nav className="flex-1 py-8">
                  <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  <ul className="space-y-4">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                              pathname === item.href
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                            onClick={() => setIsSheetOpen(false)}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
