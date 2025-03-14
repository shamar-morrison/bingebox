import { Skeleton } from "@/components/ui/skeleton"

export function VideoPlayerSkeleton() {
  return (
    <div className="container px-4">
      <div className="max-w-5xl mx-auto">
        <Skeleton className="w-full aspect-video rounded-lg" />

        <div className="mt-6 space-y-4">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}

