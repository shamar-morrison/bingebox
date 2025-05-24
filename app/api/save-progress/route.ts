import type {
  MediaItem,
  VidLinkProgressData,
} from "@/lib/hooks/use-vidlink-progress"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, data: progressData, userId } = body

    if (action !== "save_progress" || userId !== user.id) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    if (!progressData || typeof progressData !== "object") {
      return NextResponse.json(
        { error: "Invalid progress data" },
        { status: 400 },
      )
    }

    // Convert VidLink format to database format
    const itemsToSave = Object.values(progressData as VidLinkProgressData).map(
      (item: MediaItem) => ({
        user_id: user.id,
        media_id: String(item.id),
        media_type: item.type,
        title: item.title,
        poster_path: item.poster_path || null,
        backdrop_path: item.backdrop_path || null,
        watched_seconds: item.progress?.watched || 0,
        duration_seconds: item.progress?.duration || 0,
        last_season_watched: item.last_season_watched || null,
        last_episode_watched: item.last_episode_watched || null,
        show_progress: (item.show_progress || {}) as any,
      }),
    )

    if (itemsToSave.length === 0) {
      return NextResponse.json({ success: true, message: "No data to save" })
    }

    const { error } = await supabase
      .from("watch_progress")
      .upsert(itemsToSave, {
        onConflict: "user_id,media_id,media_type",
        ignoreDuplicates: false,
      })

    if (error) {
      console.error("Error saving progress via API:", error)
      return NextResponse.json(
        { error: "Failed to save progress" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true, saved: itemsToSave.length })
  } catch (error) {
    console.error("API Error saving progress:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
