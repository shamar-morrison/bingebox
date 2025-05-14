import { auth } from "@/lib/auth" // Adjust this path if your auth.ts is elsewhere
import { toNextJsHandler } from "better-auth/next-js"

if (!auth) {
  throw new Error(
    "Auth configuration not found. Ensure `auth` is exported from your auth file.",
  )
}

export const { POST, GET } = toNextJsHandler(auth)
