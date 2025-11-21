"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Film, Tv, AlertCircle, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import MediaCard from "@/components/media-card"
import type { MediaItem } from "@/lib/types"
import { Spinner } from "@/components/spinner"

interface GeminiResult {
  type: "movie" | "tv" | "unknown"
  title: string
  season?: number | null
  episode?: number | null
  confidence: "high" | "medium" | "low"
  description: string
}

export default function ImageSearchPage() {
  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null)
  const [detectedImage, setDetectedImage] = useState<string | null>(null)
  const [tmdbResults, setTmdbResults] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const searchTMDB = async (query: string) => {
      try {
        // Add timestamp to prevent caching
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}&t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          setTmdbResults(data.results || [])
        } else {
          console.error("TMDB search failed:", response.statusText)
          setTmdbResults([])
        }
      } catch (error) {
        console.error("Error searching TMDB:", error)
        setTmdbResults([])
      } finally {
        setIsLoading(false)
      }
    }

    const loadData = () => {
      const storedResult = localStorage.getItem("imageDetectionResult")
      const storedImage = localStorage.getItem("detectedImage")

      if (!storedResult || !storedImage) {
        router.push("/")
        return
      }

      try {
        const parsedResult = JSON.parse(storedResult)
        setGeminiResult(parsedResult)
        setDetectedImage(storedImage)
        setTmdbResults([])
        setIsLoading(true)
        
        // Search TMDB if we have a title
        if (parsedResult.title && parsedResult.title !== "Unknown") {
          searchTMDB(parsedResult.title)
        } else {
          setIsLoading(false)
        }
      } catch (error) {
        console.error("Error parsing stored result:", error)
        setIsLoading(false)
      }
    }

    // Initial load
    loadData()

    // Listen for updates from the modal
    const handleUpdate = () => {
      loadData()
    }

    window.addEventListener("image-search-updated", handleUpdate)

    return () => {
      window.removeEventListener("image-search-updated", handleUpdate)
    }
  }, [router])



  if (isLoading) {
    return (
      <div className="container py-24 mt-24 flex justify-center">
        <Spinner className="text-primary h-16 w-16"/>
      </div>
    )
  }

  if (!geminiResult) return null

  const bestMatch = tmdbResults.length > 0 ? tmdbResults[0] : null
  const otherMatches = tmdbResults.length > 1 ? tmdbResults.slice(1) : []

  return (
    <div className="container py-10 mt-20 max-w-7xl overflow-hidden">
      <div className="flex items-center gap-3 mb-8">
        <Sparkles className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">AI Analysis Results</h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[350px_1fr] ">
        {/* Left Column: Image and Analysis */}
        <div className="space-y-6 overflow-hidden">
          <Card className="overflow-hidden border-primary/20 shadow-md">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="text-lg">Analyzed Image</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-hidden">
              <div className="bg-black/5 aspect-video flex items-center justify-center overflow-hidden">
                {detectedImage && (
                  <img
                    src={detectedImage}
                    alt="Analyzed"
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 shadow-md overflow-hidden">
            <CardHeader className="bg-muted/50 pb-4">
              <CardTitle className="text-lg">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Detected Title</div>
                <div className="text-xl font-bold text-primary">{geminiResult.title}</div>
              </div>

              {geminiResult.type !== "unknown" && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Type</div>
                  <div className="flex items-center gap-2">
                    {geminiResult.type === "movie" ? (
                      <Film className="h-4 w-4" />
                    ) : (
                      <Tv className="h-4 w-4" />
                    )}
                    <span className="capitalize font-medium">{geminiResult.type === "tv" ? "TV Show" : "Movie"}</span>
                  </div>
                </div>
              )}

              {(geminiResult.season || geminiResult.episode) && (
                <div className="grid grid-cols-2 gap-4">
                  {geminiResult.season && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Season</div>
                      <div className="font-medium">{geminiResult.season}</div>
                    </div>
                  )}
                  {geminiResult.episode && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Episode</div>
                      <div className="font-medium">{geminiResult.episode}</div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Confidence</div>
                <div className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                  ${geminiResult.confidence === "high" ? "bg-green-500/15 text-green-600 dark:text-green-400" : 
                    geminiResult.confidence === "medium" ? "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400" : 
                    "bg-red-500/15 text-red-600 dark:text-red-400"}
                `}>
                  {geminiResult.confidence.toUpperCase()}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Reasoning</div>
                <p className="text-sm text-muted-foreground leading-relaxed">{geminiResult.description}</p>
              </div>
            </CardContent>
          </Card>
          
          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            Back to Home
          </Button>
        </div>

        {/* Right Column: Matches */}
        <div className="space-y-8">
          {tmdbResults.length > 0 ? (
            <>
              {bestMatch && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">Best Match</span>
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div className="relative group">
                      <div className="relative h-full">
                        <MediaCard item={bestMatch} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {otherMatches.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-muted-foreground">Other Potential Matches</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {otherMatches.map((result) => (
                      <MediaCard key={result.id} item={result} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/30 rounded-lg border border-dashed">
              <div className="bg-muted p-4 rounded-full mb-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground max-w-md mb-6">
                We couldn't find any direct matches in our database for "{geminiResult.title}". 
                The AI might have misidentified the title, or it might be a less common title.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
