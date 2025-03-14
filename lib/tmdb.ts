import type { MediaResponse, MediaItem, VideoResponse } from "./types"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  if (!TMDB_API_KEY) {
    console.error("TMDB_API_KEY is not defined in environment variables")
    return { results: [] } as unknown as T
  }

  const url = `${TMDB_BASE_URL}${endpoint}${endpoint.includes("?") ? "&" : "?"}api_key=${TMDB_API_KEY}`

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } })

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

export const fetchTrending = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/trending/all/day")
}

export const fetchPopularMovies = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/movie/popular")
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

export const fetchTopRatedShows = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/tv/top_rated")
}

export const fetchAiringTodayShows = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/tv/airing_today")
}

export const fetchOnTheAirShows = async (): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>("/tv/on_the_air")
}

export const fetchMovieDetails = async (id: number): Promise<MediaItem> => {
  return fetchFromTMDB<MediaItem>(`/movie/${id}?append_to_response=credits,similar,videos`)
}

export const fetchTVDetails = async (id: number): Promise<MediaItem> => {
  return fetchFromTMDB<MediaItem>(`/tv/${id}?append_to_response=credits,similar,videos,seasons`)
}

export const fetchVideos = async (mediaType: string, id: number): Promise<VideoResponse> => {
  return fetchFromTMDB<VideoResponse>(`/${mediaType}/${id}/videos`)
}

export const searchMulti = async (query: string, page = 1): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(`/search/multi?query=${encodeURIComponent(query)}&page=${page}`)
}

export const searchMovies = async (query: string, page = 1): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`)
}

export const searchTV = async (query: string, page = 1): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(`/search/tv?query=${encodeURIComponent(query)}&page=${page}`)
}

export const searchPerson = async (query: string, page = 1): Promise<MediaResponse> => {
  return fetchFromTMDB<MediaResponse>(`/search/person?query=${encodeURIComponent(query)}&page=${page}`)
}

export const fetchPersonDetails = async (id: number): Promise<any> => {
  return fetchFromTMDB<any>(`/person/${id}?append_to_response=movie_credits,tv_credits`)
}

export const fetchSeasonDetails = async (tvId: number, seasonNumber: number): Promise<any> => {
  return fetchFromTMDB<any>(`/tv/${tvId}/season/${seasonNumber}`)
}

export const fetchEpisodeDetails = async (tvId: number, seasonNumber: number, episodeNumber: number): Promise<any> => {
  return fetchFromTMDB<any>(`/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`)
}

