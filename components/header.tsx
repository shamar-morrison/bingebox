"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Film, Search, Menu, Tv, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Movies", href: "/movies", icon: Film },
    { label: "TV Shows", href: "/tv", icon: Tv },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md shadow-md"
          : "bg-gradient-to-b from-background/80 to-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">BingeBox</span>
          </Link>

          <nav className="hidden md:flex">
            <ul className="flex items-center gap-6">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`text-sm font-medium transition-colors hover:text-primary ${
                      pathname === item.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[180px] pl-8 bg-secondary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <ThemeToggle />

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-5 h-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b">
                  <Link href="/" className="flex items-center gap-2">
                    <Film className="w-5 h-5 text-primary" />
                    <span className="font-semibold">BingeBox</span>
                  </Link>
                </div>

                <nav className="flex-1 py-8">
                  <form onSubmit={handleSearch} className="relative mb-6">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-full pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>

                  <ul className="space-y-4">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                              pathname === item.href ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

