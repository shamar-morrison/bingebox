"use client"

interface VidsrcPlayerProps {
  tmdbId: number
  mediaType: "movie" | "tv"
  seasonNumber?: number
  episodeNumber?: number
  title: string
}

export default function VidsrcPlayer({
  tmdbId,
  mediaType,
  seasonNumber,
  episodeNumber,
  title,
}: VidsrcPlayerProps) {

  const getEmbedUrl = () => {
    const baseUrl = "https://vidsrc.to/embed"

    if (mediaType === "movie") {
      return `${baseUrl}/movie/${tmdbId}`
    } else {
      return `${baseUrl}/tv/${tmdbId}/${seasonNumber}/${episodeNumber}`
    }
  }

  return (
    <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
      <iframe
        src={getEmbedUrl()}
        className="absolute top-0 left-0 w-full h-full border-0 rounded-lg"
        allowFullScreen
        title={title}
      ></iframe>
    </div>
  )
}
