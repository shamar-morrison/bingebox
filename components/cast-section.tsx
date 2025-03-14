import { Card, CardContent } from "@/components/ui/card"
import type { Cast } from "@/lib/types"
import Image from "next/image"
import Link from "next/link"

interface CastSectionProps {
  cast: Cast[]
}

export default function CastSection({ cast }: CastSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {cast.map((person) => (
        <Link key={person.id} href={`/person/${person.id}`}>
          <Card className="overflow-hidden transition-all hover:scale-105 hover:shadow-md">
            <div className="relative aspect-[2/3]">
              <Image
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                    : `/placeholder.svg?height=450&width=300&text=${encodeURIComponent(person.name)}`
                }
                alt={person.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16.666vw"
              />
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium line-clamp-1">{person.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{person.character || "Unknown role"}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

