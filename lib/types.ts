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
  profile_path?: string | null
  backdrop_path: string | null
  overview: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: string
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
  runtime?: number
  original_language?: string
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
  external_ids?: {
    imdb_id?: string
    facebook_id?: string
    instagram_id?: string
    twitter_id?: string
  }
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

export interface Episode {
  id: number
  name: string
  overview: string | null
  episode_number: number
  season_number: number
  still_path: string | null
  air_date: string | null
  runtime: number | null
  vote_average: number | null
}

export interface PersonDetails {
  id: number
  name: string
  biography: string
  birthday: string | null
  deathday: string | null
  place_of_birth: string | null
  profile_path: string | null
  known_for_department: string
  gender: number
  popularity: number
  imdb_id: string | null
  homepage: string | null
  movie_credits?: {
    cast: MediaItem[]
    crew: {
      id: number
      department: string
      job: string
      title: string
      poster_path: string | null
    }[]
  }
  tv_credits?: {
    cast: MediaItem[]
    crew: {
      id: number
      department: string
      job: string
      name: string
      poster_path: string | null
    }[]
  }
}

export interface SeasonDetails {
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  air_date: string | null
  episodes: Episode[]
}

export interface EpisodeDetails extends Episode {
  crew: {
    id: number
    name: string
    job: string
    department: string
    profile_path: string | null
  }[]
  guest_stars: {
    id: number
    name: string
    character: string
    profile_path: string | null
  }[]
  images?: {
    stills: {
      file_path: string
      height: number
      width: number
      aspect_ratio: number
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
}

export interface GenresResponse {
  genres: {
    id: number
    name: string
  }[]
}
