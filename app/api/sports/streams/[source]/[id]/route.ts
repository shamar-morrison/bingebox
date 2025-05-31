import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { source: string; id: string } },
) {
  try {
    const { source, id } = params

    const response = await fetch(
      `https://streamed.su/api/stream/${source}/${id}`,
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

    const streams = await response.json()
    return NextResponse.json(streams)
  } catch (error) {
    console.error("Error fetching streams:", error)
    return NextResponse.json(
      { error: "Failed to fetch streams" },
      { status: 500 },
    )
  }
}
