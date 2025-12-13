import { NextRequest, NextResponse } from "next/server"
import { chatAboutMedia, MediaContext } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      )
    }

    const body = await req.json()
    const { mediaContext, message } = body

    if (!mediaContext || !message) {
      return NextResponse.json(
        { error: "mediaContext and message are required" },
        { status: 400 },
      )
    }

    // Validate mediaContext has required fields
    if (
      !mediaContext.type ||
      !mediaContext.title ||
      (mediaContext.type !== "movie" && mediaContext.type !== "tv")
    ) {
      return NextResponse.json(
        { error: "mediaContext must include valid type (movie/tv) and title" },
        { status: 400 },
      )
    }

    const typedMediaContext: MediaContext = {
      type: mediaContext.type,
      title: mediaContext.title,
      overview: mediaContext.overview,
      genres: mediaContext.genres,
      cast: mediaContext.cast,
      releaseDate: mediaContext.releaseDate,
      runtime: mediaContext.runtime,
      voteAverage: mediaContext.voteAverage,
    }

    const response = await chatAboutMedia(typedMediaContext, message)

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("Error in ai-chat route:", error)

    if (error?.message === "RATE_LIMIT_EXCEEDED") {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 },
      )
    }

    return NextResponse.json(
      { error: "Failed to get AI response" },
      { status: 500 },
    )
  }
}
