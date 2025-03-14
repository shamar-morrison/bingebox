import Link from "next/link"
import { Film, Github, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-6 border-t bg-card">
      <div className="container px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold">StreamFlix</span>
            </Link>
            <p className="text-sm text-muted-foreground">Your ultimate destination for movies and TV shows.</p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="mb-3 text-sm font-semibold">Navigation</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-muted-foreground hover:text-primary">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/movies" className="text-muted-foreground hover:text-primary">
                    Movies
                  </Link>
                </li>
                <li>
                  <Link href="/tv" className="text-muted-foreground hover:text-primary">
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link href="/search" className="text-muted-foreground hover:text-primary">
                    Search
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Categories</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/movies/popular" className="text-muted-foreground hover:text-primary">
                    Popular Movies
                  </Link>
                </li>
                <li>
                  <Link href="/movies/top-rated" className="text-muted-foreground hover:text-primary">
                    Top Rated Movies
                  </Link>
                </li>
                <li>
                  <Link href="/tv/popular" className="text-muted-foreground hover:text-primary">
                    Popular TV Shows
                  </Link>
                </li>
                <li>
                  <Link href="/tv/top-rated" className="text-muted-foreground hover:text-primary">
                    Top Rated TV Shows
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} StreamFlix. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link href="https://github.com" className="text-muted-foreground hover:text-primary">
              <Github className="w-4 h-4" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-primary">
              <Twitter className="w-4 h-4" />
              <span className="sr-only">Twitter</span>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-xs text-center text-muted-foreground">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </div>
      </div>
    </footer>
  )
}

