// Run this script with: npx tsx scripts/backfill-watchlist-genres.ts
// Make sure your .env.local file has NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and TMDB_API_KEY

import { createClient } from "@supabase/supabase-js"
import { config } from "dotenv"

// Load environment variables from .env.local
config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const tmdbApiKey = process.env.TMDB_API_KEY!

if (!supabaseUrl || !supabaseServiceKey || !tmdbApiKey) {
  console.error("Missing required environment variables")
  console.error(
    "Make sure you have NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and TMDB_API_KEY in your .env.local file",
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface TMDBGenre {
  id: number
  name: string
}

interface TMDBMovieResponse {
  genres: TMDBGenre[]
}

interface TMDBTVResponse {
  genres: TMDBGenre[]
}

async function fetchGenresFromTMDB(
  mediaId: number,
  mediaType: string,
): Promise<string[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${tmdbApiKey}`,
    )

    if (!response.ok) {
      console.warn(
        `Failed to fetch data for ${mediaType} ${mediaId}:`,
        response.status,
      )
      return []
    }

    const data: TMDBMovieResponse | TMDBTVResponse = await response.json()
    return data.genres.map((genre) => genre.name)
  } catch (error) {
    console.error(`Error fetching genres for ${mediaType} ${mediaId}:`, error)
    return []
  }
}

async function backfillWatchlistGenres() {
  console.log("Starting watchlist genres backfill...")

  // Fetch all watchlist items that don't have genres
  const { data: watchlistItems, error } = await supabase
    .from("watchlists")
    .select("id, media_id, media_type")
    .is("genres", null)

  if (error) {
    console.error("Error fetching watchlist items:", error)
    return
  }

  if (!watchlistItems || watchlistItems.length === 0) {
    console.log("No watchlist items need genre backfill")
    return
  }

  console.log(`Found ${watchlistItems.length} watchlist items to backfill`)

  let successCount = 0
  let errorCount = 0

  for (const item of watchlistItems) {
    try {
      console.log(`Processing ${item.media_type} ${item.media_id}...`)

      const genres = await fetchGenresFromTMDB(item.media_id, item.media_type)

      const { error: updateError } = await supabase
        .from("watchlists")
        .update({ genres })
        .eq("id", item.id)

      if (updateError) {
        console.error(`Error updating watchlist item ${item.id}:`, updateError)
        errorCount++
      } else {
        console.log(
          `✓ Updated ${item.media_type} ${item.media_id} with genres: ${genres.join(", ")}`,
        )
        successCount++
      }

      // Add a small delay to avoid hitting TMDB rate limits
      await new Promise((resolve) => setTimeout(resolve, 250))
    } catch (error) {
      console.error(`Error processing watchlist item ${item.id}:`, error)
      errorCount++
    }
  }

  console.log(`\nBackfill complete!`)
  console.log(`✓ Successfully updated: ${successCount}`)
  console.log(`✗ Errors: ${errorCount}`)
}

// Run the backfill
backfillWatchlistGenres()
  .then(() => {
    console.log("Backfill process finished")
    process.exit(0)
  })
  .catch((error) => {
    console.error("Backfill process failed:", error)
    process.exit(1)
  })
