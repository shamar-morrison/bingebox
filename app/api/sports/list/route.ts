import { NextResponse } from "next/server"

export async function GET() {
  try {
    const response = await fetch("https://streamed.su/api/sports", {
      headers: {
        "User-Agent": "BingeBox/1.0",
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      throw new Error(`Streamed API error: ${response.status}`)
    }

    const sports = await response.json()
    return NextResponse.json(sports)
  } catch (error) {
    console.error("Error fetching sports:", error)
    return NextResponse.json(
      { error: "Failed to fetch sports" },
      { status: 500 },
    )
  }
}
