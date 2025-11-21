"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Film, Tv, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface GeminiResult {
  type: "movie" | "tv" | "unknown"
  title: string
  season?: number | null
  episode?: number | null
  confidence: "high" | "medium" | "low"
  description: string
}

interface TMDBResult {
  id: number
  media_type: string
  title?: string
  name?: string
  poster_path?: string | null
  overview?: string
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

export default function ImageSearchPage() {
  const [geminiResult, setGeminiResult] = useState<GeminiResult | null>(null)
  const [detectedImage, setDetectedImage] = useState<string | null>(null)
  const [tmdbResults, setTmdbResults] = useState<TMDBResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
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
  }, [router])

  const searchTMDB = async (query: string) => {
    try {
      const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setTmdbResults(data.results || [])
      }
    } catch (error) {
      console.error("Error searching TMDB:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!geminiResult && isLoading) {
    return (
      <div className="container py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!geminiResult) return null

  return (
    <div className="container py-10 max-w-5xl">
      <h1 className="text-3xl font-bold mb-8">Image Analysis Results</h1>

      <div className="grid gap-8 md:grid-cols-[300px_1fr]">
        {/* Left Column: Image and Analysis */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyzed Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border bg-muted aspect-video flex items-center justify-center">
                {detectedImage && (
                  <img
                    src={detectedImage}
                    alt="Analyzed"
                    className="max-h-full max-w-full object-contain"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Detected Title</div>
                <div className="text-lg font-bold">{geminiResult.title}</div>
              </div>

              {geminiResult.type !== "unknown" && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">Type</div>
                  <div className="flex items-center gap-2">
                    {geminiResult.type === "movie" ? (
                      <Film className="h-4 w-4" />
                    ) : (
                      <Tv className="h-4 w-4" />
                    )}
                    <span className="capitalize">{geminiResult.type === "tv" ? "TV Show" : "Movie"}</span>
                  </div>
                </div>
              )}

              {(geminiResult.season || geminiResult.episode) && (
                <div className="grid grid-cols-2 gap-4">
                  {geminiResult.season && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Season</div>
                      <div>{geminiResult.season}</div>
                    </div>
                  )}
                  {geminiResult.episode && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground mb-1">Episode</div>
                      <div>{geminiResult.episode}</div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Confidence</div>
                <div className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${geminiResult.confidence === "high" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100" : 
                    geminiResult.confidence === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100" : 
                    "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"}
                `}>
                  {geminiResult.confidence.toUpperCase()}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">Reasoning</div>
                <p className="text-sm text-muted-foreground">{geminiResult.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Matches */}
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Potential Matches</h2>
          
          {tmdbResults.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tmdbResults.map((result) => (
                <Link 
                  key={result.id} 
                  href={`/${result.media_type === "movie" ? "movie" : "tv"}/${result.id}`}
                  className="group block"
                >
                  <Card className="h-full overflow-hidden hover:border-primary transition-colors">
                    <div className="aspect-[2/3] relative bg-muted">
                      {result.poster_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
                          alt={result.title || result.name}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          {result.media_type === "movie" ? (
                            <Film className="h-12 w-12 text-muted-foreground/50" />
                          ) : (
                            <Tv className="h-12 w-12 text-muted-foreground/50" />
                          )}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate mb-1">{result.title || result.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span className="capitalize">{result.media_type === "tv" ? "TV Show" : "Movie"}</span>
                        <span>•</span>
                        <span>
                          {new Date(result.release_date || result.first_air_date || "").getFullYear() || "Unknown"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {result.overview}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No matches found</AlertTitle>
              <AlertDescription>
                We couldn't find any direct matches in our database for "{geminiResult.title}". 
                Try searching manually or uploading a clearer image.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-center mt-8">
            <Button variant="outline" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
