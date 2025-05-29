"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Film, Info, Loader2, Play, Tv } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import type { MediaItem as TrendingResult } from "@/lib/types" // Changed path to correct types file

export default function FeaturedMedia() {
  const [trendingItems, setTrendingItems] = useState<TrendingResult[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    async function getTrendingData() {
      console.log("Fetching trending media via API route...")
      try {
        const response = await fetch("/api/trending")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const trending = await response.json()
        console.log("Trending data fetched via API:", trending)
        if (trending && trending.results) {
          setTrendingItems(
            trending.results.slice(0, Math.min(5, trending.results.length)),
          )
        } else {
          console.error(
            "Failed to fetch trending data via API or results are empty.",
            trending,
          )
          setTrendingItems([])
        }
      } catch (error) {
        console.error("Error in getTrendingData:", error)
        setTrendingItems([])
      }
    }
    getTrendingData()
  }, [])

  useEffect(() => {
    if (trendingItems.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % trendingItems.length)
    }, 7000) // Change media every 7 seconds

    return () => clearInterval(interval)
  }, [trendingItems])

  if (trendingItems.length === 0) {
    return (
      <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] bg-muted flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  const featured = trendingItems[currentIndex]
  if (!featured) return null // Should not happen if trendingItems is not empty

  const backdropPath = featured.backdrop_path
    ? `https://image.tmdb.org/t/p/original${featured.backdrop_path}`
    : null

  const mediaType = featured.media_type!
  const detailsPath =
    mediaType === "movie" ? `/movie/${featured.id}` : `/tv/${featured.id}`

  const watchPath =
    mediaType === "movie"
      ? `/watch/movie/${featured.id}`
      : `/watch/tv/${featured.id}/season/1/episode/1`

  const title = featured.title || featured.name || "Featured Media"
  const overview = featured.overview || "No overview available"

  const imageVariants = {
    enter: {
      opacity: 0,
      scale: 1.1, // Start slightly zoomed in for the "zoom in" effect
    },
    center: {
      opacity: 1,
      scale: 1.15, // End state of the zoom
      transition: {
        opacity: { duration: 0.7, ease: "easeIn" },
        scale: { duration: 7, ease: "linear" }, // Slow zoom over 7 seconds
      },
    },
    exit: {
      opacity: 0,
      scale: 1, // Reset scale on exit
      transition: {
        opacity: { duration: 0.7, ease: "easeOut" },
        scale: { duration: 0.1 }, // Quick scale reset
      },
    },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut", delay: 0.3 },
    },
  }

  return (
    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        {backdropPath ? (
          <motion.img
            key={featured.id} // Important for AnimatePresence to detect changes
            src={backdropPath}
            alt={title}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="object-cover absolute top-0 left-0 w-full h-full"
          />
        ) : (
          <motion.div
            key={featured.id || "placeholder"}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="w-full h-full flex items-center justify-center bg-muted"
          >
            {mediaType === "movie" ? (
              <Film className="h-24 w-24 text-muted-foreground opacity-25" />
            ) : (
              <Tv className="h-24 w-24 text-muted-foreground opacity-25" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/10" />

      <div className="absolute inset-0 flex items-end">
        <div className="container px-4 pb-16 md:pb-24">
          {/* AnimatePresence for text content to ensure smooth transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={featured.id + "-content"} // Unique key for content block
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="max-w-2xl space-y-4"
            >
              <motion.h1
                variants={textVariants}
                className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl"
              >
                {title}
              </motion.h1>
              <motion.p
                variants={textVariants}
                className="text-base text-muted-foreground md:text-lg line-clamp-3"
              >
                {overview}
              </motion.p>
              <motion.div
                variants={textVariants}
                className="flex flex-wrap gap-3"
              >
                <Button asChild className="gap-2">
                  <Link href={watchPath}>
                    <Play className="w-5 h-5" />
                    Watch Now
                  </Link>
                </Button>

                <Button variant="outline" asChild>
                  <Link href={detailsPath} className="gap-2">
                    <Info className="w-5 h-5" />
                    More Info
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
