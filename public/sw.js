const CACHE_NAME = "bingebox-v2"
const STATIC_CACHE = "static-v2"
const DYNAMIC_CACHE = "dynamic-v2"

const STATIC_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Install event
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...")
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("Caching static assets...")
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log("Service Worker installed, skipping waiting...")
        return self.skipWaiting()
      }),
  )
})

// Activate event
self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        console.log("Cleaning up old caches...")
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log("Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => {
        console.log("Service Worker activated, claiming clients...")
        return self.clients.claim()
      })
      .then(() => {
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: "SW_UPDATED",
              message: "Service Worker updated successfully",
            })
          })
        })
      }),
  )
})

// Fetch event with improved caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle same-origin requests
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response
          }

          const responseToCache = response.clone()

          // Cache navigation requests and API calls
          if (request.mode === "navigate" || request.url.includes("/api/")) {
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseToCache)
            })
          }

          return response
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }

            if (request.mode === "navigate") {
              return caches.match("/offline")
            }
          })
        }),
    )
  }
})

// Listen for messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("Received SKIP_WAITING message")
    self.skipWaiting()
  }
})
