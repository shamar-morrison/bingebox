import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://streamed.su/api/matches/live", {
      headers: {
        "User-Agent": "BingeBox/1.0",
      },
      next: { revalidate: 60 },
    })

    if (!response.ok) {
      throw new Error(`Streamed API error: ${response.status}`)
    }

    const matches = await response.json()
    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error fetching live matches:", error)
    return NextResponse.json(
      { error: "Failed to fetch live matches" },
      { status: 500 },
    )
  }
}
