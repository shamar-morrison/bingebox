import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase-client"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// GET /api/watchlist?list=[listType]
// Fetches all media items for the logged-in user belonging to a specific list
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const listType = searchParams.get("list")

  const sessionData = await auth.api.getSession({ headers: await headers() })
  const userId = sessionData?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (
    !listType ||
    !["watching", "should-watch", "dropped"].includes(listType)
  ) {
    return NextResponse.json(
      { error: "Invalid or missing list type" },
      { status: 400 },
    )
  }

  try {
    const { data, error } = await supabase
      .from("watchlists")
      .select(
        `
        media_id,
        media_type,
        status,
        title,
        poster_path,
        release_date,
        created_at,
        updated_at
      `,
      )
      .eq("user_id", userId)
      .eq("status", listType)
      .order("updated_at", { ascending: false })

    if (error) {
      console.error(`Error fetching '${listType}' watchlist:`, error)
      return NextResponse.json(
        { error: `Failed to fetch '${listType}' watchlist` },
        { status: 500 },
      )
    }

    // Here, you would ideally enrich the data with actual media details (title, poster)
    // by fetching from TMDB API using the media_id and media_type.
    // For now, returning raw watchlist entries.
    return NextResponse.json(data || [])
  } catch (err) {
    console.error(`Server error fetching '${listType}' watchlist:`, err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
