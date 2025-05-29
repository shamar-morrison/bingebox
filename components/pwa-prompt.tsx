"use client"

import { Button } from "@/components/ui/button"
import { Download, RefreshCw, X } from "lucide-react"
import { useEffect, useState } from "react"

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed"
    platform: string
  }>
  prompt(): Promise<void>
}

const PWA_DISMISSED_KEY = "pwa-prompt-dismissed"
const PWA_DISMISSED_TIMESTAMP_KEY = "pwa-prompt-dismissed-timestamp"

// Show prompt again after 30 days if dismissed
const DISMISS_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds

// Helper functions for robust storage
const setStorageItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.warn("localStorage not available, using sessionStorage fallback")
    try {
      sessionStorage.setItem(key, value)
      return true
    } catch (_sessionError) {
      console.warn("Both localStorage and sessionStorage unavailable")
      return false
    }
  }
}

const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key)
  } catch (error) {
    console.warn("Storage not available")
    return null
  }
}

const removeStorageItem = (key: string) => {
  try {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  } catch (error) {
    console.warn("Storage not available for removal")
  }
}

export default function PWAPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    // Register service worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered")

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New content is available, show update prompt
                  setWaitingWorker(newWorker)
                  setShowUpdatePrompt(true)
                }
              })
            }
          })

          // Listen for messages from service worker
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data && event.data.type === "SW_UPDATED") {
              console.log("Service Worker updated:", event.data.message)
            }
          })
        })
        .catch(() => console.log("Service Worker registration failed"))
    }

    const checkDismissalStatus = () => {
      const dismissed = getStorageItem(PWA_DISMISSED_KEY)
      const dismissedTimestamp = getStorageItem(PWA_DISMISSED_TIMESTAMP_KEY)

      if (dismissed === "true" && dismissedTimestamp) {
        const dismissedTime = parseInt(dismissedTimestamp)
        const now = Date.now()

        // If less than 30 days have passed since dismissal, don't show prompt
        if (now - dismissedTime < DISMISS_DURATION) {
          return true
        } else {
          // Clear old dismissal after 30 days
          removeStorageItem(PWA_DISMISSED_KEY)
          removeStorageItem(PWA_DISMISSED_TIMESTAMP_KEY)
        }
      }

      return false
    }

    // Handle PWA install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()

      // Only show if user hasn't dismissed recently
      if (!checkDismissalStatus()) {
        setDeferredPrompt(e)
        setShowInstallPrompt(true)
      }
    }

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    )

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      )
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      // Clear dismissal status if user accepts
      removeStorageItem(PWA_DISMISSED_KEY)
      removeStorageItem(PWA_DISMISSED_TIMESTAMP_KEY)
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    } else if (outcome === "dismissed") {
      // User dismissed the browser prompt, hide our prompt too
      handleDismiss()
    }
  }

  const handleDismiss = () => {
    // Remember that user dismissed the prompt
    setStorageItem(PWA_DISMISSED_KEY, "true")
    setStorageItem(PWA_DISMISSED_TIMESTAMP_KEY, Date.now().toString())

    setShowInstallPrompt(false)
    setDeferredPrompt(null)
  }

  const handleUpdateClick = () => {
    if (waitingWorker) {
      // Tell the waiting service worker to skip waiting and become active
      waitingWorker.postMessage({ type: "SKIP_WAITING" })
      setShowUpdatePrompt(false)
      // Reload the page to get the new content
      window.location.reload()
    }
  }

  const handleUpdateDismiss = () => {
    setShowUpdatePrompt(false)
  }

  // Show update prompt if available
  if (showUpdatePrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50 max-w-sm mx-auto">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Update Available</h3>
            <p className="text-xs text-muted-foreground mt-1">
              A new version of BingeBox is available. Update now to get the
              latest features and improvements.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUpdateDismiss}
            className="h-8 w-8 p-0 shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          <Button onClick={handleUpdateClick} size="sm" className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Update Now
          </Button>
          <Button variant="outline" onClick={handleUpdateDismiss} size="sm">
            Later
          </Button>
        </div>
      </div>
    )
  }

  // Show install prompt if not already installed and not dismissed
  if (!showInstallPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-background border border-border rounded-lg p-4 shadow-lg z-50 max-w-sm mx-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">Install BingeBox</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add BingeBox to your home screen for quick access to your favorite
            movies and TV shows.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-8 w-8 p-0 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button onClick={handleInstallClick} size="sm" className="flex-1">
          <Download className="h-4 w-4 mr-2" />
          Install
        </Button>
        <Button variant="outline" onClick={handleDismiss} size="sm">
          Not now
        </Button>
      </div>
    </div>
  )
}
