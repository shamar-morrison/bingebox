import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch(
      "https://streamed.su/api/matches/all/popular",
      {
        headers: {
          "User-Agent": "BingeBox/1.0",
        },
        next: { revalidate: 300 },
      },
    )

    if (!response.ok) {
      throw new Error(`Streamed API error: ${response.status}`)
    }

    const matches = await response.json()
    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error fetching popular matches:", error)
    return NextResponse.json(
      { error: "Failed to fetch popular matches" },
      { status: 500 },
    )
  }
}
