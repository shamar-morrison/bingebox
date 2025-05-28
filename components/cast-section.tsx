import { Card, CardContent } from "@/components/ui/card"
import type { Cast } from "@/lib/types"
import { User } from "lucide-react"
import Link from "next/link"

interface CastSectionProps {
  cast: Cast[]
}

export default function CastSection({ cast }: CastSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {cast.map((person) => (
        <Link key={person.id} href={`/person/${person.id}`}>
          <Card className="overflow-hidden group">
            <div className="relative aspect-[2/3] overflow-hidden">
              <img
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                    : ``
                }
                alt={person.name}
                className="object-cover transition-all group-hover:scale-105 group-hover:opacity-75 absolute top-0 left-0 w-full h-full"
              />
              {!person.profile_path && (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <User className="h-10 w-10 text-muted-foreground transition-all group-hover:scale-105 group-hover:opacity-75" />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium line-clamp-1">{person.name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {person.character || "Unknown role"}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
