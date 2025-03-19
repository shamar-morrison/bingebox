import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Torrents | BingeBox - Download Movies via Torrents",
  description: "Browse and download movies via torrents from YTS (YIFY)",
}

export default function TorrentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <>{children}</>
}
