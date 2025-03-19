import { Movie } from "@/lib/yts-types"
import TorrentMovieCard from "./torrent-movie-card"

interface TorrentMovieGridProps {
  movies: Movie[]
}

export default function TorrentMovieGrid({ movies }: TorrentMovieGridProps) {
  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {movies.map((movie) => (
        <TorrentMovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
