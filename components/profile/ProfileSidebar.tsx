"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const sidebarNavItems = [
  {
    title: "Watching",
    href: "/profile?list=watching",
    param: "watching",
  },
  {
    title: "Should Watch",
    href: "/profile?list=should-watch",
    param: "should-watch",
  },
  {
    title: "Dropped",
    href: "/profile?list=dropped",
    param: "dropped",
  },
]

type ProfileSidebarProps = React.HTMLAttributes<HTMLElement>

export function ProfileSidebar({ className, ...props }: ProfileSidebarProps) {
  const searchParams = useSearchParams()
  const currentList = searchParams.get("list") || "watching" // Default to 'watching'

  return (
    <nav
      className={cn(
        "flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
        className,
      )}
      {...props}
    >
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium",
            "hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            currentList === item.param
              ? "bg-accent text-accent-foreground"
              : "bg-transparent text-muted-foreground",
            "transition-colors duration-150 ease-in-out",
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
