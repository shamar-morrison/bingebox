export interface Cast {
  id: number
  name: string
  character: string
  profile_path: string | null
  popularity?: number
}

export interface MediaItem {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  backdrop_path: string | null
  overview: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: string
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  credits?: {
    cast: Cast[]
    crew: {
      id: number
      name: string
      job: string
      profile_path: string | null
    }[]
  }
  videos?: {
    results: {
      id: string
      key: string
      name: string
      site: string
      type: string
    }[]
  }
  similar?: {
    results: MediaItem[]
  }
  seasons?: {
    id: number
    name: string
    overview: string
    poster_path: string | null
    season_number: number
    episode_count: number
    air_date: string
  }[]
  popularity?: number
}

export interface MediaResponse {
  page: number
  results: MediaItem[]
  total_pages: number
  total_results: number
}

export interface VideoResponse {
  id: number
  results: {
    id: string
    key: string
    name: string
    site: string
    type: string
  }[]
}

