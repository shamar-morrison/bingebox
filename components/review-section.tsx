"use client"

import { format } from "date-fns"
import { Star } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Review } from "@/lib/types"

interface ReviewSectionProps {
  reviews: Review[]
}

export default function ReviewSection({ reviews }: ReviewSectionProps) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="flex flex-row items-start gap-4 space-y-0">
            <Avatar>
              {review.author_details.avatar_path ? (
                <AvatarImage
                  src={`https://image.tmdb.org/t/p/w45${review.author_details.avatar_path}`}
                  alt={review.author}
                />
              ) : null}
              <AvatarFallback>
                {review.author
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{review.author}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    @{review.author_details.username} •{" "}
                    {format(new Date(review.created_at), "PP")}
                  </p>
                </div>
                {review.author_details.rating && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span>{review.author_details.rating} / 10</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Separator className="my-4" />
            {/* Render review content safely, handling potential markdown/HTML */}
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: review.content }}
            />
            {/* TODO: Consider using a markdown parser for better safety and rendering */}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
