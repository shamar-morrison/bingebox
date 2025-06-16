// Movie download response types
export interface MovieDownloadResponse {
  downloadLink: string
  subtitleLink: string
  movieTitle: string
  releaseYear: string
}

// TV show download response types
export interface TVDownloadResponse {
  downloadLink: string
  subtitleLink: string
  showTitle: string
  season: string
  episode: string
}

// Union type for all download responses
export type DownloadResponse = MovieDownloadResponse | TVDownloadResponse

// Legacy types (keeping for backward compatibility if needed)
export interface DownloadResponseVidZee {
  code: number
  message: string
  data: Data
}

export interface Data {
  downloads: Download[]
  captions: Caption[]
  limited: boolean
  limitedCode: string
  freeNum: number
  hasResource: boolean
}

export interface Caption {
  id: string
  lan: string
  lanName: string
  url: string
  size: string
  delay: number
}

export interface Download {
  id: string
  url: string
  resolution: number
  size: string
}
