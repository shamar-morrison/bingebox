"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/context/AuthContext"
import authClient from "@/lib/auth-client"
import { usePathname, useRouter } from "next/navigation"

export function AuthStatus() {
  const router = useRouter()
  const pathname = usePathname()
  const { authState, setAuthState, isLoading } = useAuth()

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      setAuthState(null)
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Sign out failed:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  if (authState.user) {
    const userName = authState.user.name || authState.user.email || "User"
    const userInitial = (authState.user.name || authState.user.email || "U")
      .charAt(0)
      .toUpperCase()

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              {authState.user.image ? (
                <AvatarImage src={authState.user.image} alt={userName} />
              ) : null}
              <AvatarFallback>{userInitial}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{userName}</p>
              {authState.user.email && (
                <p className="text-xs leading-none text-muted-foreground">
                  {authState.user.email}
                </p>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      onClick={() => {
        const redirectQuery = pathname
          ? `?redirect=${encodeURIComponent(pathname)}`
          : ""
        router.push(`/login${redirectQuery}`)
      }}
    >
      Log In
    </Button>
  )
}
