import type {
  EpisodeDetails,
  GenresResponse,
  MediaItem,
  MediaResponse,
  PersonDetails,
  ReviewResponse,
  SeasonDetails,
  VideoResponse,
} from "./types"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

async function fetchFromTMDB<T>(
  endpoint: string,
  revalidateInSeconds = 3600, // Default to 1 hour
): Promise<T> {
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY is not defined in environment variables")
    return { results: [] } as unknown as T
  }

  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`

  try {
    const response = await fetch(url, {
      next: { revalidate: revalidateInSeconds },
    })

    if (!response.ok) {
      console.error(`Failed to fetch from TMDB: ${response.status}`)
      return { results: [] } as unknown as T
    }

    return response.json()
  } catch (error) {
    console.error(`Error fetching from TMDB:`, error)
    return { results: [] } as unknown as T
  }
}

export const fetchTrending = async (page = 1): Promise<MediaResponse> => {
  const response = await fetchFromTMDB<MediaResponse>(
    `/trending/all/day?page=${page}`,
  )

  if (response.results) {
    response.results = response.results.filter(
      (item) => item.media_type !== "person",
    )
  }

  return response
}

export const fetchPopularMovies = async (page = 1): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(`/movie/popular?page=${page}`)
}

export const fetchTopRatedMovies = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/movie/top_rated")
}

export const fetchUpcomingMovies = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/movie/upcoming")
}

export const fetchNowPlayingMovies = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/movie/now_playing")
}

export const fetchPopularShows = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/tv/popular")
}

export const fetchTopRatedShows = async (page = 1): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(`/tv/top_rated?page=${page}`)
}

export const fetchAiringTodayShows = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/tv/airing_today")
}

export const fetchOnTheAirShows = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/tv/on_the_air")
}

export const fetchMovieDetails = async (id: number): Promise<MediaItem> => {
  return fetchFromTMDB<MediaItem>(
    `/movie/${id}?append_to_response=credits,similar,videos,external_ids`,
  )
}

export const fetchTVDetails = async (id: number): Promise<MediaItem> => {
  return fetchFromTMDB<MediaItem>(
    `/tv/${id}?append_to_response=credits,similar,videos,seasons`,
  )
}

export const fetchVideos = async (
  mediaType: string,
  id: number,
): Promise<VideoResponse> => {
  return fetchFromTMDB<VideoResponse>(`/${mediaType}/${id}/videos`)
}

export const searchMulti = async (
  query: string,
  page = 1,
): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(
    `/search/multi?query=${encodeURIComponent(query)}&page=${page}`,
  )
}

export const searchMovies = async (
  query: string,
  page = 1,
): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(
    `/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
  )
}

export const searchTV = async (
  query: string,
  page = 1,
): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(
    `/search/tv?query=${encodeURIComponent(query)}&page=${page}`,
  )
}

export const searchPerson = async (
  query: string,
  page = 1,
): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(
    `/search/person?query=${encodeURIComponent(query)}&page=${page}`,
  )
}

export const fetchPersonDetails = async (
  id: number,
): Promise<PersonDetails> => {
  return fetchFromTMDB<PersonDetails>(
    `/person/${id}?append_to_response=movie_credits,tv_credits`,
  )
}

export const fetchSeasonDetails = async (
  tvId: number,
  seasonNumber: number,
): Promise<SeasonDetails> => {
  return fetchFromTMDB<SeasonDetails>(`/tv/${tvId}/season/${seasonNumber}`)
}

export const fetchEpisodeDetails = async (
  tvId: number,
  seasonNumber: number,
  episodeNumber: number,
): Promise<EpisodeDetails> => {
  return fetchFromTMDB<EpisodeDetails>(
    `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
  )
}

export interface DiscoverParams {
  page?: number
  sort_by?: string
  with_genres?: string
  "vote_average.gte"?: number
  "vote_average.lte"?: number
  "primary_release_date.gte"?: string
  "primary_release_date.lte"?: string
  "first_air_date.gte"?: string
  "first_air_date.lte"?: string
  with_watch_providers?: string
  watch_region?: string
  year?: number
  primary_release_year?: number
  first_air_date_year?: number
  with_original_language?: string
}

export const fetchGenres = async (
  mediaType: "movie" | "tv",
): Promise<GenresResponse> => {
  return fetchFromTMDB<GenresResponse>(
    `/genre/${mediaType}/list`,
    604800, // Revalidate every 7 days
  )
}

export const discoverMovies = async (
  params: DiscoverParams = {},
): Promise<MediaResponse> => {
  const queryParams = Object.entries(params)
    .map(([key, value]) => `&${key}=${encodeURIComponent(String(value))}`)
    .join("")

  return fetchFromTMDB<MediaResponse>(`/discover/movie?${queryParams}`)
}

export const discoverTV = async (
  params: DiscoverParams = {},
): Promise<MediaResponse> => {
  const queryParams = Object.entries(params)
    .map(([key, value]) => `&${key}=${encodeURIComponent(String(value))}`)
    .join("")

  return fetchFromTMDB<MediaResponse>(`/discover/tv?${queryParams}`)
}

export const fetchMovieReviews = async (
  id: number,
): Promise<ReviewResponse> => {
  return fetchFromTMDB<ReviewResponse>(`/movie/${id}/reviews`)
}

export const fetchTVReviews = async (id: number): Promise<ReviewResponse> => {
  return fetchFromTMDB<ReviewResponse>(`/tv/${id}/reviews`)
}
