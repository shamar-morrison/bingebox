import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function Loading() {
  return (
    <div className="min-h-screen">
      <div className="container px-4 py-24 mt-16">
        <div className="flex items-center justify-between mb-8">
          <Skeleton className="h-8 w-32" />
        </div>

        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-6 w-1/4 mt-2" />
          </div>

          <div className="grid gap-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Card key={i}>
                  <CardHeader className="p-4">
                    <Skeleton className="h-6 w-1/3" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full mt-2" />
                    <Skeleton className="h-4 w-2/3 mt-2" />
                    <Skeleton className="h-10 w-32 mt-4" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

