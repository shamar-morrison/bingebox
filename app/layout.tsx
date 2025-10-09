import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import NextTopLoader from "nextjs-toploader"
import type React from "react"
import { Suspense } from "react"
import { Toaster } from "sonner"
import "./globals.css"

import DevToolProtection from "@/components/dev-tool-protection"
import Footer from "@/components/footer"
import Header from "@/components/header"
import PWAPrompt from "@/components/pwa-prompt"
import ScrollToTop from "@/components/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/lib/hooks/use-user"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://bingebox-bay.vercel.app"),
  title: "BingeBox",
  description:
    "Discover and watch your favorite movies and TV shows online. Stream the latest releases, popular series, and classic films all in one place.",
  keywords: [
    "movies",
    "tv shows",
    "entertainment",
    "streaming",
    "watch",
    "live",
    "sports",
    "download",
  ],
  authors: [{ name: "BingeBox Team" }],
  creator: "BingeBox",
  robots: "index, follow",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BingeBox",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bingebox-bay.vercel.app",
    siteName: "BingeBox",
    title: "BingeBox - Watch Movies and TV Shows for Free",
    description:
      "Discover and watch your favorite movies and TV shows online. Stream the latest releases, popular series, and classic films all in one place.",
    images: [
      {
        url: "/media_card_og.png",
        width: 1200,
        height: 630,
        alt: "BingeBox - Watch your favorite movies and shows for free",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BingeBox - Watch Movies and TV Shows for Free",
    description:
      "Discover and watch your favorite movies and TV shows online. Stream the latest releases, popular series, and classic films all in one place.",
    images: ["/media_card_og.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  other: {
    "application-name": "BingeBox",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "BingeBox",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#e11d48",
    "msapplication-tap-highlight": "no",
  },
}

export const viewport: Viewport = {
  themeColor: "#e11d48",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="BingeBox" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#e11d48" />
        <meta
          property="og:image"
          content="https://bingebox-bay.vercel.app/media_card_og.png"
        />
        <meta
          property="og:image:secure_url"
          content="https://bingebox-bay.vercel.app/media_card_og.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta
          name="twitter:image"
          content="https://bingebox-bay.vercel.app/media_card_og.png"
        />
      </head>
      <body className={inter.className}>
        <NextTopLoader color="#e11d48" showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <UserProvider>
            <div className="flex flex-col min-h-screen">
              <ScrollToTop />
              <Suspense fallback={<HeaderSkeleton />}>
                <Header />
              </Suspense>
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <PWAPrompt />
            <DevToolProtection />
          </UserProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}

function HeaderSkeleton() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md shadow-md">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded" />
            <span className="text-xl font-bold">BingeBox</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[220px] h-10 bg-muted rounded hidden lg:block" />
          <div className="w-10 h-10 bg-muted rounded" />
        </div>
      </div>
    </header>
  )
}
