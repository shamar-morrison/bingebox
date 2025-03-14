export default function Loading() {
  return (
    <div className="container px-4 py-24 mt-16">
      <div className="h-8 w-40 bg-muted rounded animate-pulse mb-8" />
      <div className="h-12 bg-muted rounded animate-pulse mb-8" />
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array(10)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="w-full aspect-[2/3] bg-muted rounded-lg animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          ))}
      </div>
    </div>
  )
}

