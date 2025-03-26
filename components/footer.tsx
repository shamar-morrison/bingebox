import { Film } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="py-6 border-t bg-card">
      <div className="container px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold">BingeBox</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your ultimate destination for movies and TV shows.
            </p>
          </div>

          <div className="md:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="mb-3 text-sm font-semibold">Navigation</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/movie"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Movies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tv"
                    className="text-muted-foreground hover:text-primary"
                  >
                    TV Shows
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Search
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Categories</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/movie/popular"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Popular Movies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/movie/top-rated"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Top Rated Movies
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tv/popular"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Popular TV Shows
                  </Link>
                </li>
                <li>
                  <Link
                    href="/tv/top-rated"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Top Rated TV Shows
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/report-bug"
                    className="text-muted-foreground hover:text-primary"
                  >
                    Report a Bug
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between pt-8 mt-8 border-t sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} BingeBox. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <p className={"text-xs text-muted-foreground"}>Contact Us</p>
          </div>
        </div>

        <div className="mt-8 text-xs text-center text-muted-foreground">
          This site does not store any files on our server, we only linked to
          the media which is hosted on 3rd party services.
        </div>
      </div>
    </footer>
  )
}
