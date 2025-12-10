import type { VidLinkProgressData } from "@/lib/hooks/use-vidlink-progress"
import { createClient } from "@/lib/supabase/server"
import { convertToDbFormat } from "@/lib/watch-progress-utils"
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

    // Convert VidLink format to database format using shared utility
    const itemsToSave = convertToDbFormat(
      progressData as VidLinkProgressData,
      user.id,
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
