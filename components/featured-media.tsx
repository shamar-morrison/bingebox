import { fetchTrending } from "@/lib/tmdb"
import type { MediaItem } from "@/lib/types"
import FeaturedMediaClient from "@/components/featured-media-client"

async function fetchTitleImage(id: number, mediaType: string) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY
  const url = `https://api.themoviedb.org/3/${mediaType}/${id}/images?api_key=${TMDB_API_KEY}`
  const response = await fetch(url)
  if (!response.ok) return null
  const data = await response.json()
  const logos = data.logos || []
  if (logos.length === 0) return null
  const preferredLanguageLogos = logos.filter(
    (logo: any) => logo.iso_639_1 === "en" || !logo.iso_639_1,
  )
  const logosToConsider =
    preferredLanguageLogos.length > 0 ? preferredLanguageLogos : logos
  const rectangularLogos = logosToConsider.filter((logo: any) => {
    if (!logo.width || !logo.height) return false
    const aspectRatio = logo.width / logo.height
    return aspectRatio >= 1.5
  })
  const suitableLogo =
    rectangularLogos.length > 0 ? rectangularLogos[0] : logosToConsider[0]
  if (!suitableLogo?.file_path) return null
  const isRectangular =
    rectangularLogos.length > 0 && rectangularLogos.includes(suitableLogo)
  return {
    path: `https://image.tmdb.org/t/p/w500${suitableLogo.file_path}`,
    isRectangular,
  }
}

function getDeterministicIndex(length: number) {
  // Use the current day as a seed so the featured media is stable for a day
  const now = new Date()
  const seed =
    now.getUTCFullYear() * 10000 +
    (now.getUTCMonth() + 1) * 100 +
    now.getUTCDate()
  return seed % length
}

export default async function FeaturedMedia() {
  const trending = await fetchTrending()
  const filtered = trending.results
    .slice(0, 10)
    .filter(
      (item): item is MediaItem & { media_type: string } => !!item.media_type,
    )
  if (filtered.length === 0) return null
  const index = getDeterministicIndex(filtered.length)
  const featured = filtered[index]
  const titleImageInfo = await fetchTitleImage(featured.id, featured.media_type)
  return (
    <FeaturedMediaClient featured={featured} titleImageInfo={titleImageInfo} />
  )
}
