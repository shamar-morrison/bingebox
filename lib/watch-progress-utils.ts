import type {
  MediaItem,
  VidLinkProgressData,
} from "@/lib/hooks/use-vidlink-progress"
import type { Tables } from "@/lib/supabase/database.types"

export type WatchProgressRow = Tables<"watch_progress">
export type WatchProgressInsert = Omit<
  WatchProgressRow,
  "id" | "created_at" | "updated_at"
>

/**
 * Convert a single MediaItem from VidLink format to database format
 */
export function convertItemToDbFormat(
  item: MediaItem,
  userId: string,
): WatchProgressInsert {
  return {
    user_id: userId,
    media_id: String(item.id),
    media_type: item.type,
    title: item.title,
    poster_path: item.poster_path || null,
    backdrop_path: item.backdrop_path || null,
    watched_seconds: item.progress?.watched || 0,
    duration_seconds: item.progress?.duration || 0,
    last_season_watched: item.last_season_watched || null,
    last_episode_watched: item.last_episode_watched || null,
    show_progress: (item.show_progress || {}) as any,
  }
}

/**
 * Convert multiple MediaItems from VidLink format to database format
 */
export function convertToDbFormat(
  progressData: VidLinkProgressData,
  userId: string,
): WatchProgressInsert[] {
  return Object.values(progressData).map((item) =>
    convertItemToDbFormat(item, userId),
  )
}

/**
 * Convert database rows to VidLink format
 */
export function convertToVidLinkFormat(
  dbData: WatchProgressRow[],
): VidLinkProgressData {
  const result: VidLinkProgressData = {}

  dbData.forEach((item) => {
    result[item.media_id] = {
      id: item.media_id,
      type: item.media_type as "movie" | "tv" | "anime",
      title: item.title,
      poster_path: item.poster_path || undefined,
      backdrop_path: item.backdrop_path || undefined,
      progress: {
        watched: item.watched_seconds,
        duration: item.duration_seconds,
      },
      last_season_watched: item.last_season_watched || undefined,
      last_episode_watched: item.last_episode_watched || undefined,
      show_progress: (item.show_progress as Record<string, any>) || {},
      last_updated: new Date(item.updated_at || "").getTime(),
    }
  })

  return result
}
