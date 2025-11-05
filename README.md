
[<img width="1200" height="630" alt="media_card_og" src="https://github.com/user-attachments/assets/0b544935-f136-4cef-b5b6-f421982c948a" />](https://bingebox-bay.vercel.app)


# BingeBox

BingeBox is a Next.js application for browsing and streaming Movies, Anime & TV Shows. It allows users to discover, search, and find information about various media content.

## Features

- Stream movies, anime and tv shows
- Search for specific titles
- View details about movies, TV shows, and cast members
- Discover new content based on categories and various filters
- Find torrents for media content

## Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
TMDB_API_KEY=your_tmdb_api_key
```

You'll need to register for an API key from [The Movie Database (TMDB)](https://www.themoviedb.org/documentation/api).

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/bingebox.git
cd bingebox
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - accessible UI components
- [TMDB API](https://www.themoviedb.org/documentation/api) - Movie and TV show data
- [YTS API](https://yts.mx/api) - Torrents data

## Building for Production

```bash
npm run build
npm run start
# or
yarn build
yarn start
```

