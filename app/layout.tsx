import type { Metadata } from "next"
import { Inter } from "next/font/google"
import NextTopLoader from "nextjs-toploader"
import type React from "react"
import { Toaster } from "sonner"
import "./globals.css"

import Footer from "@/components/footer"
import Header from "@/components/header"
import ScrollToTop from "@/components/scroll-to-top"
import { ThemeProvider } from "@/components/theme-provider"
import { UserProvider } from "@/lib/hooks/use-user"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BingeBox",
  description: "Watch your favorite movie and TV shows",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
              <Header />
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </UserProvider>
        </ThemeProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  )
}
