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
