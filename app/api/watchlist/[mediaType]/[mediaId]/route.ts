import { WatchlistStatusType } from "@/components/profile/AddToWatchlistButton"
import { auth } from "@/lib/auth"
import { supabase } from "@/lib/supabase-client"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// Fetches the watchlist status for a specific media item for the logged-in user
export async function GET({
  params,
}: {
  params: { mediaType: string; mediaId: string }
}) {
  const sessionData = await auth.api.getSession({ headers: await headers() })
  const userId = sessionData?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { mediaType, mediaId } = params

  if (mediaType !== "movie" && mediaType !== "tv") {
    return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from("watchlists")
      .select("status")
      .eq("user_id", userId)
      .eq("media_id", parseInt(mediaId))
      .eq("media_type", mediaType)
      .single()

    if (error && error.code !== "PGRST116") {
      // PGRST116: Row not found
      console.error("Error fetching watchlist status:", error)
      return NextResponse.json(
        { error: "Failed to fetch watchlist status" },
        { status: 500 },
      )
    }

    return NextResponse.json({ status: data?.status || null })
  } catch (err) {
    console.error("Server error fetching watchlist status:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

// Adds or updates a media item in the user's watchlist
export async function POST(
  request: Request,
  { params }: { params: { mediaType: string; mediaId: string } },
) {
  const sessionData = await auth.api.getSession({ headers: await headers() })
  const userId = sessionData?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { mediaType, mediaId } = params
  let requestBody: {
    status: WatchlistStatusType
    title?: string
    poster_path?: string | null
    release_date?: string | null
  }

  try {
    requestBody = await request.json()
    if (!requestBody || typeof requestBody !== "object") {
      throw new Error("Invalid JSON payload")
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { status, title, poster_path, release_date } = requestBody

  if (mediaType !== "movie" && mediaType !== "tv") {
    return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
  }

  if (!status || !["watching", "should-watch", "dropped"].includes(status)) {
    return NextResponse.json(
      { error: "Invalid watchlist status" },
      { status: 400 },
    )
  }

  try {
    // Prepare data for upsert, ensuring release_date is null if undefined or empty string
    const upsertData: any = {
      user_id: userId,
      media_id: parseInt(mediaId),
      media_type: mediaType,
      status: status,
      title: title,
      poster_path: poster_path,
      // Ensure release_date is correctly formatted or null for the DATE type in DB
      release_date: release_date ? release_date : null,
    }

    const { data, error } = await supabase
      .from("watchlists")
      .upsert(upsertData, {
        onConflict: "user_id,media_id,media_type",
      })
      .select("status, title, poster_path, release_date") // Select back the new fields
      .single()

    if (error) {
      console.error("Error upserting watchlist item:", error)
      return NextResponse.json(
        { error: "Failed to update watchlist" },
        { status: 500 },
      )
    }
    // Return the full updated item, not just status
    return NextResponse.json(data)
  } catch (err) {
    console.error("Server error updating watchlist:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}

// DELETE /api/watchlist/[mediaType]/[mediaId]
// Removes a media item from the user's watchlist
export async function DELETE(
  request: Request, // request object is not directly used for headers here, but kept for convention
  { params }: { params: { mediaType: string; mediaId: string } },
) {
  const sessionData = await auth.api.getSession({ headers: await headers() })
  const userId = sessionData?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { mediaType, mediaId } = params

  if (mediaType !== "movie" && mediaType !== "tv") {
    return NextResponse.json({ error: "Invalid media type" }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from("watchlists")
      .delete()
      .eq("user_id", userId)
      .eq("media_id", parseInt(mediaId))
      .eq("media_type", mediaType)

    if (error) {
      console.error("Error deleting watchlist item:", error)
      return NextResponse.json(
        { error: "Failed to remove from watchlist" },
        { status: 500 },
      )
    }
    return NextResponse.json(
      { message: "Removed from watchlist" },
      { status: 200 },
    )
  } catch (err) {
    console.error("Server error deleting watchlist item:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
