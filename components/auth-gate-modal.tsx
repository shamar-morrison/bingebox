"use client"

import LoginForm from "@/components/login-form"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { getSafeRedirectPath, isAuthExemptPath } from "@/lib/auth-config"
import { useUser } from "@/lib/hooks/use-user"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useMemo } from "react"

export default function AuthGateModal() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, loading } = useUser()

  const redirectTarget = useMemo(() => {
    return getSafeRedirectPath(searchParams.get("redirect"))
  }, [searchParams])

  const isOpen = !loading && !user && !isAuthExemptPath(pathname)

  const handleSuccess = () => {
    if (redirectTarget) {
      router.replace(redirectTarget)
      return
    }

    router.refresh()
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        hideCloseButton
        overlayClassName="!bg-black"
        className="bg-transparent border-none outline-none shadow-none p-0"
        onEscapeKeyDown={(event) => event.preventDefault()}
        onPointerDownOutside={(event) => event.preventDefault()}
      >
        <div className="w-full max-w-md mx-auto">
          <LoginForm onSuccess={handleSuccess} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
