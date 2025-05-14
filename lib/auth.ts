import { betterAuth } from "better-auth"
import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET environment variable is not set")
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  basePath: "/api/auth", // This is the default, ensure it matches your API route
  emailAndPassword: {
    enabled: true,
    // You can add more configurations here if needed, e.g., email verification
  },
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  // Add other providers or plugins here if you need them later
  // e.g., socialProviders: { google: { clientId: "...", clientSecret: "..." } }
})

// Infer types for client-side usage
export type AuthSessionData = typeof auth.$Infer.Session.session
export type AuthUserData = typeof auth.$Infer.Session.user
