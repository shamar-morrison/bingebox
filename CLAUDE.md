# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Setup

Required environment variables in `.env.local`:

```bash
TMDB_API_KEY=your_tmdb_api_key                    # Get from https://www.themoviedb.org/documentation/api
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key       # Supabase anonymous key
```

## Architecture Overview

### Application Structure

BingeBox is a Next.js 14 App Router application for streaming movies, TV shows, anime, and live sports. The app supports both anonymous and authenticated users with progressive enhancement.

**App Router Layout:**
- `/app/page.tsx` - Home page with trending content
- `/app/movie/[id]` - Movie details and streaming
- `/app/tv/[id]` - TV show details
- `/app/watch/movie/[id]` - Movie player page
- `/app/watch/tv/[id]/season/[seasonNumber]/episode/[episodeNumber]` - TV episode player
- `/app/sports` - Live sports streaming
- `/app/torrents` - Torrent downloads via YTS
- `/app/discover` - Content discovery with filters
- `/app/search` - Multi-search (movies, TV, people)

### Data Fetching Architecture

The app aggregates data from three main external APIs:

1. **TMDB API** (`lib/tmdb.ts`):
   - Primary source for movie/TV metadata, cast, reviews, videos
   - All functions use a centralized `fetchFromTMDB` wrapper with ISR caching
   - Default revalidation: 1 hour (3600s), varies by endpoint
   - Examples: `fetchMovieDetails`, `fetchTVDetails`, `searchMulti`, `discoverMovies`

2. **YTS API** (`lib/yts.ts`):
   - Torrent data for movie downloads
   - Proxied through `/app/api/yts` to avoid CORS and hide API calls
   - Includes `createMagnetLink` utility for generating magnet URIs

3. **Streamed.su API** (`lib/streamed.ts`):
   - Live sports streaming data (matches, schedules, streams)
   - Provides multi-source streams for various sports
   - Examples: `fetchSportMatches`, `fetchStreams`, `fetchLiveMatches`

### Video Player Integration

The app uses **VidLink.pro** as the embedded video player. Communication happens via `postMessage` API:

```typescript
// Player sends progress updates to parent window
window.addEventListener("message", (event) => {
  if (event.origin !== "https://vidlink.pro") return
  if (event.data?.type === "MEDIA_DATA") {
    // Handle progress data: watched_seconds, duration, episode info
  }
})
```

Player components:
- `components/vidsrc-player.tsx` - Main video player wrapper
- `components/sports-player.tsx` - Sports stream player

### Authentication & User Management

**Supabase Authentication:**
- Client-side: `lib/supabase/client.ts` creates browser client
- Server-side: `lib/supabase/server.ts` for server components
- Middleware: `middleware.ts` handles auth state and protected routes

**"Remember Me" Feature:**
- Controlled via `lib/hooks/use-remember-me.ts`
- When enabled: uses localStorage for persistent sessions
- When disabled: uses sessionStorage, session expires on browser close
- Preference stored in `supabase-remember-me` cookie/localStorage

**Protected Routes:**
- Configured in `lib/auth-config.ts` via `isProtectedRoute()`
- Middleware redirects unauthenticated users to `/login?redirect=[original-path]`

### Watch Progress Tracking System

**Critical Feature:** Cross-device continue watching with localStorage + database sync.

**Architecture:**
1. **Anonymous users:** Progress stored only in localStorage
2. **Authenticated users:**
   - Immediate save to localStorage (no delay)
   - Debounced sync to Supabase database (2-second delay)
   - Cross-device synchronization
3. **Sign-in flow:** Merges localStorage data into user account
4. **Sign-out flow:** Syncs final progress, preserves localStorage

**Key Hooks:**
- `lib/hooks/use-vidlink-progress.ts` - Primary interface for player progress
- `lib/hooks/use-watch-progress-sync.ts` - Handles database synchronization
- `lib/hooks/use-watch-progress-manager.ts` - High-level operations (clear, merge)

**Database Table:** `watch_progress`
- Fields: `user_id`, `media_id`, `media_type`, `watched_seconds`, `duration_seconds`
- TV-specific: `last_season_watched`, `last_episode_watched`, `show_progress` (JSONB)
- RLS policies ensure users only access their own data

**API Endpoint:** `/app/api/save-progress/route.ts`
- Handles `sendBeacon` requests during page unload for reliable saving
- Accepts batch progress updates

**See CONTINUE_WATCHING_SYNC.md for detailed implementation documentation.**

### Progressive Web App (PWA)

The app is configured as a PWA with offline support:

- Manifest: `/public/manifest.json` (standalone mode, portrait)
- Service Worker: `/public/sw.js` (caches assets, provides offline page)
- Install prompt: `components/pwa-prompt.tsx` (custom install UI)
- Theme color: `#e11d48` (rose-600)
- Offline fallback: `/app/offline/page.tsx`

**See PWA_SETUP.md for setup documentation.**

### UI Components

Built with **shadcn/ui** (Radix UI primitives + Tailwind CSS):
- Components in `components/ui/` (button, dialog, dropdown, etc.)
- Theme system via `next-themes` with dark mode default
- CSS variables in `app/globals.css` for theming
- Animations via `tailwindcss-animate`

**Key Feature Components:**
- `components/featured-media.tsx` - Hero section with random trending media
- `components/continue-watching-row.tsx` - Resume watching carousel
- `components/media-row.tsx` / `components/media-grid.tsx` - Content display
- `components/header.tsx` - Navigation with user auth, search, theme toggle
- `components/download-modal.tsx` - Torrent download interface
- `components/watchlist-dropdown.tsx` - Saved items management

### API Route Patterns

API routes in `/app/api/` act as proxies and serverless functions:

```
/api/yts          → Proxy to YTS API (avoids CORS)
/api/sports       → Proxy to Streamed.su API
/api/save-progress → Save watch progress during page unload
/api/auth/*       → Supabase auth callbacks
/api/download     → Generate download links
```

## Key Development Patterns

### Server Components by Default
- Most pages are Server Components (no "use client")
- Client interactivity isolated to specific components
- Use Suspense boundaries for loading states

### Data Fetching with ISR
```typescript
// Next.js 14 pattern with fetch cache
const response = await fetch(url, {
  next: { revalidate: 3600 } // ISR: revalidate every hour
})
```

### Client-Server Communication
```typescript
// Client component needs auth state
"use client"
import { useUser } from "@/lib/hooks/use-user"

// Server component needs auth
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

### Styling Conventions
- Use Tailwind utility classes
- Responsive design: mobile-first breakpoints
- Dark mode: `dark:` prefix automatically applied via theme provider
- Component variants: use `class-variance-authority` (cva)

### Type Safety
- TypeScript strict mode enabled
- TMDB types in `lib/types.ts`
- YTS types in `lib/yts-types.ts`
- Supabase types auto-generated in `lib/supabase/database.types.ts`

## Important Notes

### VidLink Player Limitations
- Player iframe must be from `https://vidlink.pro` or `https://vidsrc.pro`
- Communication is one-way: player → parent (via postMessage)
- No programmatic control of player state (play/pause/seek)

### Sports Streaming Sources
- Sports streams require the Streamed.su API (`lib/streamed.ts`)
- Each match may have multiple sources/streams
- Streams include language, HD flag, and embed URL

### Torrent Downloads
- YTS API provides movie torrents only (no TV shows)
- Magnet links generated client-side via `createMagnetLink()`
- Includes common public trackers for DHT fallback

### Performance Optimizations
- TMDB responses cached via Next.js ISR
- Images use Next.js Image component with TMDB CDN
- Lucide icons optimized via `optimizePackageImports` in next.config

### Security Considerations
- Supabase RLS policies protect user data
- Protected routes enforced in middleware
- No API keys exposed client-side (proxied through API routes)
- `disable-devtool` package prevents dev tools in production

## Tech Stack Summary

- **Framework:** Next.js 14.2 (App Router, React 18, TypeScript 5)
- **Styling:** Tailwind CSS 3.4, shadcn/ui, CVA
- **State:** React hooks, Context API (user state)
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth (email/password, OAuth)
- **APIs:** TMDB, YTS, Streamed.su
- **Icons:** Lucide React
- **Deployment:** Vercel (analytics + speed insights included)
- **PWA:** Service Worker, Web App Manifest
