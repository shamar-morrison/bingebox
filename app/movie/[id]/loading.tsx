import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen pb-16">
      <div className="relative w-full h-[500px] md:h-[600px]">
        <div className="absolute inset-0">
          <Skeleton className="w-full h-full" />
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="container px-4">
            <div className="grid items-center gap-8 md:grid-cols-[300px_1fr]">
              <Skeleton className="hidden w-full md:block aspect-[2/3] rounded-lg" />

              <div className="space-y-4">
                <Skeleton className="h-10 w-3/4" />

                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-20" />
                </div>

                <div className="flex gap-4">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>

                <Skeleton className="h-4 w-40" />

                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>

                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-28" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

