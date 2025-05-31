const STREAMED_BASE_URL = "https://streamed.su/api"

async function fetchFromStreamed<T>(
  endpoint: string,
  revalidateInSeconds = 300,
): Promise<T> {
  const url = `${STREAMED_BASE_URL}${endpoint}`

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "BingeBox/1.0",
      },
      next: { revalidate: revalidateInSeconds },
    })

    if (!response.ok) {
      console.error(`Failed to fetch from Streamed API: ${response.status}`)
      return [] as unknown as T
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching from Streamed API:`, error)
    return [] as unknown as T
  }
}

export interface Sport {
  id: string
  name: string
}

export interface Match {
  id: string
  title: string
  category: string
  date: number
  poster?: string
  popular: boolean
  teams?: {
    home?: {
      name: string
      badge: string
    }
    away?: {
      name: string
      badge: string
    }
  }
  sources: {
    source: string
    id: string
  }[]
}

export interface Stream {
  id: string
  streamNo: number
  language: string
  hd: boolean
  embedUrl: string
  source: string
}

export const fetchSports = async (): Promise<Sport[]> => {
  return fetchFromStreamed<Sport[]>("/sports", 3600)
}

export const fetchLiveMatches = async (): Promise<Match[]> => {
  return fetchFromStreamed<Match[]>("/matches/live", 60)
}

export const fetchPopularMatches = async (): Promise<Match[]> => {
  return fetchFromStreamed<Match[]>("/matches/all/popular", 300)
}

export const fetchAllMatches = async (): Promise<Match[]> => {
  return fetchFromStreamed<Match[]>("/matches/all", 300)
}

export const fetchTodayMatches = async (): Promise<Match[]> => {
  return fetchFromStreamed<Match[]>("/matches/all-today", 300)
}

export const fetchSportMatches = async (sport: string): Promise<Match[]> => {
  return fetchFromStreamed<Match[]>(`/matches/${sport}`, 300)
}

export const fetchSportPopularMatches = async (
  sport: string,
): Promise<Match[]> => {
  return fetchFromStreamed<Match[]>(`/matches/${sport}/popular`, 300)
}

export const fetchStreams = async (
  source: string,
  id: string,
): Promise<Stream[]> => {
  return fetchFromStreamed<Stream[]>(`/stream/${source}/${id}`, 300)
}
