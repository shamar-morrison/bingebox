import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { sport: string } },
) {
  try {
    const { sport } = params

    const response = await fetch(`https://streamed.su/api/matches/${sport}`, {
      headers: {
        "User-Agent": "BingeBox/1.0",
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`Streamed API error: ${response.status}`)
    }

    const matches = await response.json()
    return NextResponse.json(matches)
  } catch (error) {
    console.error("Error fetching sport matches:", error)
    return NextResponse.json(
      { error: "Failed to fetch sport matches" },
      { status: 500 },
    )
  }
}
