import MediaCard from "@/components/media-card"
import type { MediaItem } from "@/lib/types"

export default function MediaRow({ items }: { items: MediaItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8">
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  )
}
